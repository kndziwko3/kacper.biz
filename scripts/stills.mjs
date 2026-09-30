#!/usr/bin/env node
/**
 * Renders the film's stills (public/stills/p0..p4-{d,m}.webp): the first paint of every chapter and page head, and
 * the whole picture on devices without a GPU. Run after changing anything in src/film, with `npm run dev` running:
 *   node scripts/stills.mjs [--base http://127.0.0.1:4321] [--only 0,2] [--views d,m]
 * Each still is rendered 3x supersampled (read straight off the canvas) and downsampled with Lanczos, so the plate
 * edges resolve into clean lines instead of aliasing into moire.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const base = (opt('base') ?? 'http://127.0.0.1:4321') + '/lab/still';
const only = opt('only')?.split(',').map(Number) ?? null;
const views = opt('views')?.split(',') ?? null;
const out = opt('out') ?? path.join(ROOT, 'public/stills');
const CHROME = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// the local progress each chapter's still is taken at
const POSES = [[0, 0], [1, 0.4], [2, 0.35], [3, 0.4], [4, 0.5]];
// [suffix, css width, css height, supersample factor, output width]
const VIEWS = [['d', 1600, 1000, 3, 1600], ['m', 390, 844, 6, 780]];

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [pose, local] of POSES) {
  if (only && !only.includes(pose)) continue;
  for (const [v, w, h, ss, outW] of VIEWS) {
    if (views && !views.includes(v)) continue;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: ss });
    await page.goto(`${base}?a=${pose}&l=${local}&tier=high&ss`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 600000, polling: 1000 });
    const url = await page.evaluate(() => window.__png ?? '');
    if (!url.startsWith('data:image/png')) throw new Error(`no canvas pixels for p${pose}-${v}`);
    const file = path.join(out, `p${pose}-${v}.webp`);
    await sharp(Buffer.from(url.split(',')[1], 'base64')).resize({ width: outW, kernel: 'lanczos3' })
      .webp({ quality: 82, smartSubsample: true, effort: 6 }).toFile(file);
    console.log(path.relative(ROOT, file), (fs.statSync(file).size / 1024).toFixed(1), 'KB');
    await page.close();
  }
}
await browser.close();
