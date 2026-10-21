// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Production URL: used for canonical links, Open Graph URLs and the sitemap
  site: 'https://isaacitservices.com',
  // Pages are built as folder/index.html, so canonical URLs end in a slash
  trailingSlash: 'always',
  redirects: {
    '/home': '/',
  },

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});