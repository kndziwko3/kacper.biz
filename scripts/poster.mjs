#!/usr/bin/env node
/**
 * public/map-poster.svg: the printed stand-in for the WebGL map (no WebGL, software GL, save-data, no JS, and
 * the first second before the scene mounts). A few KB: the live map's ordered halftone (dots growing around the
 * cities, in three steps) clipped to the same Poland polygon the scene uses (src/scene/poland.ts), a solid border,
 * city dots and the small Gliwice marker in red.
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
  return `<circle cx="${x}" cy="${y}" r="${(2.2 + 3 * Math.sqrt(c.w)).toFixed(1)}"/>`;
}).join('');

// The live map's halftone, stepped: one ordered screen, its dots growing around the cities. The density field is the
// scene's (a Gaussian per city, sigma 0.16 + 0.24 * sqrt(w)); each step is the same lattice with bigger dots, clipped
// to where the field passes a threshold, so the bigger dots print over the smaller ones in register.
const zone = (t) => CITIES.filter((c) => c.w > t).map((c) => {
  const [x, y] = px(...project(c.lon, c.lat));
  const sg = 0.16 + 0.24 * Math.sqrt(c.w);
  return `<circle cx="${x}" cy="${y}" r="${(sg * Math.sqrt(Math.log(c.w / t)) * K).toFixed(1)}"/>`;
}).join('');
const cell = (r) => `<circle cx="1.85" cy="1.6" r="${r}"/><circle cx="5.55" cy="4.8" r="${r}"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
<clipPath id="c"><path d="${d}"/></clipPath>
<clipPath id="z1">${zone(0.3)}</clipPath>
<clipPath id="z2">${zone(0.65)}</clipPath>
<pattern id="p0" width="7.4" height="6.4" patternUnits="userSpaceOnUse">${cell(1.2)}</pattern>
<pattern id="p1" width="7.4" height="6.4" patternUnits="userSpaceOnUse">${cell(1.7)}</pattern>
<pattern id="p2" width="7.4" height="6.4" patternUnits="userSpaceOnUse">${cell(2.25)}</pattern>
</defs>
<g clip-path="url(#c)" fill="#120f0a">
<rect width="${W}" height="${H}" fill="url(#p0)"/>
<rect width="${W}" height="${H}" fill="url(#p1)" clip-path="url(#z1)"/>
<rect width="${W}" height="${H}" fill="url(#p2)" clip-path="url(#z2)"/>
</g>
<path d="${d}" fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
<g fill="#000">${cities}</g>
<circle cx="${gx}" cy="${gy}" r="4.6" fill="#e1251b"/>
<circle cx="${gx}" cy="${gy}" r="9.5" fill="none" stroke="#e1251b" stroke-width="2.2"/>
</svg>
`;
fs.writeFileSync(path.join(ROOT, 'public/map-poster.svg'), svg);
console.log('public/map-poster.svg', W, 'x', H, (svg.length / 1024).toFixed(1), 'KB');
