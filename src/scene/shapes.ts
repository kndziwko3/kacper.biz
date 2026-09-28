/**
 * Procedural point targets for the six chapters. Everything is generated at runtime (no assets).
 *
 * Every chapter produces exactly `n` points, in random order, so any prefix of the arrays is a uniform
 * subset of that shape (this is what makes draw-range downshifting look graceful).
 *
 * Point "style" is one float: integer part = palette id, fractional part = brightness/2 (palette 7 = sweep,
 * where the fractional part is the sweep coordinate instead). Decoded in the vertex shader.
 */
import { CITIES, GLIWICE, pointInPolygon, polygonArea, polygonXY, project, unproject } from './poland';

export const CHAPTER_COUNT = 6;

export const PAL = { boneDim: 0, bone: 1, verm: 2, verm2: 3, peri: 4, peri2: 5, lime: 6, sweep: 7 } as const;

/** sRGB palette, index-aligned with PAL. Shared with the shaders through a uniform array. */
export const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [0.69, 0.68, 0.65], // bone dim   #b0ada6
  [0.937, 0.925, 0.902], // bone    #efece6
  [1.0, 0.416, 0.239], // vermilion #ff6a3d
  [1.0, 0.604, 0.463], // vermilion-2 #ff9a76
  [0.616, 0.549, 1.0], // periwinkle #9d8cff
  [0.769, 0.725, 1.0], // periwinkle-2 #c4b9ff
  [0.843, 1.0, 0.271], // lime #d7ff45
  [1, 1, 1], // sweep (computed in shader)
];

export function style(cid: number, brightness: number): number {
  return cid + Math.min(0.98, Math.max(0, brightness * 0.5));
}
function sweepStyle(u: number): number {
  return PAL.sweep + Math.min(0.98, Math.max(0, u * 0.98));
}
function dimStyle(s: number, f: number): number {
  const cid = Math.floor(s);
  if (cid >= PAL.sweep) return s;
  return cid + Math.min(0.98, (s - cid) * f);
}

// ---------------------------------------------------------------- rng + math
export interface Rng { r(): number; g(): number; range(a: number, b: number): number }
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const r = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    r,
    g: () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(6.2831853 * r()),
    range: (lo, hi) => lo + (hi - lo) * r(),
  };
}
function halton(i: number, base: number): number {
  let f = 1, res = 0;
  while (i > 0) { f /= base; res += f * (i % base); i = Math.floor(i / base); }
  return res;
}
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number): number => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/** Largest-remainder split of `total` into integer parts proportional to `weights`. */
export function alloc(total: number, weights: number[]): number[] {
  const sum = weights.reduce((s, w) => s + w, 0) || 1;
  const raw = weights.map((w) => (w / sum) * total);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((s, v) => s + v, 0);
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((p, q) => q[0] - p[0]);
  for (let k = 0; left > 0 && order.length > 0; k = (k + 1) % order.length, left--) out[order[k]![1]]! += 1;
  return out;
}

// ---------------------------------------------------------------- sink
interface Chapter { pos: Float32Array; style: Float32Array; flag: Float32Array }

class Sink {
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly z: Float32Array;
  readonly s: Float32Array;
  readonly f: Float32Array;
  i = 0;
  constructor(readonly n: number) {
    this.x = new Float32Array(n); this.y = new Float32Array(n); this.z = new Float32Array(n);
    this.s = new Float32Array(n); this.f = new Float32Array(n);
  }
  get left(): number { return this.n - this.i; }
  add(x: number, y: number, z: number, s: number, f = 0): void {
    if (this.i >= this.n) return;
    const i = this.i++;
    this.x[i] = x; this.y[i] = y; this.z[i] = z; this.s[i] = s; this.f[i] = f;
  }
  /** Random permutation -> packed chapter arrays. */
  finish(rng: Rng): Chapter {
    const n = this.n;
    const perm = new Uint32Array(n);
    for (let i = 0; i < n; i++) perm[i] = i;
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng.r() * (i + 1));
      const t = perm[i]!; perm[i] = perm[j]!; perm[j] = t;
    }
    const pos = new Float32Array(n * 3);
    const st = new Float32Array(n);
    const fl = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const p = perm[i]!;
      pos[i * 3] = this.x[p]!; pos[i * 3 + 1] = this.y[p]!; pos[i * 3 + 2] = this.z[p]!;
      st[i] = this.s[p]!; fl[i] = this.f[p]!;
    }
    return { pos, style: st, flag: fl };
  }
}

type StyleFn = number | (() => number);
const sv = (s: StyleFn): number => (typeof s === 'number' ? s : s());

// ---------------------------------------------------------------- 2D paths
type V2 = readonly [number, number];
interface Path { pts: V2[]; cum: number[]; len: number }

function mkPath(pts: V2[], closed: boolean): Path {
  const p = closed ? [...pts, pts[0]!] : pts;
  const cum = [0];
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1]! + Math.hypot(p[i]![0] - p[i - 1]![0], p[i]![1] - p[i - 1]![1]));
  return { pts: p, cum, len: cum[cum.length - 1]! };
}
function pathAt(p: Path, d: number): V2 {
  let lo = 0, hi = p.cum.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p.cum[m]! <= d) lo = m; else hi = m; }
  const seg = p.cum[hi]! - p.cum[lo]! || 1;
  const t = (d - p.cum[lo]!) / seg;
  const a = p.pts[lo]!, b = p.pts[hi]!;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function line(x0: number, y0: number, x1: number, y1: number): Path { return mkPath([[x0, y0], [x1, y1]], false); }
function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, seg: number, out: V2[]): void {
  for (let i = 0; i <= seg; i++) { const a = a0 + ((a1 - a0) * i) / seg; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
}
function rrectPath(cx: number, cy: number, w: number, h: number, r: number): Path {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  const p: V2[] = [];
  arcPts(x0 + rr, y1 - rr, rr, Math.PI, Math.PI / 2, 8, p); // TL
  arcPts(x1 - rr, y1 - rr, rr, Math.PI / 2, 0, 8, p); // TR
  arcPts(x1 - rr, y0 + rr, rr, 0, -Math.PI / 2, 8, p); // BR
  arcPts(x0 + rr, y0 + rr, rr, -Math.PI / 2, -Math.PI, 8, p); // BL
  return mkPath(p, true);
}
function circlePath(cx: number, cy: number, r: number, seg = 48): Path {
  const p: V2[] = [];
  for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return mkPath(p, true);
}
/** Chat bubble: rounded rect with a little tail on the bottom-left or bottom-right corner. */
function bubblePath(x0: number, y0: number, x1: number, y1: number, r: number, tail: 'left' | 'right'): Path {
  const p: V2[] = [];
  arcPts(x0 + r, y1 - r, r, Math.PI, Math.PI / 2, 8, p);
  arcPts(x1 - r, y1 - r, r, Math.PI / 2, 0, 8, p);
  if (tail === 'right') {
    p.push([x1, y0 + 0.16], [x1 + 0.16, y0 - 0.3], [x1 - 0.55, y0]);
  } else {
    arcPts(x1 - r, y0 + r, r, 0, -Math.PI / 2, 8, p);
  }
  if (tail === 'left') {
    p.push([x0 + 0.55, y0], [x0 - 0.16, y0 - 0.3], [x0, y0 + 0.16]);
  } else {
    arcPts(x0 + r, y0 + r, r, -Math.PI / 2, -Math.PI, 8, p);
  }
  return mkPath(p, true);
}

// ---------------------------------------------------------------- primitive emitters
interface Prim { weight: number; emit(k: number): void }

interface Ctx { rng: Rng; sink: Sink }

const LINE_W = 100; // points per unit length (relative)
const BAR_W = 1800; // points per unit area for solid bars/discs (relative)

function outline(c: Ctx, p: Path, z: number, s: StyleFn, dens = 1, jit = 0.004): Prim {
  return {
    weight: p.len * LINE_W * dens,
    emit: (k) => {
      for (let i = 0; i < k; i++) {
        const d = ((i + c.rng.r()) / k) * p.len;
        const [x, y] = pathAt(p, d);
        c.sink.add(x + c.rng.g() * jit, y + c.rng.g() * jit, z + c.rng.g() * 0.01, sv(s));
      }
    },
  };
}
function bar(c: Ctx, x0: number, x1: number, y: number, h: number, z: number, s: StyleFn, dens = 1): Prim {
  return {
    weight: (x1 - x0) * h * BAR_W * dens,
    emit: (k) => {
      for (let i = 0; i < k; i++) {
        const u = (i + c.rng.r()) / k;
        // round caps: shrink the vertical extent near the ends
        const e = Math.min(u * (x1 - x0), (1 - u) * (x1 - x0));
        const hh = (h / 2) * Math.sqrt(clamp01(e / (h / 2)));
        c.sink.add(x0 + u * (x1 - x0), y + (c.rng.r() * 2 - 1) * hh, z + c.rng.g() * 0.008, sv(s));
      }
    },
  };
}
function disc(c: Ctx, cx: number, cy: number, r: number, z: number, s: StyleFn, flag = 0, dens = 1): Prim {
  return {
    weight: Math.PI * r * r * BAR_W * dens,
    emit: (k) => {
      for (let i = 0; i < k; i++) {
        const rr = r * Math.sqrt((i + c.rng.r()) / k);
        const a = i * 2.39996323 + c.rng.r() * 0.6;
        c.sink.add(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, z + c.rng.g() * 0.01, sv(s), flag);
      }
    },
  };
}
function fillRect(c: Ctx, x0: number, y0: number, x1: number, y1: number, z: number, s: StyleFn, densPerArea: number): Prim {
  return {
    weight: (x1 - x0) * (y1 - y0) * densPerArea,
    emit: (k) => {
      const off = Math.floor(c.rng.r() * 500);
      for (let i = 0; i < k; i++) {
        c.sink.add(x0 + (x1 - x0) * halton(i + 1 + off, 2), y0 + (y1 - y0) * halton(i + 1 + off, 3), z + c.rng.g() * 0.02, sv(s));
      }
    },
  };
}
function fillPill(c: Ctx, cx: number, cy: number, w: number, h: number, z: number, s: StyleFn, densPerArea: number): Prim {
  const r = h / 2;
  return {
    weight: (w * h - (4 - Math.PI) * r * r) * densPerArea,
    emit: (k) => {
      const off = Math.floor(c.rng.r() * 500);
      let i = 1;
      let placed = 0;
      while (placed < k && i < k * 8 + 64) {
        const x = cx - w / 2 + w * halton(i + off, 2);
        const y = cy - h / 2 + h * halton(i + off, 3);
        i++;
        const dx = Math.max(Math.abs(x - cx) - (w / 2 - r), 0);
        const dy = Math.abs(y - cy);
        if (dx * dx + dy * dy <= r * r) { c.sink.add(x, y, z + c.rng.g() * 0.01, sv(s)); placed++; }
      }
      while (placed++ < k) c.sink.add(cx, cy, z, sv(s));
    },
  };
}
function runPrims(prims: Prim[], total: number): void {
  const counts = alloc(total, prims.map((p) => p.weight));
  prims.forEach((p, i) => p.emit(counts[i]!));
}
/** Ambient specks around a shape: keeps the composition breathing and gives depth. */
function dust(c: Ctx, k: number, rx: number, ry: number, rz: number, s: StyleFn): void {
  for (let i = 0; i < k; i++) {
    const a = c.rng.r() * Math.PI * 2;
    const rr = Math.sqrt(c.rng.r());
    c.sink.add(Math.cos(a) * rr * rx, Math.sin(a) * rr * ry, c.rng.g() * rz, sv(s));
  }
}

// ---------------------------------------------------------------- chapter 0: cloud
function buildCloud(n: number, c: Ctx): Chapter {
  const { rng, sink } = c;
  const K = 34;
  const R = [4.1, 2.6, 3.6] as const;
  const inBall = (): [number, number, number] => {
    let x: number, y: number, z: number;
    do { x = rng.range(-1, 1); y = rng.range(-1, 1); z = rng.range(-1, 1); } while (x * x + y * y + z * z > 1);
    return [x, y, z];
  };
  const centers: Array<{ x: number; y: number; z: number; sig: number; w: number }> = [];
  for (let k = 0; k < K; k++) {
    const [x, y, z] = inBall();
    centers.push({ x: x * R[0], y: y * R[1], z: z * R[2], sig: 0.14 + 0.5 * rng.r() * rng.r() + 0.1, w: 0.35 + rng.r() * 1.3 });
  }

  // clusters: bright cores fading outward
  const nCluster = Math.round(n * 0.53);
  const counts = alloc(nCluster, centers.map((q) => q.w * q.sig));
  centers.forEach((q, i) => {
    for (let j = 0; j < counts[i]!; j++) {
      const gx = rng.g(), gy = rng.g(), gz = rng.g();
      const r2 = gx * gx + gy * gy + gz * gz;
      const core = Math.exp(-r2 * 0.28);
      const roll = rng.r();
      const s = roll < 0.045 ? style(PAL.verm, 1.2 + 0.5 * core)
        : roll < 0.045 + 0.1 * core + 0.03 ? style(PAL.bone, 0.8 + 0.35 * core)
        : style(PAL.boneDim, 0.34 + 0.6 * core);
      sink.add(q.x + gx * q.sig, q.y + gy * q.sig * 0.8, q.z + gz * q.sig, s);
    }
  });

  // filaments: every cluster reaches for its two nearest neighbours (a faint cosmic web)
  const edges = new Map<string, [number, number]>();
  centers.forEach((p, i) => {
    const near = centers
      .map((q, j) => [Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z), j] as const)
      .filter(([, j]) => j !== i)
      .sort((u, v) => u[0] - v[0])
      .slice(0, 2);
    for (const [, j] of near) edges.set(i < j ? `${i}-${j}` : `${j}-${i}`, [Math.min(i, j), Math.max(i, j)]);
  });
  const edgeList = [...edges.values()];
  const lens = edgeList.map(([i, j]) => Math.hypot(centers[i]!.x - centers[j]!.x, centers[i]!.y - centers[j]!.y, centers[i]!.z - centers[j]!.z));
  const fil = alloc(Math.round(n * 0.14), lens);
  edgeList.forEach(([i, j], e) => {
    const p = centers[i]!, q = centers[j]!;
    const bx = (rng.r() - 0.5) * lens[e]! * 0.5, by = (rng.r() - 0.5) * lens[e]! * 0.5, bz = (rng.r() - 0.5) * lens[e]! * 0.5;
    const cx = (p.x + q.x) / 2 + bx, cy = (p.y + q.y) / 2 + by, cz = (p.z + q.z) / 2 + bz;
    for (let m = 0; m < fil[e]!; m++) {
      const t = (m + rng.r()) / fil[e]!;
      const u = 1 - t;
      const x = u * u * p.x + 2 * u * t * cx + t * t * q.x;
      const y = u * u * p.y + 2 * u * t * cy + t * t * q.y;
      const z = u * u * p.z + 2 * u * t * cz + t * t * q.z;
      const w = 0.03 + 0.03 * Math.sin(t * Math.PI);
      sink.add(x + rng.g() * w, y + rng.g() * w, z + rng.g() * w, style(rng.r() < 0.05 ? PAL.verm2 : PAL.boneDim, rng.range(0.35, 0.75)));
    }
  });

  // diffuse haze
  while (sink.left > 0) {
    const [x, y, z] = inBall();
    const len = Math.sqrt(x * x + y * y + z * z) || 1e-3;
    const rad = Math.pow(len, 0.55) / len;
    sink.add(x * rad * R[0] * 1.12, y * rad * R[1] * 1.12, z * rad * R[2] * 1.12, style(PAL.boneDim, rng.range(0.25, 0.55)));
  }
  return sink.finish(rng);
}

// ---------------------------------------------------------------- chapter 1/2: Poland
/** Gentle relief: the southern mountains lift off the plane a little. Deterministic, shared with the traffic arcs. */
export function terrainZ(x: number, y: number): number {
  const mount = smooth(50.7, 49.25, unproject(x, y)[1]);
  return 0.34 * mount * (0.7 + 0.3 * Math.sin(x * 3.1 + y * 2.3));
}
function relief(x: number, y: number, rng: Rng): number {
  return terrainZ(x, y) + rng.g() * 0.035;
}

function buildMap(n: number, c: Ctx): Chapter {
  const { rng, sink } = c;
  const poly = polygonXY();
  const area = polygonArea(poly);
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (const [x, y] of poly) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }

  const nBorder = Math.round(n * 0.11);
  const nGliwice = Math.round(n * 0.04);
  const nRing = Math.round(n * 0.012);
  const nCity = Math.round(n * 0.2);
  const nDust = Math.round(n * 0.07);
  const nInterior = n - nBorder - nGliwice - nRing - nCity - nDust;

  // --- interior: jittered hex lattice
  const h = Math.sqrt((2 * area) / (Math.sqrt(3) * nInterior));
  const interior: Array<[number, number]> = [];
  const rowH = (h * Math.sqrt(3)) / 2;
  for (let row = 0, y = minY; y <= maxY; y += rowH, row++) {
    for (let x = minX + (row % 2 ? h / 2 : 0); x <= maxX; x += h) {
      const px = x + rng.g() * h * 0.16, py = y + rng.g() * h * 0.16;
      if (pointInPolygon(px, py, poly)) interior.push([px, py]);
    }
  }
  while (interior.length < nInterior) {
    const px = rng.range(minX, maxX), py = rng.range(minY, maxY);
    if (pointInPolygon(px, py, poly)) interior.push([px, py]);
  }
  for (let i = interior.length - 1; i > 0; i--) { const j = Math.floor(rng.r() * (i + 1)); const t = interior[i]!; interior[i] = interior[j]!; interior[j] = t; }
  for (let i = 0; i < nInterior; i++) {
    const [x, y] = interior[i]!;
    const tex = 0.72 + 0.28 * Math.sin(x * 1.9 + 0.6) * Math.sin(y * 1.5 - 0.3);
    sink.add(x, y, relief(x, y, rng), style(PAL.boneDim, (0.62 + 0.32 * rng.r()) * tex));
  }

  // --- border: dense bright outline
  const border = mkPath(poly, true);
  for (let i = 0; i < nBorder; i++) {
    const [x, y] = pathAt(border, ((i + rng.r()) / nBorder) * border.len);
    const jx = rng.g() * 0.006, jy = rng.g() * 0.006;
    sink.add(x + jx, y + jy, relief(x, y, rng) + 0.02, style(PAL.bone, 1.0 + 0.45 * rng.r()));
  }

  // --- city clusters
  const cities = CITIES.map((ct) => ({ ...ct, xy: project(ct.lon, ct.lat) }));
  const cCounts = alloc(nCity, cities.map((ct) => Math.pow(ct.w, 1.15) + 0.03));
  cities.forEach((ct, i) => {
    const sig = 0.045 + 0.07 * Math.sqrt(ct.w);
    for (let j = 0; j < cCounts[i]!; j++) {
      let x = ct.xy[0], y = ct.xy[1];
      for (let t = 0; t < 8; t++) {
        const px = ct.xy[0] + rng.g() * sig, py = ct.xy[1] + rng.g() * sig;
        if (pointInPolygon(px, py, poly)) { x = px; y = py; break; }
      }
      const rr = Math.hypot(x - ct.xy[0], y - ct.xy[1]) / (2 * sig);
      const b = Math.max(0.75, 1.5 - 0.95 * rr) + (ct.dest ? 0.1 : 0);
      const warm = rng.r() < 0.13;
      sink.add(x, y, relief(x, y, rng) + 0.03, style(warm ? PAL.verm2 : PAL.bone, warm ? b * 0.85 : b));
    }
  });

  // --- Gliwice: the hotspot
  const [gx, gy] = project(GLIWICE[0], GLIWICE[1]);
  const gz = relief(gx, gy, rng) + 0.05;
  const nCore = Math.round(nGliwice * 0.42);
  for (let i = 0; i < nGliwice; i++) {
    const core = i < nCore;
    const sig = core ? 0.016 : 0.05;
    sink.add(gx + rng.g() * sig, gy + rng.g() * sig, gz + rng.g() * 0.02, style(core ? PAL.verm2 : PAL.verm, core ? rng.range(1.6, 1.96) : rng.range(1.3, 1.8)));
  }
  // thin "reach" ring around it
  for (let i = 0; i < nRing; i++) {
    const a = ((i + rng.r()) / nRing) * Math.PI * 2;
    const rr = 0.3 + rng.g() * 0.004;
    sink.add(gx + Math.cos(a) * rr, gy + Math.sin(a) * rr, gz, style(PAL.verm2, 0.75));
  }

  // --- dust
  dust(c, nDust, 4.6, 4.2, 0.85, () => style(PAL.boneDim, rng.range(0.18, 0.42)));

  return sink.finish(rng);
}

// ---------------------------------------------------------------- chapter 3: wireframe landing page
function buildPage(n: number, c: Ctx): Chapter {
  const { rng, sink } = c;
  const P1 = () => style(PAL.peri, rng.range(0.85, 1.05));
  const P2 = () => style(PAL.peri2, rng.range(1.0, 1.25));
  const PD = () => style(PAL.peri, rng.range(0.6, 0.85));
  const prims: Prim[] = [];

  // browser frame + chrome
  prims.push(outline(c, rrectPath(0, 0, 7.0, 4.9, 0.2), 0, P1, 1.15));
  prims.push(outline(c, line(-3.5, 2.04, 3.5, 2.04), 0, PD));
  prims.push(disc(c, -3.2, 2.25, 0.055, 0.02, () => style(PAL.verm, 1.4)));
  prims.push(disc(c, -2.98, 2.25, 0.055, 0.02, () => style(PAL.peri2, 1.3)));
  prims.push(disc(c, -2.76, 2.25, 0.055, 0.02, () => style(PAL.lime, 1.2)));
  prims.push(outline(c, rrectPath(0.35, 2.25, 3.4, 0.2, 0.1), 0.02, PD, 0.9));

  // nav: logo dot + wordmark + four bars
  prims.push(disc(c, -3.1, 1.68, 0.1, 0.06, () => style(PAL.lime, 1.5)));
  prims.push(bar(c, -2.88, -2.3, 1.68, 0.07, 0.05, P2));
  [0.55, 1.2, 1.85, 2.5].forEach((x) => prims.push(bar(c, x, x + 0.45, 1.68, 0.07, 0.05, PD)));

  // hero: two headline bars, paragraph, pill button
  prims.push(bar(c, -3.1, 0.55, 1.1, 0.21, 0.15, P2));
  prims.push(bar(c, -3.1, -0.35, 0.76, 0.21, 0.15, P2));
  prims.push(bar(c, -3.1, 0.35, 0.34, 0.06, 0.1, PD));
  prims.push(bar(c, -3.1, 0.55, 0.15, 0.06, 0.1, PD));
  prims.push(bar(c, -3.1, -0.2, -0.04, 0.06, 0.1, PD));
  prims.push(outline(c, rrectPath(-2.35, -0.5, 1.5, 0.36, 0.18), 0.3, P2, 1.1));
  prims.push(fillPill(c, -2.35, -0.5, 1.5, 0.36, 0.3, () => style(PAL.peri2, rng.range(0.7, 1.0)), 1400));
  prims.push(outline(c, rrectPath(-0.85, -0.5, 1.3, 0.36, 0.18), 0.2, PD, 0.8));

  // image block with diagonal, "sun"
  prims.push(outline(c, rrectPath(2.075, 0.35, 2.35, 2.1, 0.14), 0.1, P2, 1.05));
  prims.push(outline(c, line(0.98, -0.62, 3.17, 1.32), 0.1, PD, 0.9, 0.003));
  prims.push(outline(c, circlePath(1.5, 0.98, 0.17, 28), 0.12, PD, 0.9));
  prims.push(fillRect(c, 0.95, -0.65, 3.2, 1.35, 0.1, () => style(PAL.peri, rng.range(0.25, 0.45)), 220));

  // three feature cards
  [-2.3, 0, 2.3].forEach((cx, i) => {
    prims.push(outline(c, rrectPath(cx, -1.5, 2.1, 0.9, 0.13), 0.08, P1));
    prims.push(disc(c, cx - 0.75, -1.3, 0.12, 0.14, () => style(i === 0 ? PAL.verm2 : PAL.peri2, 1.3)));
    prims.push(bar(c, cx - 0.5, cx + 0.5, -1.3, 0.055, 0.12, P2, 0.9));
    prims.push(bar(c, cx - 0.9, cx + 0.3, -1.58, 0.05, 0.1, PD));
    prims.push(bar(c, cx - 0.9, cx + 0.75, -1.74, 0.04, 0.1, PD, 0.9));
  });

  // footer strip
  prims.push(outline(c, line(-3.5, -2.12, 3.5, -2.12), 0, PD, 0.7));
  prims.push(bar(c, -3.1, -2.05, -2.3, 0.05, 0.05, PD));
  prims.push(bar(c, 1.3, 3.1, -2.3, 0.05, 0.05, PD));

  // blueprint registration marks outside the four corners
  const tick = (sx: number, sy: number): void => {
    const x = 3.5 * sx + 0.28 * sx, y = 2.45 * sy + 0.28 * sy;
    prims.push(outline(c, mkPath([[x, y - 0.32 * sy], [x, y], [x - 0.32 * sx, y]], false), -0.1, () => style(PAL.peri, 0.7), 0.8));
  };
  tick(1, 1); tick(-1, 1); tick(1, -1); tick(-1, -1);

  // sparse page canvas
  prims.push(fillRect(c, -3.5, -2.45, 3.5, 2.04, 0.02, () => style(PAL.peri, rng.range(0.16, 0.3)), 90));

  const nDust = Math.round(n * 0.13);
  runPrims(prims, n - nDust);
  dust(c, nDust, 5.4, 3.7, 0.9, () => style(PAL.peri, rng.range(0.2, 0.5)));
  return sink.finish(rng);
}

// ---------------------------------------------------------------- chapter 4: chat
function buildChat(n: number, c: Ctx): Chapter {
  const { rng, sink } = c;
  const BONE = () => style(PAL.bone, rng.range(0.85, 1.1));
  const BONE2 = () => style(PAL.boneDim, rng.range(0.7, 0.95));
  const PERI = () => style(PAL.peri2, rng.range(1.0, 1.2));
  const PERI_D = () => style(PAL.peri, rng.range(0.6, 0.85));
  const prims: Prim[] = [];

  // user bubble (top right)
  prims.push(outline(c, bubblePath(0.55, 1.75, 3.5, 2.8, 0.3, 'right'), 0, BONE, 1.15));
  prims.push(bar(c, 0.92, 3.1, 2.44, 0.07, 0.06, PERI));
  prims.push(bar(c, 0.92, 2.35, 2.12, 0.07, 0.06, PERI_D));

  // bot bubble (left) with three text lines
  prims.push(outline(c, bubblePath(-3.5, -0.2, 1.05, 1.5, 0.34, 'left'), 0.08, PERI, 1.2));
  prims.push(bar(c, -3.12, 0.72, 1.09, 0.075, 0.16, BONE));
  prims.push(bar(c, -3.12, 0.55, 0.8, 0.075, 0.16, BONE));
  prims.push(bar(c, -3.12, -0.75, 0.51, 0.075, 0.16, BONE2));
  // the bot's "sent" dot, lime
  prims.push(disc(c, 0.7, 0.11, 0.075, 0.2, () => style(PAL.lime, 1.7)));
  prims.push(outline(c, circlePath(0.7, 0.11, 0.155, 30), 0.2, () => style(PAL.lime, 0.85), 0.9));

  // second user bubble
  prims.push(outline(c, bubblePath(-0.05, -1.6, 3.5, -0.6, 0.3, 'right'), 0.04, BONE, 1.1));
  prims.push(bar(c, 0.3, 3.1, -0.93, 0.07, 0.1, PERI));
  prims.push(bar(c, 0.3, 2.1, -1.25, 0.07, 0.1, PERI_D));

  // typing bubble with three pulsing dots (flag 1..3)
  prims.push(outline(c, bubblePath(-3.5, -2.8, -1.75, -1.95, 0.42, 'left'), 0.02, PERI, 1.1));
  [-3.02, -2.62, -2.22].forEach((x, i) => prims.push(disc(c, x, -2.38, 0.115, 0.15, () => style(PAL.peri2, rng.range(1.3, 1.6)), i + 1, 1.3)));

  // faint composer at the bottom right
  prims.push(outline(c, rrectPath(1.15, -2.42, 4.6, 0.7, 0.35), 0, PERI_D, 0.85));
  prims.push(bar(c, -0.9, 0.5, -2.42, 0.05, 0.02, () => style(PAL.peri, 0.5), 0.8));
  prims.push(disc(c, 3.0, -2.42, 0.2, 0.05, () => style(PAL.peri2, 0.95), 0, 0.8));

  const nDust = Math.round(n * 0.13);
  runPrims(prims, n - nDust);
  dust(c, nDust, 5.2, 4.0, 0.9, () => style(PAL.peri, rng.range(0.2, 0.5)));
  return sink.finish(rng);
}

// ---------------------------------------------------------------- chapter 5: finale rings
export interface RingSpec { axis: readonly [number, number, number]; speed: number }
export const RINGS: readonly RingSpec[] = [
  { axis: norm3(0.28, 1.0, 0.12), speed: 0.11 },
  { axis: norm3(-0.78, 0.9, 0.34), speed: -0.085 },
  { axis: norm3(0.92, 0.5, -0.42), speed: 0.06 },
];
function norm3(x: number, y: number, z: number): readonly [number, number, number] {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
}

function buildFinale(n: number, c: Ctx): Chapter {
  const { rng, sink } = c;
  const radii = [3.35, 2.45, 4.25] as const;
  const shares = [0.2, 0.15, 0.22] as const;
  const flagFor = (ring: number): number => 10 * (ring + 1);
  const nCore = Math.round(n * 0.1);
  const nSat = Math.round(n * 0.012);
  const nDisc = Math.round(n * 0.21);
  const ringCounts = shares.map((s) => Math.round(n * s));

  RINGS.forEach((ring, ri) => {
    const [ax, ay, az] = ring.axis;
    // orthonormal basis (u, v) perpendicular to the ring axis
    const t: [number, number, number] = Math.abs(ay) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let ux = ay * t[2] - az * t[1], uy = az * t[0] - ax * t[2], uz = ax * t[1] - ay * t[0];
    const ul = Math.hypot(ux, uy, uz); ux /= ul; uy /= ul; uz /= ul;
    const vx = ay * uz - az * uy, vy = az * ux - ax * uz, vz = ax * uy - ay * ux;
    const R = radii[ri]!;
    const k = ringCounts[ri]!;
    for (let i = 0; i < k; i++) {
      const u = (i + rng.r()) / k;
      const a = u * Math.PI * 2;
      const rad = R + rng.g() * 0.05 + rng.g() * 0.03;
      const off = rng.g() * 0.05;
      const ca = Math.cos(a) * rad, sa = Math.sin(a) * rad;
      const x = ux * ca + vx * sa + ax * off;
      const y = uy * ca + vy * sa + ay * off;
      const z = uz * ca + vz * sa + az * off;
      // sweep coordinate follows the angle; each ring is phase-shifted so the colours interleave
      const su = (u + ri / 3) % 1;
      sink.add(x, y, z, sweepStyle(su), flagFor(ri));
    }
    // a few bright "satellites" riding the ring
    const ns = Math.max(1, Math.round(nSat / 3));
    const a0 = rng.r() * Math.PI * 2;
    for (let i = 0; i < ns; i++) {
      const a = a0 + rng.g() * 0.05;
      const rad = R + rng.g() * 0.03;
      const ca = Math.cos(a) * rad, sa = Math.sin(a) * rad;
      sink.add(ux * ca + vx * sa + rng.g() * 0.03, uy * ca + vy * sa + rng.g() * 0.03, uz * ca + vz * sa + rng.g() * 0.03, sweepStyle((a0 / (Math.PI * 2) + ri / 3) % 1), flagFor(ri));
    }
  });

  // dense little core
  for (let i = 0; i < nCore; i++) {
    const d = Math.abs(rng.g()) * 0.34;
    const th = rng.r() * Math.PI * 2, ph = Math.acos(rng.range(-1, 1));
    sink.add(d * Math.sin(ph) * Math.cos(th), d * Math.cos(ph), d * Math.sin(ph) * Math.sin(th), style(rng.r() < 0.3 ? PAL.verm2 : PAL.bone, rng.range(1.1, 1.8)));
  }

  // faint accretion disc between and around the rings
  for (let i = 0; i < nDisc; i++) {
    const rr = 0.7 + Math.pow(rng.r(), 0.8) * 4.3;
    const a = rng.r() * Math.PI * 2;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    const y = rng.g() * 0.05 * (1 + rr * 0.2) + z * 0.12;
    sink.add(x, y, z, style(rng.r() < 0.5 ? PAL.peri : PAL.boneDim, rng.range(0.22, 0.5)));
  }

  dust(c, sink.left, 5.6, 4.6, 2.4, () => style(rng.r() < 0.5 ? PAL.peri : PAL.boneDim, rng.range(0.2, 0.45)));
  return sink.finish(rng);
}

// ---------------------------------------------------------------- public API
export interface Targets {
  count: number;
  /** length CHAPTER_COUNT, each n*3; pos[2] is the same array as pos[1] (traffic shares the map). */
  pos: Float32Array[];
  /** length CHAPTER_COUNT, each n. */
  style: Float32Array[];
  /** n*4: xyz random in [0,1), w = flags (typing dot 1..3 in ones digit + 10*ring id in tens digit). */
  rand: Float32Array;
}

/**
 * Builds all chapter targets. Generation is ~200ms of pure JS at 32k points, so it can yield to the main
 * thread between chapters (pass a `yieldToMain`) instead of blocking input in one long task.
 */
export async function buildTargets(n: number, seed = 20260928, yieldToMain?: () => Promise<void>): Promise<Targets> {
  const mk = (salt: number): Ctx => ({ rng: makeRng(seed + salt * 7919), sink: new Sink(n) });
  const pause = async (): Promise<void> => { if (yieldToMain) await yieldToMain(); };
  const chapters: Chapter[] = [];
  chapters.push(buildCloud(n, mk(1)));
  await pause();
  const map = buildMap(n, mk(2));
  chapters.push(map);
  chapters.push({ pos: map.pos, style: map.style.map((s) => dimStyle(s, 0.82)), flag: map.flag });
  await pause();
  chapters.push(buildPage(n, mk(4)));
  await pause();
  const chat = buildChat(n, mk(5));
  chapters.push(chat);
  await pause();
  const fin = buildFinale(n, mk(6));
  chapters.push(fin);

  const rng = makeRng(seed ^ 0x9e3779b9);
  const rand = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    rand[i * 4] = rng.r(); rand[i * 4 + 1] = rng.r(); rand[i * 4 + 2] = rng.r();
    rand[i * 4 + 3] = chat.flag[i]! + fin.flag[i]!;
  }
  return { count: n, pos: chapters.map((ch) => ch.pos), style: chapters.map((ch) => ch.style), rand };
}

