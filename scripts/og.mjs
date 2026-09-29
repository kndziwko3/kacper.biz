#!/usr/bin/env node
/**
 * Brand assets committed to public/ (run once, not at build time):
 *   public/favicon.svg, apple-touch-icon.png (180), icon-192.png, icon-512.png
 *   public/og/{home,about,outreachpilot,fastlanding,work,contact}[-en].png  (1200x630)
 *
 * Cards are HTML rendered by Chromium (playwright-core) with the self-hosted fonts (Mona Sans, Martian Mono)
 * and the dot map drawn from the same polygon as the WebGL scene (src/scene/poland.ts).
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

const C = { ink: '#0b0b0a', paper: '#ebe7de', bone: '#ece8df', mute: '#9c988f', paperInk: '#121210', paperMute: '#5d5a53', signal: '#ff5a1f', signalInk: '#b8360a' };
const font = (p) => pathToFileURL(path.join(ROOT, 'node_modules', p)).href;
const FONTS = `
@font-face{font-family:Mona;src:url(${font('@fontsource-variable/mona-sans/files/mona-sans-latin-standard-normal.woff2')});font-weight:200 900;font-stretch:75% 125%;unicode-range:U+0000-00FF,U+2000-206F,U+20AC}
@font-face{font-family:Mona;src:url(${font('@fontsource-variable/mona-sans/files/mona-sans-latin-ext-standard-normal.woff2')});font-weight:200 900;font-stretch:75% 125%;unicode-range:U+0100-02BA,U+1E00-1EFF}
@font-face{font-family:Martian;src:url(${font('@fontsource-variable/martian-mono/files/martian-mono-latin-standard-normal.woff2')});font-weight:100 800;font-stretch:75% 112.5%;unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Martian;src:url(${font('@fontsource-variable/martian-mono/files/martian-mono-latin-ext-standard-normal.woff2')});font-weight:100 800;font-stretch:75% 112.5%;unicode-range:U+0100-02BA}`;

/** Dot map of Poland as SVG circles, sampled on a regular grid inside the scene's own polygon. */
function mapSVG({ w, h, step, dot, ink }) {
  const poly = polygonXY();
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = Math.min(w / (maxX - minX), h / (maxY - minY));
  const ox = (w - (maxX - minX) * s) / 2, oy = (h - (maxY - minY) * s) / 2;
  const toPx = (x, y) => [ox + (x - minX) * s, oy + (maxY - y) * s];
  let dots = '';
  for (let y = minY; y <= maxY; y += step / s) {
    for (let x = minX; x <= maxX; x += step / s) {
      if (!pointInPolygon(x, y, poly)) continue;
      const [px, py] = toPx(x, y);
      dots += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${dot}"/>`;
    }
  }
  const [gx, gy] = toPx(...project(GLIWICE[0], GLIWICE[1]));
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g"><stop offset="0" stop-color="${C.signal}" stop-opacity=".55"/><stop offset="1" stop-color="${C.signal}" stop-opacity="0"/></radialGradient></defs>
    <g fill="${ink}" fill-opacity=".62">${dots}</g>
    <circle cx="${gx}" cy="${gy}" r="46" fill="url(#g)"/><circle cx="${gx}" cy="${gy}" r="6.5" fill="${C.signal}"/>
    <circle cx="${gx}" cy="${gy}" r="16" fill="none" stroke="${C.signal}" stroke-opacity=".6" stroke-width="1.2"/>
  </svg>`;
}

const CARDS = {
  home: { pl: ['Kacper Rękawek', 'Założyciel OutreachPilot.pl i FastLanding.io', 'kacper.biz'], en: ['Kacper Rękawek', 'Founder of OutreachPilot.pl and FastLanding.io', 'kacper.biz'], theme: 'ink', big: true },
  about: { pl: ['Kacper Rękawek', 'Przedsiębiorca z Gliwic. Dwie firmy, fakty i kontakt.', 'kacper.biz/o-mnie'], en: ['Kacper Rękawek', 'Entrepreneur from Gliwice. Two companies, facts and contact.', 'kacper.biz/en/about'], theme: 'ink', big: true },
  outreachpilot: { pl: ['OutreachPilot.pl', 'Cold mailing do firm z CEIDG i Google Maps, po polsku.', 'kacper.biz/outreachpilot'], en: ['OutreachPilot.pl', 'Cold outreach to Polish companies from CEIDG and Google Maps.', 'kacper.biz/en/outreachpilot'], theme: 'ink' },
  fastlanding: { pl: ['FastLanding.io', 'Landing page w 7 dni, strona firmowa w 14.', 'kacper.biz/fastlanding'], en: ['FastLanding.io', 'A landing page in 7 days, a business site in 14.', 'kacper.biz/en/fastlanding'], theme: 'paper' },
  work: { pl: ['Realizacje', 'Strony klientów FastLanding, które możesz otworzyć.', 'kacper.biz/realizacje'], en: ['Work', 'FastLanding client websites you can open.', 'kacper.biz/en/work'], theme: 'paper' },
  contact: { pl: ['Kontakt', 'Porozmawiajmy o Twojej firmie.', 'kacper.biz/kontakt'], en: ['Contact', 'Let’s talk about your business.', 'kacper.biz/en/contact'], theme: 'ink' },
};

function cardHTML(key, lang) {
  const c = CARDS[key];
  const nb = (t) => t.replace(/(^|\s)([aiouwzAIOUWZ])\s/g, '$1$2\u00a0').replace(/(^|\s)([aiouwzAIOUWZ])\s/g, '$1$2\u00a0');
  const [title, rawSub, url] = c[lang];
  const sub = nb(rawSub);
  const paper = c.theme === 'paper';
  const bg = paper ? C.paper : C.ink, fg = paper ? C.paperInk : C.bone, mute = paper ? C.paperMute : C.mute;
  return `<!doctype html><meta charset="utf-8"><style>${FONTS}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:${bg};color:${fg};font-family:Mona;overflow:hidden;position:relative}
  .map{position:absolute;right:-24px;top:60px}
  .top{position:absolute;left:64px;top:58px;display:flex;align-items:center;gap:14px;font-family:Martian;font-stretch:87.5%;font-size:19px;color:${mute}}
  .sq{width:14px;height:14px;background:${C.signal}}
  .txt{position:absolute;left:64px;bottom:42px;width:${c.big ? 700 : 660}px;display:flex;flex-direction:column;gap:18px}
  h1{margin-left:-6px;font-weight:800;font-stretch:${c.big ? '120%' : '96%'};font-size:${c.big ? 104 : 86}px;letter-spacing:-.05em;line-height:.9}
  p{font-size:28px;color:${mute};letter-spacing:-.01em;line-height:1.22;max-width:600px}
  .foot{margin-top:10px;font-family:Martian;font-stretch:87.5%;font-size:17px;color:${mute}}
  </style><body>
  <div class="map">${mapSVG({ w: 560, h: 500, step: 9.5, dot: 1.9, ink: paper ? C.paperInk : C.bone })}</div>
  <div class="top"><span class="sq"></span>${url}</div>
  <div class="txt"><h1>${title}</h1><p>${sub}</p>
  <div class="foot">Gliwice · ${lang === 'pl' ? '50,29° N · 18,67° E' : '50.29° N · 18.67° E'}</div></div>`;
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${C.ink}"/><rect x="10" y="10" width="12" height="12" fill="${C.signal}"/></svg>`;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = path.join(ROOT, 'node_modules', '.og-tmp.html');
const written = [];
fs.mkdirSync(path.join(OUT, 'og'), { recursive: true });

if (!args.includes('--no-icons')) {
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), FAVICON);
  for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await page.setViewportSize({ width: size, height: size });
    const pad = Math.round(size * 0.31), sq = size - 2 * pad;
    fs.writeFileSync(tmp, `<body style="margin:0;background:${C.ink};width:${size}px;height:${size}px"><div style="position:absolute;left:${pad}px;top:${pad}px;width:${sq}px;height:${sq}px;background:${C.signal}"></div>`);
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
