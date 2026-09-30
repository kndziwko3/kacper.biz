#!/usr/bin/env node
/**
 * Brand assets committed to public/ (run once after the stills change, not at build time):
 *   public/favicon.svg, apple-touch-icon.png (180), icon-192.png, icon-512.png
 *   public/og/{home,about,outreachpilot,fastlanding,work,contact}[-en].png  (1200x630)
 *
 * Cards are the studio: the page's still (public/stills, rendered from the film) on the right, Funnel on the left.
 * Usage: node scripts/og.mjs [--only home,about] [--no-icons] [--preview out.png]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const only = opt('only')?.split(',') ?? null;
const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CHROME = process.env.CHROMIUM_PATH ?? (fs.existsSync(MAC_CHROME) ? MAC_CHROME : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome');

const C = { studio: '#0e0c0a', text: '#ede6da', text2: '#a8a092', copper: '#c8703f', ink: '#15120f' };
const file = (p) => pathToFileURL(path.join(ROOT, p)).href;
const FONTS = `
@font-face{font-family:G;src:url(${file('src/assets/fonts/funnel-display-latin.woff2')});font-weight:300 800}
@font-face{font-family:G;src:url(${file('src/assets/fonts/funnel-display-latin-ext.woff2')});font-weight:300 800;unicode-range:U+0100-02BA,U+1E00-1EFF}
@font-face{font-family:S;src:url(${file('src/assets/fonts/funnel-sans-latin.woff2')});font-weight:300 800}
@font-face{font-family:S;src:url(${file('src/assets/fonts/funnel-sans-latin-ext.woff2')});font-weight:300 800;unicode-range:U+0100-02BA,U+1E00-1EFF}
@font-face{font-family:M;src:url(${file('src/assets/fonts/martian-mono-latin.woff2')});font-weight:100 800;font-stretch:75% 112.5%}
@font-face{font-family:M;src:url(${file('src/assets/fonts/martian-mono-latin-ext.woff2')});font-weight:100 800;font-stretch:75% 112.5%;unicode-range:U+0100-02BA,U+1E00-1EFF}`;

const CARDS = {
  home: { still: 'p0', pl: ['Kacper Rękawek', 'Założyciel OutreachPilot.pl i FastLanding.io', 'kacper.biz', ''], en: ['Kacper Rękawek', 'Founder of OutreachPilot.pl and FastLanding.io', 'kacper.biz', ''] },
  about: { still: 'p0', pl: ['Kacper Rękawek', 'Przedsiębiorca z Gliwic. Fakty, firma i kontakt.', 'kacper.biz/o-mnie', ''], en: ['Kacper Rękawek', 'Entrepreneur from Gliwice. Facts, company and contact.', 'kacper.biz/en/about', ''] },
  outreachpilot: { still: 'p1', pos: '100% 45%', pl: ['OutreachPilot.pl', 'Cold mailing do firm z CEIDG i Google Maps, po polsku.', 'kacper.biz/outreachpilot', '0 zł, plan Free'], en: ['OutreachPilot.pl', 'Cold email to Polish companies from CEIDG and Google Maps.', 'kacper.biz/en/outreachpilot', 'PLN 0, Free plan'] },
  fastlanding: { still: 'p3', pl: ['FastLanding.io', 'Landing page w 7 dni, strona firmowa w 14.', 'kacper.biz/fastlanding', '1 499 zł netto'], en: ['FastLanding.io', 'A landing page in 7 days, a business site in 14.', 'kacper.biz/en/fastlanding', 'PLN 1,499 net'] },
  work: { still: 'p3', pl: ['Realizacje', 'Strony klientów FastLanding, które możesz otworzyć.', 'kacper.biz/realizacje', ''], en: ['Work', 'FastLanding client websites you can open.', 'kacper.biz/en/work', ''] },
  contact: { still: 'p4', pl: ['Kontakt', 'Umów rozmowę albo napisz.', 'kacper.biz/kontakt', ''], en: ['Contact', 'Book a call or write to me.', 'kacper.biz/en/contact', ''] },
};

function cardHTML(key, lang) {
  const c = CARDS[key];
  const nb = (t) => t.replace(/(^|\s)([aiouwzAIOUWZ])\s/g, '$1$2 ').replace(/(^|\s)([aiouwzAIOUWZ])\s/g, '$1$2 ');
  const [title, sub, url, price] = c[lang];
  return `<!doctype html><meta charset="utf-8"><style>${FONTS}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:${C.studio};color:${C.text};font-family:G;overflow:hidden;position:relative;-webkit-font-smoothing:antialiased}
  .still{position:absolute;inset:0;background:url(${file(`public/stills/${c.still}-d.webp`)}) ${c.pos ?? '78% 50%'}/cover no-repeat${c.flip ? ';transform:scaleX(-1)' : ''}}
  .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,12,10,.94) 0%,rgba(14,12,10,.7) 40%,rgba(14,12,10,0) 68%)}
  .top{position:absolute;left:64px;right:64px;top:52px;display:flex;justify-content:space-between;font:500 16px/1 M;font-stretch:87.5%;letter-spacing:.01em;text-transform:uppercase;color:${C.text2}}
  .txt{position:absolute;left:64px;bottom:64px;width:660px;display:flex;flex-direction:column;gap:22px;align-items:flex-start}
  h1{font-weight:500;font-size:${title.length > 14 ? 92 : 108}px;line-height:.9;letter-spacing:-.045em}
  p{font-family:S;font-size:30px;line-height:1.25;letter-spacing:-.01em;color:${C.text2};max-width:600px}
  .st{font-family:S;background:${C.copper};color:${C.ink};font-weight:500;font-size:24px;padding:10px 20px;border-radius:999px}
  </style><body><div class="still"></div><div class="shade"></div>
  <div class="top"><span>Kacper Rękawek</span><span>${url}</span></div>
  <div class="txt"><h1>${title}</h1><p>${nb(sub)}</p>${price ? `<span class="st">${price}</span>` : ''}</div>`;
}

// favicon: the copper K cap from the board, seen from above (skirt, dished top, engraved K) on studio black
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${C.studio}"/><rect x="4.5" y="4.5" width="23" height="23" rx="5" fill="#7d4020"/><rect x="7.5" y="6" width="17" height="17" rx="3.6" fill="${C.copper}"/><path fill="${C.ink}" d="M12.4 9.6h2v10h-2zM14.4 14.2l4.6-4.6h2.7l-5 4.9 5.3 5.1h-2.8l-4.8-4.6z"/></svg>`;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = path.join(ROOT, 'node_modules', '.og-tmp.html');
const written = [];
fs.mkdirSync(path.join(OUT, 'og'), { recursive: true });

if (!args.includes('--no-icons')) {
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), FAVICON);
  for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await page.setViewportSize({ width: size, height: size });
    // full-bleed tiles (the platform rounds the corners)
    fs.writeFileSync(tmp, `<body style="margin:0;background:${C.studio};width:${size}px;height:${size}px">${FAVICON.replace('rx="7" ', '').replace('<svg ', `<svg width="${size}" height="${size}" `)}`);
    await page.goto(pathToFileURL(tmp).href);
    await page.screenshot({ path: path.join(OUT, name) });
    written.push(name);
  }
}

await page.setViewportSize({ width: 1200, height: 630 });
for (const key of Object.keys(CARDS)) {
  if (only && !only.includes(key)) continue;
  for (const lang of ['pl', 'en']) {
    fs.writeFileSync(tmp, cardHTML(key, lang));
    await page.goto(pathToFileURL(tmp).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const f = `og/${key}${lang === 'en' ? '-en' : ''}.png`;
    await page.screenshot({ path: path.join(OUT, f) });
    written.push(f);
  }
}

const preview = opt('preview');
if (preview) {
  const imgs = written.filter((f) => f.startsWith('og/')).map((f) => `<img src="${pathToFileURL(path.join(OUT, f)).href}" style="width:600px">`).join('');
  fs.writeFileSync(tmp, `<body style="margin:0;background:#333;display:flex;flex-wrap:wrap;gap:8px;width:1216px">${imgs}`);
  await page.setViewportSize({ width: 1216, height: 800 });
  await page.goto(pathToFileURL(tmp).href);
  await page.waitForTimeout(400);
  await page.screenshot({ path: preview, fullPage: true });
}
fs.rmSync(tmp, { force: true });
await browser.close();
console.log('wrote', written.join(', '));
