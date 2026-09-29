#!/usr/bin/env node
/**
 * Brand assets committed to public/ (run once, not at build time):
 *   public/favicon.svg, apple-touch-icon.png (180), icon-192.png, icon-512.png
 *   public/og/{home,about,outreachpilot,fastlanding,work,contact}[-en].png  (1200x630)
 *
 * Cards are directory pages rendered by Chromium (playwright-core) in Archivo, with the printed map drawn from the
 * same polygon as the WebGL scene (src/scene/poland.ts).
 * Art direction: docs/art-direction.md. Usage: node scripts/og.mjs [--only home,about] [--no-icons] [--preview out.png]
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
const CHROME = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const { POLAND, GLIWICE, project, pointInPolygon, polygonXY } = await import(pathToFileURL(path.join(ROOT, 'src/scene/poland.ts')).href);

const C = { yellow: '#f7d117', white: '#f6f5f1', ink: '#000', red: '#e1251b' };
const font = (p) => pathToFileURL(path.join(ROOT, 'node_modules', p)).href;
const FONTS = `
@font-face{font-family:A;src:url(${font('@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2')});font-weight:100 900;font-stretch:62% 125%;unicode-range:U+0000-00FF,U+2000-206F,U+20AC}
@font-face{font-family:A;src:url(${font('@fontsource-variable/archivo/files/archivo-latin-ext-standard-normal.woff2')});font-weight:100 900;font-stretch:62% 125%;unicode-range:U+0100-02BA,U+1E00-1EFF}`;

/** The printed map: halftone pattern clipped to the scene's polygon, dotted border, city dots, Gliwice in red. */
function mapSVG({ w, h }) {
  const poly = polygonXY();
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = Math.min(w / (maxX - minX), h / (maxY - minY));
  const ox = (w - (maxX - minX) * s) / 2, oy = (h - (maxY - minY) * s) / 2;
  const toPx = (x, y) => [ox + (x - minX) * s, oy + (maxY - y) * s];
  const d = poly.map(([x, y], i) => `${i ? 'L' : 'M'}${toPx(x, y).map((v) => v.toFixed(1)).join(' ')}`).join('') + 'Z';
  const [gx, gy] = toPx(...project(GLIWICE[0], GLIWICE[1]));
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="p" width="8" height="7" patternUnits="userSpaceOnUse"><circle cx="1.6" cy="1.6" r="1.3"/><circle cx="5.6" cy="5.1" r="1.3"/></pattern></defs>
    <path d="${d}" fill="url(#p)" opacity=".45"/>
    <path d="${d}" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0 5"/>
    <circle cx="${gx}" cy="${gy}" r="8" fill="${C.red}"/><circle cx="${gx}" cy="${gy}" r="30" fill="none" stroke="${C.red}" stroke-width="3"/>
  </svg>`;
}

const CARDS = {
  home: { pl: ['Kacper Rękawek', 'Założyciel OutreachPilot.pl i FastLanding.io', 'kacper.biz', ''], en: ['Kacper Rękawek', 'Founder of OutreachPilot.pl and FastLanding.io', 'kacper.biz', ''], stock: 'yellow' },
  about: { pl: ['Kacper Rękawek', 'Przedsiębiorca z Gliwic. Fakty, firma i kontakt.', 'kacper.biz/o-mnie', ''], en: ['Kacper Rękawek', 'Entrepreneur from Gliwice. Facts, company and contact.', 'kacper.biz/en/about', ''], stock: 'white' },
  outreachpilot: { pl: ['OutreachPilot.pl', 'Cold mailing do firm z CEIDG i Google Maps, po polsku.', 'kacper.biz/outreachpilot', '0 zł, plan Free'], en: ['OutreachPilot.pl', 'Cold email to Polish companies from CEIDG and Google Maps.', 'kacper.biz/en/outreachpilot', 'PLN 0, Free plan'], stock: 'yellow' },
  fastlanding: { pl: ['FastLanding.io', 'Landing page w 7 dni, strona firmowa w 14.', 'kacper.biz/fastlanding', '1 499 zł netto'], en: ['FastLanding.io', 'A landing page in 7 days, a business site in 14.', 'kacper.biz/en/fastlanding', 'PLN 1,499 net'], stock: 'yellow' },
  work: { pl: ['Realizacje', 'Strony klientów FastLanding, które możesz otworzyć.', 'kacper.biz/realizacje', ''], en: ['Work', 'FastLanding client websites you can open.', 'kacper.biz/en/work', ''], stock: 'white' },
  contact: { pl: ['Kontakt', 'Umów rozmowę albo napisz.', 'kacper.biz/kontakt', ''], en: ['Contact', 'Book a call or write to me.', 'kacper.biz/en/contact', ''], stock: 'yellow' },
};

function cardHTML(key, lang) {
  const c = CARDS[key];
  const nb = (t) => t.replace(/(^|\s)([aiouwzAIOUWZ])\s/g, '$1$2 ').replace(/(^|\s)([aiouwzAIOUWZ])\s/g, '$1$2 ');
  const [title, rawSub, url, price] = c[lang];
  const bg = c.stock === 'white' ? C.white : C.yellow;
  return `<!doctype html><meta charset="utf-8"><style>${FONTS}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:${bg};color:#000;font-family:A;overflow:hidden;position:relative}
  .rh{position:absolute;left:0;right:0;top:0;height:64px;border-bottom:3px solid #000;display:flex;align-items:center;justify-content:space-between;padding:0 56px;font-stretch:75%;font-weight:900;text-transform:uppercase;letter-spacing:.03em;font-size:22px}
  .rh span:last-child{font-weight:700;text-transform:none;letter-spacing:0;font-stretch:90%}
  .tab{position:absolute;right:0;top:110px;width:40px;height:150px;background:#000}
  .map{position:absolute;right:48px;top:118px}
  .txt{position:absolute;left:56px;top:112px;width:640px;border-top:12px solid #000;padding-top:22px;display:flex;flex-direction:column;gap:20px}
  h1{font-stretch:62%;font-weight:900;text-transform:uppercase;font-size:${title.length > 14 ? 86 : title.length > 9 ? 112 : 124}px;line-height:.84;letter-spacing:-.005em}
  p{font-stretch:72%;font-weight:800;font-size:42px;line-height:1.02;max-width:600px}
  .st{display:inline-block;align-self:flex-start;background:${C.red};color:#fff;font-stretch:75%;font-weight:800;font-size:28px;padding:6px 12px}
  .foot{position:absolute;left:56px;right:56px;bottom:40px;display:flex;align-items:baseline;gap:10px;font-size:24px;font-weight:600}
  .foot i{flex:1;height:8px;background:radial-gradient(circle,#000 2.3px,transparent 2.8px) 0 0/12px 8px repeat-x}
  </style><body>
  <div class="rh"><span>Kacper Rękawek</span><span>${url}</span></div>
  <div class="tab"></div>
  <div class="map">${mapSVG({ w: 430, h: 400 })}</div>
  <div class="txt"><h1>${title}</h1><p>${nb(rawSub)}</p>${price ? `<span class="st">${price}</span>` : ''}</div>
  <div class="foot"><span>Gliwice</span><i></i><span>${lang === 'pl' ? 'założyciel OutreachPilot.pl i FastLanding.io' : 'founder of OutreachPilot.pl and FastLanding.io'}</span></div>`;
}

// favicon: a black thumb-index tab cut into yellow stock, with a K
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="${C.yellow}"/><path d="M7 5h5v9.2L19.2 5h6.1l-7.9 9.7L26 27h-6.2l-5.9-8.8-1.9 2.3V27H7z"/></svg>`;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = path.join(ROOT, 'node_modules', '.og-tmp.html');
const written = [];
fs.mkdirSync(path.join(OUT, 'og'), { recursive: true });

if (!args.includes('--no-icons')) {
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), FAVICON);
  for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await page.setViewportSize({ width: size, height: size });
    const pad = Math.round(size * 0.14);
    fs.writeFileSync(tmp, `<body style="margin:0;background:${C.yellow};width:${size}px;height:${size}px;display:grid;place-items:center"><div style="width:${size - 2 * pad}px;height:${size - 2 * pad}px">${FAVICON.replace('rx="4" fill="' + C.yellow + '"', 'fill="' + C.yellow + '"')}</div>`);
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
    await page.waitForTimeout(150);
    const file = `og/${key}${lang === 'en' ? '-en' : ''}.png`;
    await page.screenshot({ path: path.join(OUT, file) });
    written.push(file);
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
