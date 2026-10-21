// Cloudflare Worker entry. Serves the static Astro build from ./dist and handles
// POST /api/contact: validates the form, checks Turnstile, stores the response in D1,
// then mirrors it to Google Sheets (via Apps Script) in the background.

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DB: D1Database;
  TURNSTILE_SECRET_KEY: string;
  SHEETS_WEBHOOK_URL?: string;
  SHEETS_WEBHOOK_SECRET?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

interface Submission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const LIMITS = { name: 120, email: 254, subject: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const field = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

function validate(form: FormData): Submission | string {
  const data: Submission = {
    name: field(form, 'name'),
    email: field(form, 'email'),
    subject: field(form, 'subject'),
    message: field(form, 'message'),
  };

  if (!data.name || !data.email || !data.subject) return 'Please fill in your name, email and subject.';
  if (!EMAIL_RE.test(data.email)) return 'Please enter a valid email address.';
  for (const key of Object.keys(LIMITS) as (keyof Submission)[]) {
    if (data[key].length > LIMITS[key]) return `Your ${key} is too long.`;
  }
  return data;
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const result = (await res.json()) as { success: boolean };
  return result.success === true;
}

async function syncToSheets(env: Env, id: number, createdAt: string, data: Submission): Promise<void> {
  if (!env.SHEETS_WEBHOOK_URL || !env.SHEETS_WEBHOOK_SECRET) return;

  let error: string | null = null;
  try {
    const res = await fetch(env.SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.SHEETS_WEBHOOK_SECRET, id, createdAt, ...data }),
    });
    const result = (await res.json().catch(() => ({}))) as { status?: string; message?: string };
    if (!res.ok || result.status !== 'success') {
      error = result.message || `Apps Script responded with HTTP ${res.status}`;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  await env.DB.prepare('UPDATE contact_submissions SET sheets_synced = ?, sheets_error = ? WHERE id = ?')
    .bind(error ? 0 : 1, error, id)
    .run();
}

async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ status: 'error', message: 'Invalid request.' }, 400);
  }

  // Honeypot: real visitors never see this field, so pretend success for bots.
  if (field(form, 'website')) return json({ status: 'success' });

  const ip = request.headers.get('CF-Connecting-IP');
  const human = await verifyTurnstile(field(form, 'cf-turnstile-response'), env.TURNSTILE_SECRET_KEY, ip);
  if (!human) return json({ status: 'error', message: 'Spam check failed. Please try again.' }, 403);

  const data = validate(form);
  if (typeof data === 'string') return json({ status: 'error', message: data }, 400);

  const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? null;
  const userAgent = request.headers.get('User-Agent')?.slice(0, 500) ?? null;

  let row: { id: number; created_at: string } | null;
  try {
    row = await env.DB.prepare(
      `INSERT INTO contact_submissions (name, email, subject, message, ip, country, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING id, created_at`,
    )
      .bind(data.name, data.email, data.subject, data.message, ip, country, userAgent)
      .first<{ id: number; created_at: string }>();
  } catch (err) {
    console.error('D1 insert failed', err);
    return json({ status: 'error', message: 'Could not save your message. Please try again.' }, 500);
  }
  if (!row) return json({ status: 'error', message: 'Could not save your message. Please try again.' }, 500);

  ctx.waitUntil(syncToSheets(env, row.id, row.created_at, data));

  return json({ status: 'success' });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ status: 'error', message: 'Method not allowed.' }, 405);
      return handleContact(request, env, ctx);
    }
    if (pathname.startsWith('/api/')) return json({ status: 'error', message: 'Not found.' }, 404);

    return env.ASSETS.fetch(request);
  },
};
