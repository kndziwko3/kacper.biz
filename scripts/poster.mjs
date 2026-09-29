#!/usr/bin/env node
/**
 * public/map-poster.svg: the static stand-in for the 3D map (no WebGL, software GL, save-data, no JS,
 * and the first second before the scene mounts). A few KB: one dot pattern clipped to the same Poland
 * polygon the scene uses (src/scene/poland.ts), a dotted border, city clusters and the Gliwice glow.
 * Usage: node scripts/poster.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { CITIES, GLIWICE, project, polygonXY } = await import(pathToFileURL(path.join(ROOT, 'src/scene/poland.ts')).href);

const K = 100; // px per world unit
const poly = polygonXY();
const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
const pad = 0.12;
const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad, minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
const W = Math.round((maxX - minX) * K), H = Math.round((maxY - minY) * K);
const px = (x, y) => [((x - minX) * K).toFixed(1), ((maxY - y) * K).toFixed(1)];

const d = poly.map(([x, y], i) => `${i ? 'L' : 'M'}${px(x, y).join(' ')}`).join('') + 'Z';
const [gx, gy] = px(...project(GLIWICE[0], GLIWICE[1]));

const cities = CITIES.map((c) => {
  const [x, y] = px(...project(c.lon, c.lat));
  const r = (6 + 16 * Math.sqrt(c.w)).toFixed(1);
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#c)"/>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
<pattern id="p" width="7.4" height="6.4" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.05" fill="#8f8b83"/><circle cx="5.2" cy="4.7" r="1.05" fill="#8f8b83"/></pattern>
<radialGradient id="c"><stop offset="0" stop-color="#ece8df" stop-opacity=".75"/><stop offset=".35" stop-color="#ece8df" stop-opacity=".22"/><stop offset="1" stop-color="#ece8df" stop-opacity="0"/></radialGradient>
<radialGradient id="g"><stop offset="0" stop-color="#ff8a5c"/><stop offset=".12" stop-color="#ff5a1f" stop-opacity=".9"/><stop offset=".45" stop-color="#ff5a1f" stop-opacity=".22"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
</defs>
<path d="${d}" fill="url(#p)" opacity=".55"/>
<path d="${d}" fill="none" stroke="#ece8df" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0 4.2" opacity=".8"/>
${cities}
<circle cx="${gx}" cy="${gy}" r="80" fill="url(#g)"/>
<circle cx="${gx}" cy="${gy}" r="30" fill="none" stroke="#ff8a5c" stroke-opacity=".55" stroke-width="1" stroke-dasharray="0 3.4" stroke-linecap="round"/>
</svg>
`;
fs.writeFileSync(path.join(ROOT, 'public/map-poster.svg'), svg);
console.log('public/map-poster.svg', W, 'x', H, (svg.length / 1024).toFixed(1), 'KB');
