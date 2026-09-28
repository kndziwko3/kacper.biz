#!/usr/bin/env node
/**
 * Generates the brand assets that are committed to public/ (run once, NOT at build time):
 *
 *   public/favicon.svg            rounded square, conic gradient vermilion -> periwinkle -> lime, "KR" in ink (pure SVG paths)
 *   public/apple-touch-icon.png   180x180, full-bleed (iOS applies its own corner mask)
 *   public/icon-192.png, icon-512.png   for site.webmanifest
 *   public/og/{home,about,outreachpilot,fastlanding,work,contact}[-en].png   1200x630 social cards
 *
 * The cards are HTML rendered by system Chromium through playwright-core, so they use the real self-hosted fonts
 * (Bricolage Grotesque, Instrument Serif italic, Geist from node_modules/@fontsource*) and the palette from src/styles/global.css.
 *
 * Text on the cards is taken from src/content/site.ts (parsed, not imported: this is a plain .mjs script) or is a literal
 * label ("Kontakt", "Realizacje"). Nothing on a card is a new claim about anybody.
 *
 * Usage:
 *   node scripts/og.mjs                     everything (icons + all cards)
 *   node scripts/og.mjs --only home,about   only cards whose key starts with one of these
 *   node scripts/og.mjs --icons             only favicon + PNG icons
 *   node scripts/og.mjs --no-icons          only cards
 *   node scripts/og.mjs --chromium /path    override the Chromium executable
 *   node scripts/og.mjs --preview /tmp/x.png   also write a 2-column contact sheet of the cards to that path (outside the repo)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const OG_DIR = path.join(PUBLIC, 'og');
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const CHROMIUM = opt('chromium') ?? process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const CHROMIUM_ARGS = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

/* ───────────────────────── palette (src/styles/global.css) ───────────────────────── */
const C = {
  ink: '#07070a',
  ink2: '#0d0d13',
  bone: '#efece6',
  boneDim: '#b0ada6',
  signal: '#ff6a3d',
  signal2: '#ff9a76',
  page: '#9d8cff',
  page2: '#c4b9ff',
  reply: '#d7ff45',
};
const RGB = {
  signal: [255, 106, 61],
  page: [157, 140, 255],
  reply: [215, 255, 69],
};

/* ───────────────────────── facts from site.ts (parsed, single source of truth) ───────────────────────── */
const siteSrc = fs.readFileSync(path.join(ROOT, 'src/content/site.ts'), 'utf8');
const grab = (re, label) => {
  const m = siteSrc.match(re);
  if (!m) throw new Error(`og.mjs: could not find ${label} in src/content/site.ts`);
  return m[1];
};
const PERSON_NAME = grab(/export const PERSON = \{[\s\S]*?\n\s+name: '([^']+)'/, 'PERSON.name');
const JOB_PL = grab(/jobTitle: \{\s*pl: '([^']+)'/, 'PERSON.jobTitle.pl');
const JOB_EN = grab(/jobTitle: \{[\s\S]*?en: '([^']+)'/, 'PERSON.jobTitle.en');
const STUDIO_EMAIL = grab(/studioEmail: '([^']+)'/, 'CONTACT.studioEmail');
const PRODUCT_EMAIL = grab(/productEmail: '([^']+)'/, 'CONTACT.productEmail');
const PROJECT_NAMES = [...siteSrc.matchAll(/^\s+name: '([^']+)',\n\s+url: 'https:\/\/(?:hello-home|soleilenergia|casaflamingo07)/gm)].map((m) => m[1]);
if (PROJECT_NAMES.length !== 3) throw new Error(`og.mjs: expected 3 PROJECTS in site.ts, found ${PROJECT_NAMES.length}`);
const [FIRST, LAST] = PERSON_NAME.split(' ');

/* ───────────────────────── tiny helpers ───────────────────────── */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const f1 = (n) => Math.round(n * 10) / 10;

/** Brand conic gradient: vermilion -> periwinkle -> lime -> back to vermilion. t in [0,1). */
const CONIC = [
  [0.0, RGB.signal],
  [0.34, RGB.page],
  [0.67, RGB.reply],
  [1.0, RGB.signal],
];
function conicAt(t) {
  const x = ((t % 1) + 1) % 1;
  for (let i = 0; i < CONIC.length - 1; i++) {
    const [t0, c0] = CONIC[i];
    const [t1, c1] = CONIC[i + 1];
    if (x >= t0 && x <= t1) return mix(c0, c1, (x - t0) / (t1 - t0));
  }
  return RGB.signal;
}

/* ───────────────────────── the KR mark (pure SVG, no fonts) ───────────────────────── */
function wedges(cx, cy, r, n, startDeg) {
  // A conic gradient as a fan of triangles. Each wedge is painted over the following two steps so that every visible
  // edge is a wedge sitting on its almost-identical neighbour (no anti-aliasing seams against the background).
  const out = [];
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a0 = ((startDeg + i * step - 0.4) * Math.PI) / 180;
    const a1 = ((startDeg + i * step + step * 3) * Math.PI) / 180;
    const p = (a) => `${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
    const mid = ((startDeg + i * step + step * 1.5) * Math.PI) / 180; // keeps the wide triangle covering the full square corner
    out.push(`<path fill="${hex(conicAt((i + 0.5) / n))}" d="M${cx} ${cy}L${p(a0)}L${p(mid)}L${p(a1)}Z"/>`);
  }
  return out.join('');
}
const KR_PATHS = `<g transform="translate(-3.6 0)" fill="none" stroke="${C.ink}" stroke-width="6.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20V44M33.5 20L19 33M23.6 29.6L34.5 44"/><path d="M41.5 44V20H47a7 7 0 0 1 0 14H41.5M47.5 34L54 44"/></g>`;

/** @param {{rounded?: boolean, size?: number, title?: boolean, id?: string}} o */
function markSvg({ rounded = true, size, title = true, id = 'r' } = {}) {
  const dim = size ? ` width="${size}" height="${size}"` : '';
  const body = wedges(32, 32, 60, 90, -90);
  const inner = rounded ? `<defs><clipPath id="${id}"><rect width="64" height="64" rx="15"/></clipPath></defs><g clip-path="url(#${id})">${body}</g>` : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"${dim}>${title ? '<title>Kacper Rękawek</title>' : ''}${inner}${KR_PATHS}</svg>`;
}

/* ───────────────────────── Poland as a dot map ───────────────────────── */
// Approximate national outline, [lon, lat], clockwise from Świnoujście. Good enough for a dotted silhouette.
const POLAND = [
  [14.14, 53.92], [14.45, 53.93], [14.75, 54.03], [15.57, 54.18], [16.4, 54.43], [16.85, 54.58], [17.55, 54.76],
  [18.33, 54.83], [18.55, 54.53], [18.68, 54.36], [19.4, 54.37], [19.65, 54.45], [20.5, 54.4], [21.2, 54.32], [22.0, 54.37],
  [22.79, 54.36], [23.3, 54.2], [23.51, 53.95], [23.72, 53.5], [23.93, 52.95], [23.95, 52.55], [23.62, 52.08], [23.55, 51.55],
  [23.82, 51.18], [24.05, 50.83], [23.62, 50.32], [23.05, 49.95], [22.85, 49.8], [22.7, 49.55], [22.55, 49.08],
  [21.85, 49.35], [21.1, 49.4], [20.5, 49.4], [20.05, 49.2], [19.7, 49.2], [19.45, 49.6], [19.0, 49.5],
  [18.85, 49.52], [18.55, 49.9], [18.0, 50.05], [17.6, 50.25], [17.2, 50.4], [16.9, 50.45], [16.65, 50.1], [16.4, 50.4],
  [16.05, 50.65], [15.75, 50.75], [15.3, 50.85], [15.0, 51.03], [14.95, 51.2], [14.75, 51.5], [14.62, 51.8],
  [14.72, 52.1], [14.55, 52.4], [14.65, 52.6], [14.3, 52.85], [14.35, 53.2], [14.22, 53.55], [14.14, 53.92],
];
const CITIES = {
  Gliwice: [18.67, 50.29],
  Warszawa: [21.01, 52.23],
  Kraków: [19.94, 50.06],
  Gdańsk: [18.65, 54.35],
  Wrocław: [17.04, 51.11],
  Poznań: [16.93, 52.41],
  Szczecin: [14.55, 53.43],
  Łódź: [19.46, 51.76],
  Lublin: [22.57, 51.25],
  Białystok: [23.16, 53.13],
  Katowice: [19.02, 50.26],
};
const COS_LAT = Math.cos((52.1 * Math.PI) / 180);
const unit = ([lon, lat]) => [(lon - 14.1) * COS_LAT, 54.9 - lat];
const pointInPoly = (x, y, poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/**
 * @param {{x0:number,y0:number,scale:number,pitch?:number,seed?:number,focus?:string,glow?:number,dim?:number}} o
 * Returns { svg, at(name) -> [px,py] }.
 */
function dotMap({ x0, y0, scale, pitch = 10.5, seed = 7, focus = 'Gliwice', glow = 2.3, dim = 1 }) {
  const rand = rng(seed);
  const poly = POLAND.map(unit);
  const toPx = (ll) => {
    const [u, v] = unit(ll);
    return [x0 + u * scale, y0 + v * scale];
  };
  const [fx, fy] = toPx(CITIES[focus]);
  const dots = [];
  const rowH = pitch * 0.866;
  const maxX = 6.3 * scale;
  const maxY = 6.0 * scale;
  for (let row = 0, y = 0; y <= maxY; row++, y += rowH) {
    for (let x = row % 2 ? pitch / 2 : 0; x <= maxX; x += pitch) {
      if (!pointInPoly(x / scale, y / scale, poly)) continue;
      const px = x0 + x;
      const py = y0 + y;
      const d = Math.hypot(px - fx, py - fy) / scale; // distance from focus in map units
      const near = Math.exp(-((d / glow) ** 2));
      const a = Math.min(0.92, (0.27 + 0.6 * near + (rand() - 0.5) * 0.14) * dim);
      const col = mix(RGB.page, RGB.signal, Math.min(1, near * 1.15));
      const r = 1.5 + 1.15 * a;
      dots.push(`<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r)}" fill="${rgb(col, f1(a * 100) / 100)}"/>`);
    }
  }
  return { svg: dots.join(''), at: (name) => toPx(CITIES[name]) };
}

/** Dotted arc (quadratic bezier) between two pixel points. */
function dotArc([ax, ay], [bx, by], { color = RGB.signal, to = [239, 236, 230], lift = 0.28, gap = 9, r = 2.1, bow = 1 } = {}) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  const cx = (ax + bx) / 2 + (-dy / len) * len * lift * bow;
  const cy = (ay + by) / 2 + (dx / len) * len * lift * bow;
  const n = Math.max(6, Math.round(len / gap));
  const out = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * ax + 2 * (1 - t) * t * cx + t ** 2 * bx;
    const y = (1 - t) ** 2 * ay + 2 * (1 - t) * t * cy + t ** 2 * by;
    const col = mix(color, to, t * t);
    out.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * (0.7 + 0.5 * t))}" fill="${rgb(col, f1(0.35 + 0.6 * t) )}"/>`);
  }
  return out.join('');
}

/** A city marker: solid dot + soft ring. */
function cityDot([x, y], { color = C.bone, r = 3.6, ring = false, label, labelDx = 12, labelDy = 5, labelColor = C.boneDim } = {}) {
  let s = '';
  if (ring) s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r * 3.4}" fill="none" stroke="${color}" stroke-opacity="0.45" stroke-width="1.4"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${r * 5.6}" fill="none" stroke="${color}" stroke-opacity="0.22" stroke-width="1.2"/>`;
  s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${color}"/>`;
  if (label) s += `<text x="${f1(x + labelDx)}" y="${f1(y + labelDy)}" class="maplabel" fill="${labelColor}">${esc(label)}</text>`;
  return s;
}

/* ───────────────────────── dot-matrix wireframes (FastLanding / Work) ───────────────────────── */
/** Snap-to-grid dot painter. */
function grid(pitch, ox = 0, oy = 0) {
  const out = [];
  const dot = (gx, gy, { color = RGB.page, a = 0.85, r = 2.5 } = {}) =>
    out.push(`<circle cx="${f1(ox + gx * pitch)}" cy="${f1(oy + gy * pitch)}" r="${r}" fill="${rgb(color, a)}"/>`);
  const rect = (gx, gy, w, h, opt = {}) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) dot(gx + i, gy + j, opt);
  };
  const frame = (gx, gy, w, h, opt = {}) => {
    for (let i = 0; i < w; i++) {
      dot(gx + i, gy, opt);
      dot(gx + i, gy + h - 1, opt);
    }
    for (let j = 1; j < h - 1; j++) {
      dot(gx, gy + j, opt);
      dot(gx + w - 1, gy + j, opt);
    }
  };
  const raw = (svg) => out.push(svg);
  return { dot, rect, frame, raw, svg: () => out.join('') };
}

/** A browser-window wireframe. variant: 'hero' | 'listings' | 'booking'. */
function windowWire(g, gx, gy, w, h, color, variant) {
  g.frame(gx, gy, w, h, { color, a: 0.9, r: 2.6 });
  // title bar: separator + three traffic dots
  for (let i = 1; i < w - 1; i++) g.dot(gx + i, gy + 3, { color, a: 0.55, r: 2 });
  g.dot(gx + 2, gy + 1.5 + 0.0, { color: RGB.signal, a: 0.95, r: 2.6 });
  g.dot(gx + 4, gy + 1.5, { color: RGB.page, a: 0.95, r: 2.6 });
  g.dot(gx + 6, gy + 1.5, { color: RGB.reply, a: 0.95, r: 2.6 });
  const ix = gx + 2;
  const iw = w - 4;
  if (variant === 'hero') {
    g.rect(ix, gy + 5, Math.round(iw * 0.62), 1, { color, a: 0.95, r: 3 });
    g.rect(ix, gy + 7, Math.round(iw * 0.46), 1, { color, a: 0.7, r: 2.6 });
    g.rect(ix, gy + 9, Math.round(iw * 0.36), 1, { color, a: 0.4, r: 2.2 });
    g.rect(ix, gy + 12, 6, 2, { color: RGB.signal, a: 0.95, r: 2.8 });
    const cw = Math.floor((iw - 2) / 3);
    for (let k = 0; k < 3; k++) g.frame(ix + k * (cw + 1), gy + h - 8, cw, 6, { color, a: 0.55, r: 2.2 });
  } else if (variant === 'listings') {
    const cw = Math.floor((iw - 2) / 3);
    for (let k = 0; k < 3; k++) {
      g.rect(ix + k * (cw + 1), gy + 5, cw, 5, { color, a: 0.32, r: 2.3 });
      g.rect(ix + k * (cw + 1), gy + 11, cw - 1, 1, { color, a: 0.8, r: 2.4 });
      g.rect(ix + k * (cw + 1), gy + 13, Math.max(1, cw - 3), 1, { color, a: 0.45, r: 2 });
    }
    g.rect(ix, gy + h - 4, iw, 1, { color, a: 0.35, r: 2 });
  } else {
    // booking: month grid with a highlighted cell
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 7; c++) {
        const hit = r === 2 && c === 3;
        g.dot(ix + 1 + c * 1.6, gy + 6 + r * 1.6, { color: hit ? RGB.reply : color, a: hit ? 1 : 0.6, r: hit ? 3.4 : 2.1 });
      }
    }
    g.rect(ix, gy + h - 5, 7, 2, { color: RGB.signal, a: 0.95, r: 2.8 });
  }
}

/* ───────────────────────── card definitions ───────────────────────── */
const CARDS = [
  {
    key: 'home',
    accent: C.signal2,
    kicker: null,
    title: { pl: [FIRST, LAST], en: [FIRST, LAST] },
    titleSize: 120,
    sub: { pl: JOB_PL, en: JOB_EN },
    foot: { pl: 'Gliwice · Polska', en: 'Gliwice · Poland' },
    visual: 'map-home',
  },
  {
    key: 'about',
    accent: C.page2,
    kicker: { pl: 'O mnie', en: 'About' },
    title: { pl: [FIRST, LAST], en: [FIRST, LAST] },
    titleSize: 120,
    sub: { pl: 'Przedsiębiorca z Gliwic', en: 'Entrepreneur from Gliwice, Poland' },
    foot: { pl: 'OutreachPilot.pl · FastLanding.io', en: 'OutreachPilot.pl · FastLanding.io' },
    visual: 'mark',
  },
  {
    key: 'outreachpilot',
    accent: C.signal2,
    kicker: { pl: 'Produkt', en: 'Product' },
    title: { pl: ['OutreachPilot.pl'], en: ['OutreachPilot.pl'] },
    titleSize: 84,
    sub: { pl: 'Cold mailing B2B na polskich danych', en: 'B2B cold outreach on Polish company data' },
    foot: { pl: `Założyciel: ${PERSON_NAME}`, en: `Founder: ${PERSON_NAME}` },
    visual: 'map-outreach',
    kickerColor: C.signal,
  },
  {
    key: 'fastlanding',
    accent: C.page2,
    kicker: { pl: 'Studio', en: 'Studio' },
    title: { pl: ['FastLanding.io'], en: ['FastLanding.io'] },
    titleSize: 92,
    sub: { pl: 'Strony, chatboty AI, automatyzacje i aplikacje MVP', en: 'Websites, AI chatbots, automations and MVP apps' },
    foot: { pl: 'Stała cena · realizacja w dniach · zero spotkań', en: 'Fixed price · delivered in days · zero meetings' },
    visual: 'wire-fastlanding',
    kickerColor: C.page,
  },
  {
    key: 'work',
    accent: C.page2,
    kicker: { pl: 'Klienci FastLanding', en: 'FastLanding clients' },
    title: { pl: ['Realizacje'], en: ['Client work'] },
    titleSize: 118,
    sub: { pl: `${PROJECT_NAMES[0]} · ${PROJECT_NAMES[1]}\n${PROJECT_NAMES[2]}`, en: `${PROJECT_NAMES[0]} · ${PROJECT_NAMES[1]}\n${PROJECT_NAMES[2]}` },
    foot: { pl: `${PERSON_NAME} · FastLanding.io`, en: `${PERSON_NAME} · FastLanding.io` },
    visual: 'wire-work',
    kickerColor: C.page,
  },
  {
    key: 'contact',
    accent: C.signal2,
    kicker: { pl: 'Kontakt', en: 'Contact' },
    title: { pl: ['Kontakt'], en: ['Contact'] },
    titleSize: 132,
    sub: { pl: STUDIO_EMAIL, en: STUDIO_EMAIL },
    sub2: { pl: PRODUCT_EMAIL, en: PRODUCT_EMAIL },
    foot: { pl: 'Gliwice · Polska', en: 'Gliwice · Poland' },
    visual: 'map-ripple',
    kickerColor: C.signal,
  },
];

/* ───────────────────────── visuals ───────────────────────── */
function visual(kind) {
  if (kind === 'map-home') {
    const map = dotMap({ x0: 690, y0: 78, scale: 80, pitch: 9.6, seed: 11, glow: 2.4 });
    const g = map.at('Gliwice');
    const arcs = [
      ['Warszawa', RGB.signal, 0.3],
      ['Gdańsk', RGB.page, -0.3],
      ['Poznań', RGB.signal, 0.32],
      ['Szczecin', RGB.page, -0.26],
      ['Lublin', RGB.signal, -0.3],
    ]
      .map(([n, col, lift]) => dotArc(g, map.at(n), { color: col, lift }))
      .join('');
    const cities = ['Warszawa', 'Gdańsk', 'Poznań', 'Szczecin', 'Lublin', 'Wrocław', 'Kraków']
      .map((n) => cityDot(map.at(n), { r: 3.2, color: C.bone }))
      .join('');
    return map.svg + arcs + cities + cityDot(g, { color: C.signal, r: 6.5, ring: true, label: 'Gliwice', labelDx: 16, labelDy: 6, labelColor: C.bone });
  }
  if (kind === 'map-outreach') {
    const map = dotMap({ x0: 690, y0: 78, scale: 80, pitch: 9.6, seed: 5, glow: 2.9, dim: 0.95 });
    const g = map.at('Gliwice');
    const targets = ['Warszawa', 'Gdańsk', 'Poznań', 'Szczecin', 'Lublin', 'Białystok', 'Wrocław', 'Łódź', 'Kraków'];
    const arcs = targets
      .map((n, i) => dotArc(g, map.at(n), { color: RGB.signal, to: [255, 190, 165], lift: 0.26 + (i % 3) * 0.04, bow: i % 2 ? -1 : 1, r: 2.3 }))
      .join('');
    const cities = targets.map((n) => cityDot(map.at(n), { r: 3.6, color: C.bone })).join('');
    return map.svg + arcs + cities + cityDot(g, { color: C.signal, r: 7, ring: true });
  }
  if (kind === 'map-ripple') {
    const map = dotMap({ x0: 690, y0: 78, scale: 80, pitch: 9.6, seed: 3, glow: 1.9, dim: 0.85 });
    const [gx, gy] = map.at('Gliwice');
    let rings = '';
    [30, 58, 92, 132, 180].forEach((rad, i) => {
      const n = Math.round((2 * Math.PI * rad) / 11);
      for (let k = 0; k < n; k++) {
        const ang = (k / n) * Math.PI * 2;
        const col = conicAt(k / n);
        rings += `<circle cx="${f1(gx + rad * Math.cos(ang))}" cy="${f1(gy + rad * Math.sin(ang))}" r="${f1(2.6 - i * 0.28)}" fill="${rgb(col, f1(0.85 - i * 0.14))}"/>`;
      }
    });
    return map.svg + rings + cityDot([gx, gy], { color: C.signal, r: 7, ring: false });
  }
  if (kind === 'mark') {
    const cx = 900;
    const cy = 315;
    let rings = '';
    [195, 245, 295, 345].forEach((rad, i) => {
      const n = Math.round((2 * Math.PI * rad) / (12 + i * 1.5));
      for (let k = 0; k < n; k++) {
        const ang = (k / n) * Math.PI * 2 - Math.PI / 2;
        rings += `<circle cx="${f1(cx + rad * Math.cos(ang))}" cy="${f1(cy + rad * Math.sin(ang))}" r="${f1(3 - i * 0.45)}" fill="${rgb(conicAt(k / n), f1(0.85 - i * 0.2))}"/>`;
      }
    });
    const big = markSvg({ size: 290, title: false, id: 'big' }).replace('<svg ', `<svg x="${cx - 145}" y="${cy - 145}" `);
    return rings + big;
  }
  if (kind === 'wire-fastlanding') {
    const pitch = 12;
    const ox = 716;
    const oy = 100;
    const g = grid(pitch, ox, oy);
    windowWire(g, 0, 0, 38, 28, RGB.page, 'hero');
    // AI chatbot bubble, bottom-right, overlapping the window (solid ink underlay hides the wireframe behind it)
    g.raw(`<rect x="${ox + 22 * pitch - 8}" y="${oy + 19 * pitch - 8}" width="${17 * pitch + 16}" height="${10 * pitch + 16}" rx="10" fill="${C.ink}"/>`);
    g.frame(22, 19, 17, 10, { color: RGB.signal, a: 0.95, r: 2.8 });
    g.dot(27, 22, { color: RGB.signal, a: 1, r: 3.2 });
    g.dot(30, 22, { color: RGB.signal, a: 0.7, r: 3.2 });
    g.dot(33, 22, { color: RGB.signal, a: 0.4, r: 3.2 });
    g.rect(24, 25, 9, 1, { color: RGB.signal, a: 0.55, r: 2.3 });
    g.rect(24, 27, 6, 1, { color: RGB.signal, a: 0.35, r: 2.1 });
    return g.svg();
  }
  if (kind === 'wire-work') {
    const pitch = 11;
    const stack = [
      { ox: 776, oy: 52, w: 36, h: 24, color: RGB.page, variant: 'hero' },
      { ox: 736, oy: 216, w: 36, h: 24, color: RGB.signal, variant: 'listings' },
      { ox: 806, oy: 372, w: 34, h: 20, color: RGB.reply, variant: 'booking' },
    ];
    return stack
      .map((c, i) => {
        const g = grid(pitch, c.ox, c.oy);
        // solid ink underlay so each layer reads as sitting on top of the previous one
        if (i > 0) g.raw(`<rect x="${c.ox - 9}" y="${c.oy - 9}" width="${c.w * pitch + 6}" height="${c.h * pitch + 6}" rx="8" fill="${C.ink}" fill-opacity="0.96"/>`);
        windowWire(g, 0, 0, c.w, c.h, c.color, c.variant);
        return g.svg();
      })
      .join('');
  }
  throw new Error(`unknown visual ${kind}`);
}

/* ───────────────────────── card HTML ───────────────────────── */
const fontUrl = (rel) => pathToFileURL(path.join(ROOT, 'node_modules', rel)).href;
const FONT_CSS = `
@font-face{font-family:'Bricolage Grotesque';font-style:normal;font-weight:200 800;src:url('${fontUrl('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-ext-wght-normal.woff2')}') format('woff2-variations');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Bricolage Grotesque';font-style:normal;font-weight:200 800;src:url('${fontUrl('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2')}') format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Geist';font-style:normal;font-weight:100 900;src:url('${fontUrl('@fontsource-variable/geist/files/geist-latin-ext-wght-normal.woff2')}') format('woff2-variations');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Geist';font-style:normal;font-weight:100 900;src:url('${fontUrl('@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}') format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Instrument Serif';font-style:italic;font-weight:400;src:url('${fontUrl('@fontsource/instrument-serif/files/instrument-serif-latin-ext-400-italic.woff2')}') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Instrument Serif';font-style:italic;font-weight:400;src:url('${fontUrl('@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2')}') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
`;

const TEXT_W = 620; // max width of the text column in px

function cardHtml(card, lang) {
  const kickerColor = card.kickerColor ?? card.accent;
  const title = card.title[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
${FONT_CSS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;background:${C.ink};overflow:hidden}
body{position:relative;font-family:'Geist',system-ui,sans-serif;color:${C.bone};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.glow{position:absolute;inset:0;background:
  radial-gradient(620px 520px at 900px 300px, rgba(157,140,255,.13), transparent 70%),
  radial-gradient(460px 420px at 1010px 400px, rgba(255,106,61,.10), transparent 70%),
  radial-gradient(700px 500px at 0px 640px, rgba(255,106,61,.06), transparent 70%)}
svg.vis{position:absolute;left:0;top:0}
.maplabel{font:600 17px 'Geist',sans-serif;letter-spacing:.01em;paint-order:stroke;stroke:#07070a;stroke-width:5px;stroke-linejoin:round}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg, ${C.ink} 0, rgba(7,7,10,.94) 380px, rgba(7,7,10,.62) 560px, rgba(7,7,10,0) 700px)}
.edge{position:absolute;inset:0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);pointer-events:none}
.chip{position:absolute;left:72px;top:54px;display:flex;align-items:center;gap:14px}
.chip svg{width:44px;height:44px;display:block}
.chip span{font:600 22px 'Geist',sans-serif;color:${C.boneDim};letter-spacing:.01em}
.col{position:absolute;left:72px;top:112px;width:${TEXT_W}px;height:420px;display:flex;flex-direction:column;justify-content:center}
.kicker{display:flex;align-items:center;gap:14px;font:600 21px 'Geist',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${kickerColor};margin-bottom:26px}
.kicker i{display:block;width:34px;height:2px;background:${kickerColor};border-radius:2px}
h1{font:700 ${card.titleSize}px/0.98 'Bricolage Grotesque','Geist',sans-serif;letter-spacing:-0.035em;color:${C.bone}}
h1 .l{display:block;white-space:nowrap;width:max-content}
.sub{margin-top:28px;max-width:${TEXT_W - 20}px;font:italic 400 46px/1.12 'Instrument Serif',Georgia,serif;letter-spacing:-0.01em;color:${card.accent};text-wrap:balance}
.sub.two{margin-top:12px;font-size:44px}
.foot{position:absolute;left:72px;bottom:52px;font:500 22px 'Geist',sans-serif;color:${C.boneDim};letter-spacing:.01em}
</style></head><body>
<div class="glow"></div>
<svg class="vis" width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">${visual(card.visual)}</svg>
<div class="scrim"></div>
<div class="chip">${markSvg({ size: 44, title: false, id: 'c' })}<span>kacper.biz</span></div>
<div class="col">
  ${card.kicker ? `<div class="kicker"><i></i>${esc(card.kicker[lang])}</div>` : ''}
  <h1 data-fit="${TEXT_W}">${title.map((t) => `<span class="l">${esc(t)}</span>`).join('')}</h1>
  <div class="sub" data-fit-h="112">${esc(card.sub[lang]).replace(/\n/g, '<br>')}</div>
  ${card.sub2 ? `<div class="sub two" data-fit-h="60">${esc(card.sub2[lang])}</div>` : ''}
</div>
<div class="foot">${esc(card.foot[lang])}</div>
<div class="edge"></div>
</body></html>`;
}

/* ───────────────────────── rendering ───────────────────────── */
async function main() {
  const { chromium } = await import('playwright-core');
  const onlyArg = opt('only');
  const only = onlyArg ? onlyArg.split(',').map((s) => s.trim()).filter(Boolean) : null;
  const wantIcons = !flag('no-icons') && (!only || flag('icons'));
  const wantCards = !flag('icons');

  fs.mkdirSync(OG_DIR, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kacper-og-'));
  const browser = await chromium.launch({ executablePath: CHROMIUM, args: CHROMIUM_ARGS });
  const warnings = [];
  const written = [];

  try {
    /* icons */
    if (wantIcons) {
      const favicon = markSvg({ title: true });
      fs.writeFileSync(path.join(PUBLIC, 'favicon.svg'), favicon + '\n');
      written.push('public/favicon.svg');
      const iconJobs = [
        { file: 'apple-touch-icon.png', size: 180, rounded: false },
        { file: 'icon-192.png', size: 192, rounded: true },
        { file: 'icon-512.png', size: 512, rounded: true },
      ];
      for (const j of iconJobs) {
        const page = await browser.newPage({ viewport: { width: j.size, height: j.size }, deviceScaleFactor: 1 });
        await page.setContent(`<body style="margin:0;background:transparent">${markSvg({ rounded: j.rounded, size: j.size, title: false, id: 'i' })}</body>`);
        await page.screenshot({ path: path.join(PUBLIC, j.file), omitBackground: j.rounded, clip: { x: 0, y: 0, width: j.size, height: j.size } });
        await page.close();
        written.push(`public/${j.file}`);
      }
    }

    /* cards */
    if (wantCards) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
      for (const card of CARDS) {
        if (only && !only.some((o) => card.key === o || card.key.startsWith(o))) continue;
        for (const lang of ['pl', 'en']) {
          const file = path.join(tmp, `${card.key}-${lang}.html`);
          fs.writeFileSync(file, cardHtml(card, lang));
          await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
          await page.evaluate(() => document.fonts.ready);
          // Shrink any line that would overflow the text column (long PL strings), then report what happened.
          const report = await page.evaluate(() => {
            const out = [];
            for (const el of document.querySelectorAll('[data-fit-h]')) {
              const maxH = Number(el.getAttribute('data-fit-h'));
              let size = parseFloat(getComputedStyle(el).fontSize);
              const start = size;
              while (el.getBoundingClientRect().height > maxH && size > 24) {
                size -= 2;
                el.style.fontSize = `${size}px`;
              }
              out.push({ text: el.textContent, start, size, width: Math.round(el.getBoundingClientRect().height) });
            }
            for (const el of document.querySelectorAll('[data-fit]')) {
              const max = Number(el.getAttribute('data-fit'));
              let size = parseFloat(getComputedStyle(el).fontSize);
              const start = size;
              const widest = () => Math.max(...[...el.querySelectorAll('.l')].map((l) => l.getBoundingClientRect().width));
              while (widest() > max && size > 20) {
                size -= 2;
                el.style.fontSize = `${size}px`;
              }
              out.push({ text: el.textContent, start, size, width: Math.round(widest()) });
            }
            const fontsOk = ['700 40px "Bricolage Grotesque"', 'italic 400 40px "Instrument Serif"', '600 20px "Geist"'].every((f) => document.fonts.check(f));
            return { out, fontsOk };
          });
          if (!report.fontsOk) warnings.push(`${card.key}-${lang}: a brand font failed to load (fell back to system font)`);
          for (const r of report.out) if (r.size < r.start) warnings.push(`${card.key}-${lang}: shrank "${r.text}" ${r.start}px -> ${r.size}px to fit`);
          const name = lang === 'pl' ? `${card.key}.png` : `${card.key}-en.png`;
          await page.screenshot({ path: path.join(OG_DIR, name), clip: { x: 0, y: 0, width: 1200, height: 630 } });
          written.push(`public/og/${name}`);
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  /* optional lossless-ish palette optimisation, only if sharp happens to be installed (it ships with astro) */
  let optimised = false;
  try {
    const sharp = (await import('sharp')).default;
    for (const rel of written.filter((w) => w.startsWith('public/og/'))) {
      const abs = path.join(ROOT, rel);
      const before = fs.statSync(abs).size;
      const buf = await sharp(abs).png({ compressionLevel: 9, effort: 10 }).toBuffer();
      if (buf.length < before) fs.writeFileSync(abs, buf);
    }
    optimised = true;
  } catch {
    /* sharp not available: PNGs stay as Chromium wrote them */
  }

  for (const w of written) console.log(`wrote ${w} (${(fs.statSync(path.join(ROOT, w)).size / 1024).toFixed(0)} KB)`);
  if (optimised) console.log('(og PNGs re-compressed with sharp)');
  for (const w of warnings) console.warn(`WARN ${w}`);

  if (opt('preview')) {
    const files = written.filter((w) => w.startsWith('public/og/'));
    const sharp = (await import('sharp')).default;
    const tiles = await Promise.all(files.map((f) => sharp(path.join(ROOT, f)).resize(600, 315).toBuffer()));
    const cols = 2;
    const rows = Math.ceil(tiles.length / cols);
    await sharp({ create: { width: cols * 600, height: rows * 315, channels: 3, background: '#222' } })
      .composite(tiles.map((input, i) => ({ input, left: (i % cols) * 600, top: Math.floor(i / cols) * 315 })))
      .png()
      .toFile(path.resolve(opt('preview')));
    console.log(`wrote contact sheet ${opt('preview')}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
