#!/usr/bin/env node
/**
 * Embeds each shipping raster's origin into the file itself (the impeccable provenance record): run after
 * `npm run stills` and `npm run og`, which rewrite the files and drop what was embedded before.
 * Needs the impeccable CLI (`npx impeccable install`); set IMPECCABLE to its launcher if it is not found.
 *   node scripts/provenance.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = [process.env.IMPECCABLE, path.join(ROOT, '.agents/skills/impeccable/scripts/impeccable'), path.join(os.homedir(), '.claude/skills/impeccable/scripts/impeccable')]
  .find((p) => p && fs.existsSync(p));
if (!bin) { console.error('impeccable CLI not found: npx impeccable install, or set IMPECCABLE'); process.exit(1); }

const day = new Date().toLocaleDateString('pl-PL');
const ORIGIN = {
  'public/stills': `Rendered, not generated: a frame of the site's own three.js film (src/film, procedural keyboard of 100 keys) at the pose in its file name (p0 hero, p1 grid, p2 typing, p3 exploded, p4 Enter macro; d desktop 1600x1000, m phone 780x1688), rendered by scripts/stills.mjs on the dev lab route /lab/still with supersampling on a GPU, downsampled with Lanczos, ${day}.`,
  'public/og': `Composited, not generated: Open Graph card 1200x630 built by scripts/og.mjs from the film still in public/stills (itself rendered from src/film) and the site's Funnel Display, Funnel Sans and Martian Mono text, ${day}.`,
  'public/work': 'Sourced: a real screenshot of a FastLanding client website from the FastLanding.io portfolio (fastlanding.io/img/work), converted by scripts/work-images.mjs; the site and the date checked are named next to it on the page.',
  public: `Drawn, not generated: the site icon (the copper K keycap seen from above) rasterised from the SVG in scripts/og.mjs (public/favicon.svg), ${day}.`,
};
let n = 0;
for (const [dir, prompt] of Object.entries(ORIGIN)) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    if (!/\.(png|webp|jpe?g)$/i.test(f)) continue;
    execFileSync(bin, ['embed-prompt', path.join(dir, f), '--prompt', prompt], { cwd: ROOT, stdio: 'ignore' });
    n++;
  }
}
console.log(`provenance embedded in ${n} rasters`);
console.log(execFileSync(bin, ['embed-prompt', '--scan', 'public'], { cwd: ROOT, encoding: 'utf8' }).trim());
