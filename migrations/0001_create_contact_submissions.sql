-- Contact form responses. D1 is the source of truth; Google Sheets is a mirror.
CREATE TABLE IF NOT EXISTS contact_submissions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL,
  subject       TEXT    NOT NULL,
  message       TEXT    NOT NULL DEFAULT '',
  ip            TEXT,
  country       TEXT,
  user_agent    TEXT,
  sheets_synced INTEGER NOT NULL DEFAULT 0,  -- 1 once the row has been appended to Google Sheets
  sheets_error  TEXT                         -- last sync error, if any
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_unsynced  ON contact_submissions (sheets_synced) WHERE sheets_synced = 0;
