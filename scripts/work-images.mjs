// One-off: convert FastLanding portfolio captures (fastlanding.io/img/work) into AVIF + WebP for kacper.biz.
// Usage: node scripts/work-images.mjs <srcDir>
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const src = process.argv[2];
const out = path.resolve('public/work');
const map = { stomatologia: 'stomatologia', hellohome: 'hellohome', casaflamingo: 'casaflamingo', outreachpilot: 'outreachpilot' };
const kinds = { 'hero-960': ['hero', 960], 'tour-960': ['tour', 960], 'mtour-440': ['mtour', 440] };
for (const f of await readdir(src)) {
  const m = f.match(/^([a-z]+)-(hero-960|tour-960|mtour-440)\.webp$/);
  if (!m || !map[m[1]]) continue;
  const [kind, w] = kinds[m[2]];
  const base = path.join(out, `${map[m[1]]}-${kind}`);
  const img = sharp(path.join(src, f));
  const meta = await img.metadata();
  await img.clone().resize({ width: w }).avif({ quality: 52, effort: 6 }).toFile(`${base}.avif`);
  await img.clone().resize({ width: w }).webp({ quality: 74 }).toFile(`${base}.webp`);
  const a = (await stat(`${base}.avif`)).size, b = (await stat(`${base}.webp`)).size;
  console.log(`${path.basename(base)}  ${meta.width}x${meta.height}  avif ${(a / 1024).toFixed(0)}KB  webp ${(b / 1024).toFixed(0)}KB`);
}
