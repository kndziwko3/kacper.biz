#!/usr/bin/env node
/**
 * Renders the film's stills (public/stills/p0..p4-{d,m}.webp): the first paint of every chapter and page head, and
 * the whole picture on devices without a GPU. Run after changing anything in src/film, with `npm run dev` running:
 *   node scripts/stills.mjs [--base http://127.0.0.1:4321]
 * Renders at display size (1600x1000 desktop, 390x844 @2x mobile) so the plate edges are not resampled into moire.
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
const base = (args.includes('--base') ? args[args.indexOf('--base') + 1] : 'http://127.0.0.1:4321') + '/lab/still';
const CHROME = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = path.join(ROOT, 'public/stills');

// the local progress each chapter's still is taken at
const POSES = [[0, 0], [1, 0.4], [2, 0.35], [3, 0.4], [4, 0.5]];
const VIEWS = [['d', 1600, 1000, 1, 1600], ['m', 390, 844, 2, 780]];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [pose, local] of POSES) {
  for (const [v, w, h, dsf, outW] of VIEWS) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
    await page.goto(`${base}?a=${pose}&l=${local}&tier=high`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
    await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    await page.waitForTimeout(300);
    const png = await page.screenshot();
    const file = path.join(OUT, `p${pose}-${v}.webp`);
    await sharp(png).resize({ width: outW }).webp({ quality: 80, smartSubsample: true, effort: 6 }).toFile(file);
    console.log(path.relative(ROOT, file), (fs.statSync(file).size / 1024).toFixed(1), 'KB');
    await page.close();
  }
}
await browser.close();
