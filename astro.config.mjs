import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { ROUTE_PAIRS } from './src/content/site.ts';

const ORIGIN = 'https://kacper.biz';
const toPath = (url) => new URL(url).pathname.replace(/\/$/, '') || '/';
const abs = (p) => (p === '/' ? `${ORIGIN}/` : `${ORIGIN}${p}`);

export default defineConfig({
  site: ORIGIN,
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: false,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/lab'),
      // PL and EN slugs differ, so pair them explicitly (hreflang in the sitemap must match the on-page tags).
      serialize(item) {
        const path = toPath(item.url);
        const pair = ROUTE_PAIRS.find((r) => r.pl === path || r.en === path);
        if (pair) {
          item.links = [
            { url: abs(pair.pl), lang: 'pl-PL' },
            { url: abs(pair.en), lang: 'en' },
            { url: abs(pair.pl), lang: 'x-default' },
          ];
        }
        return item;
      },
    }),
  ],
  vite: { build: { chunkSizeWarningLimit: 700 } },
});
