/**
 * Geometry for the "traffic" chapter: packets + trails + arc traces, reply ripples, and the hotspot halos.
 * No per-frame CPU work: every vertex carries its own route and timing, the shaders do the rest.
 */
import { BufferAttribute, BufferGeometry } from 'three';
import { CITIES, GLIWICE, project } from './poland';
import { alloc, makeRng, terrainZ } from './shapes';

export interface TrafficBuild {
  packets: BufferGeometry;
  ripples: BufferGeometry;
  glow: BufferGeometry;
}

interface Route {
  dest: readonly [number, number, number];
  home: readonly [number, number, number];
  ctrl: readonly [number, number, number];
  ctrlBack: readonly [number, number, number];
  period: number;
  phase: number;
  start: number;
  flight: number;
  reply: boolean;
  startBack: number;
  flightBack: number;
  w: number;
}

const TRAIL = 26;
const TRAIL_REPLY = 30;
const TRACE = 30;
export const TRAIL_SPAN = 0.3;
export const RIPPLE_DUR = 1.6;
const RIPPLE_DUR_HOME = 1.2;

function makeRoutes(count: number, seed: number): Route[] {
  const rng = makeRng(seed);
  const dests = CITIES.filter((c) => c.dest);
  const perCity = alloc(count, dests.map((c) => Math.pow(c.w, 0.8) + 0.12));
  const [hx, hy] = project(GLIWICE[0], GLIWICE[1]);
  const hz = terrainZ(hx, hy) + 0.05;
  const routes: Route[] = [];
  dests.forEach((city, ci) => {
    const [dx, dy] = project(city.lon, city.lat);
    const dz = terrainZ(dx, dy) + 0.04;
    const dist = Math.hypot(dx - hx, dy - hy);
    for (let k = 0; k < perCity[ci]!; k++) {
      const nx = -(dy - hy) / dist, ny = (dx - hx) / dist;
      const side = (rng.r() - 0.5) * 0.4 * dist;
      const lift = 0.6 + 0.62 * dist * (0.85 + 0.3 * rng.r());
      const ctrl = [(hx + dx) / 2 + nx * side, (hy + dy) / 2 + ny * side, lift] as const;
      const ctrlBack = [(hx + dx) / 2 - nx * side * 0.9 - nx * 0.12 * dist, (hy + dy) / 2 - ny * side * 0.9 - ny * 0.12 * dist, lift * 1.2 + 0.25] as const;
      const flight = Math.min(3.0, Math.max(1.6, 1.3 + 0.38 * dist));
      const start = rng.r() * 0.5;
      const reply = rng.r() < 0.3;
      const startBack = start + flight + 0.4;
      const flightBack = flight * 0.95;
      let period = rng.range(4.8, 7.6);
      const need = reply
        ? startBack + flightBack * (1 + TRAIL_SPAN) + RIPPLE_DUR_HOME + 0.2
        : start + flight * (1 + TRAIL_SPAN) + RIPPLE_DUR + 0.2;
      period = Math.max(period, need);
      routes.push({
        dest: [dx, dy, dz], home: [hx, hy, hz], ctrl, ctrlBack,
        period, phase: rng.r() * period, start, flight, reply, startBack, flightBack, w: city.w,
      });
    }
  });
  return routes;
}

class Rows {
  data: number[] = [];
  count = 0;
  push(...v: number[]): void { this.data.push(...v); this.count++; }
}

export function buildTraffic(routeCount: number, ringPoints: number, seed = 4242): TrafficBuild {
  const routes = makeRoutes(routeCount, seed);

  // ---- packets: trail sprites + arc trace sprites, forward and reply
  const pos = new Rows(); // per-vertex: pos(3) ctrl(3) end(3) timing(4) kind(4)
  const pushSprites = (
    from: readonly number[], ctrl: readonly number[], to: readonly number[],
    period: number, phase: number, start: number, dur: number, reply: boolean,
  ): void => {
    const sizeK = reply ? 0.62 : 1;
    for (let j = 0; j < (reply ? TRAIL_REPLY : TRAIL); j++) {
      pos.push(...from, ...ctrl, ...to, period, phase, start, dur, j, reply ? TRAIL_REPLY : TRAIL, reply ? 2 : 0, sizeK);
    }
    for (let j = 0; j < TRACE; j++) {
      pos.push(...from, ...ctrl, ...to, period, phase, start, dur, j, TRACE, reply ? 3 : 1, reply ? 0.8 : 1);
    }
  };
  for (const r of routes) {
    pushSprites(r.home, r.ctrl, r.dest, r.period, r.phase, r.start, r.flight, false);
    if (r.reply) pushSprites(r.dest, r.ctrlBack, r.home, r.period, r.phase, r.startBack, r.flightBack, true);
  }
  const packets = new BufferGeometry();
  const pd = new Float32Array(pos.data);
  const stride = 17;
  const mk = (off: number, size: number, name: string): void => {
    const a = new Float32Array(pos.count * size);
    for (let i = 0; i < pos.count; i++) for (let c = 0; c < size; c++) a[i * size + c] = pd[i * stride + off + c]!;
    packets.setAttribute(name, new BufferAttribute(a, size));
  };
  mk(0, 3, 'position'); mk(3, 3, 'aC'); mk(6, 3, 'aE'); mk(9, 4, 'aT'); mk(13, 4, 'aK');

  // ---- ripples: one flash + ring of dots per arrival, plus a small pulse at home per reply
  const rip = new Rows(); // position(3) ring(4) timing(4) col(1)
  const pushRipple = (
    c: readonly number[], maxR: number, strength: number, period: number, phase: number, arrive: number, dur: number, col: number,
  ): void => {
    rip.push(...c, 0, 1, maxR, strength, period, phase, arrive, dur, col);
    for (let j = 0; j < ringPoints; j++) {
      rip.push(...c, (j / ringPoints) * Math.PI * 2, 0, maxR, strength, period, phase, arrive, dur, col);
    }
  };
  for (const r of routes) {
    const big = r.reply;
    pushRipple(r.dest, (big ? 0.62 : 0.36) + 0.22 * r.w, big ? 1.0 : 0.5, r.period, r.phase, r.start + r.flight, RIPPLE_DUR, 6);
    if (r.reply) pushRipple(r.home, 0.5, 0.55, r.period, r.phase, r.startBack + r.flightBack, RIPPLE_DUR_HOME, 2);
  }
  const ripples = new BufferGeometry();
  const rd = new Float32Array(rip.data);
  const rs = 12;
  const mkR = (off: number, size: number, name: string): void => {
    const a = new Float32Array(rip.count * size);
    for (let i = 0; i < rip.count; i++) for (let c = 0; c < size; c++) a[i * size + c] = rd[i * rs + off + c]!;
    ripples.setAttribute(name, new BufferAttribute(a, size));
  };
  mkR(0, 3, 'position'); mkR(3, 4, 'aRing'); mkR(7, 4, 'aT'); mkR(11, 1, 'aCol');

  // ---- glow halos (local space): x,y,z | diameter, intensity, palette id, phase | chapter range
  const glow = new Rows();
  const [hx, hy] = project(GLIWICE[0], GLIWICE[1]);
  const hz = terrainZ(hx, hy) + 0.05;
  glow.push(hx, hy, hz, 1.6, 0.5, 2, 0, 1, 2);
  glow.push(hx, hy, hz, 0.5, 0.95, 3, 1.3, 1, 2);
  // closing close-up on Gliwice (chapter 5): tighter, calmer halo
  glow.push(hx, hy, hz, 0.9, 0.26, 2, 0.6, 5, 5);
  glow.push(hx, hy, hz, 0.28, 0.42, 3, 2.1, 5, 5);
  for (const c of CITIES) {
    const [x, y] = project(c.lon, c.lat);
    const z = terrainZ(x, y) + 0.03;
    // the neighbours stay faintly lit in the close-up
    if (Math.hypot(x - hx, y - hy) < 1.6) glow.push(x, y, z, 0.2 + 0.3 * Math.sqrt(c.w), 0.25 + 0.2 * c.w, 1, x * 3.1 + y, 5, 5);
  }
  const glowGeo = new BufferGeometry();
  const gd = new Float32Array(glow.data);
  const gp = new Float32Array(glow.count * 3);
  const gi = new Float32Array(glow.count * 4);
  const gr = new Float32Array(glow.count * 2);
  for (let i = 0; i < glow.count; i++) {
    gp.set(gd.subarray(i * 9, i * 9 + 3), i * 3);
    gi.set(gd.subarray(i * 9 + 3, i * 9 + 7), i * 4);
    gr.set(gd.subarray(i * 9 + 7, i * 9 + 9), i * 2);
  }
  glowGeo.setAttribute('position', new BufferAttribute(gp, 3));
  glowGeo.setAttribute('aInfo', new BufferAttribute(gi, 4));
  glowGeo.setAttribute('aRange', new BufferAttribute(gr, 2));

  for (const g of [packets, ripples, glowGeo]) g.boundingSphere = null;
  return { packets, ripples, glow: glowGeo };
}
