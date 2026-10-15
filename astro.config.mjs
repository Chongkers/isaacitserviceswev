// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production URL: used for canonical links, Open Graph URLs and the sitemap
  site: 'https://isaacitservices.com',
  redirects: {
    '/home': '/',
  },

  integrations: [sitemap()],
});