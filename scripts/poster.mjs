#!/usr/bin/env node
/**
 * public/map-poster.svg: the printed stand-in for the WebGL map (no WebGL, software GL, save-data, no JS, and
 * the first second before the scene mounts). A few KB: a halftone pattern clipped to the same Poland polygon the
 * scene uses (src/scene/poland.ts), a dotted border, city dots and Gliwice in red.
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
  return `<circle cx="${x}" cy="${y}" r="${(1.8 + 3.2 * Math.sqrt(c.w)).toFixed(1)}"/>`;
}).join('');

// printed in ink on transparent paper: a halftone pattern clipped to the country, a dotted border, city dots,
// and Gliwice in the red spot ink with its marker ring
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
<pattern id="p" width="7.4" height="6.4" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.15"/><circle cx="5.2" cy="4.7" r="1.15"/></pattern>
</defs>
<path d="${d}" fill="url(#p)" opacity=".42"/>
<path d="${d}" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0 4.4"/>
<g fill="#000">${cities}</g>
<circle cx="${gx}" cy="${gy}" r="7" fill="#e1251b"/>
<circle cx="${gx}" cy="${gy}" r="27" fill="none" stroke="#e1251b" stroke-width="2.4"/>
</svg>
`;
fs.writeFileSync(path.join(ROOT, 'public/map-poster.svg'), svg);
console.log('public/map-poster.svg', W, 'x', H, (svg.length / 1024).toFixed(1), 'KB');
