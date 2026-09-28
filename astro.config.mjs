import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kacper.biz',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: false,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/lab'),
      i18n: { defaultLocale: 'pl', locales: { pl: 'pl-PL', en: 'en' } },
    }),
  ],
  vite: {
    build: { chunkSizeWarningLimit: 700 },
  },
});
