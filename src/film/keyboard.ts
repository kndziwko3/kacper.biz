/**
 * The object: a machined 96% keyboard with exactly 100 keys, three of them solid copper (Esc, K and Enter): the 3 in
 * 100 micro-firms that list a website in CEIDG. Everything is procedural and in millimetres inside `rig` (scaled into
 * the studio). Chapters are poses of the same parts:
 *   0  the board, floating in a three-quarter product shot
 *   1  the caps lift off and file into a 10 x 10 grid: 97 PBT, 3 copper
 *   2  the board types by itself: "Dzień dobry, Panie Tomaszu", AltGr+N for the ń, then Enter
 *   3  the build, exploded: caps, switches, plate, PCB, case
 *   4  the board again, close on the copper Enter
 * The caps are one InstancedMesh whose vertex shader stretches a 1u cap into any width (nine-slice, so the corner radii
 * never smear) and whose fragment shader prints the legends from an atlas.
 */
import {
  BufferAttribute, BufferGeometry, CanvasTexture, Color, DynamicDrawUsage, ExtrudeGeometry, Group, InstancedBufferAttribute,
  InstancedMesh, LinearMipmapLinearFilter, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Path, Quaternion,
  Shape, SRGBColorSpace, Vector3, Euler, BoxGeometry, Plane, Ray, type WebGLRenderer,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import monoUrl from '../assets/fonts/martian-mono-latin.woff2?url';
import { TYPED_TEXT } from '../content/typed';

export { TYPED_TEXT };

/** Key pitch (mm) and world units per mm. */
export const P = 19.05;
export const MM = 0.0126;

type Kind = 0 | 1 | 2; // cream PBT, graphite PBT, copper
export interface Key {
  id: string;
  label: string;
  /** Left edge and row, in key units. */
  x: number;
  row: number;
  w: number;
  h: number;
  kind: Kind;
}

/* ── the layout: a 96% board, 19u by 6 rows, exactly 100 keys ── */
function layout(): Key[] {
  const keys: Key[] = [];
  const COPPER = new Set(['esc', 'k', 'enter']);
  const MODS = new Set(['tab', 'caps', 'lshift', 'rshift', 'lctrl', 'super', 'lalt', 'altgr', 'fn', 'backspace', 'prt', 'del', 'home', 'end', 'pgup', 'pgdn',
    'up', 'down', 'left', 'right', 'clear', 'n=', 'n/', 'n*', 'n-', 'n+', 'nenter']);
  const row = (r: number, x0: number, items: Array<[string, string, number?, number?]>) => {
    let x = x0;
    for (const [id, label, w = 1, h = 1] of items) {
      keys.push({ id, label, x, row: r, w, h, kind: COPPER.has(id) ? 2 : MODS.has(id) ? 1 : 0 });
      x += w;
    }
  };
  row(0, 0, [['esc', 'esc'], ...Array.from({ length: 12 }, (_, i) => [`f${i + 1}`, `F${i + 1}`] as [string, string]),
    ['prt', 'prt sc'], ['del', 'del'], ['home', 'home'], ['end', 'end'], ['pgup', 'pg up'], ['pgdn', 'pg dn']]);
  row(1, 0, [['grave', '`'], ...'1234567890'.split('').map((c) => [c, c] as [string, string]), ['minus', '-'], ['equal', '='], ['backspace', 'backspace', 2],
    ['clear', 'clear'], ['n=', '='], ['n/', '/'], ['n*', '*']]);
  row(2, 0, [['tab', 'tab', 1.5], ...'qwertyuiop'.split('').map((c) => [c, c.toUpperCase()] as [string, string]), ['lbr', '['], ['rbr', ']'], ['bslash', '\\', 1.5],
    ['n7', '7'], ['n8', '8'], ['n9', '9'], ['n-', '−']]);
  row(3, 0, [['caps', 'caps', 1.75], ...'asdfghjkl'.split('').map((c) => [c, c.toUpperCase()] as [string, string]), ['semi', ';'], ['quote', "'"], ['enter', 'enter', 2.25],
    ['n4', '4'], ['n5', '5'], ['n6', '6'], ['n+', '+']]);
  row(4, 0, [['lshift', 'shift', 2.25], ...'zxcvbnm'.split('').map((c) => [c, c.toUpperCase()] as [string, string]), ['comma', ','], ['dot', '.'], ['slash', '/'],
    ['rshift', 'shift', 1.75], ['up', '#up'], ['n1', '1'], ['n2', '2'], ['n3', '3'], ['nenter', 'enter', 1, 2]]);
  row(5, 0, [['lctrl', 'ctrl', 1.25], ['super', 'super', 1.25], ['lalt', 'alt', 1.25], ['space', '', 6.25], ['altgr', 'alt gr', 1.5], ['fn', 'fn', 1.5],
    ['left', '#left'], ['down', '#down'], ['right', '#right'], ['n0', '0'], ['ndot', '.']]);
  return keys;
}

export const KEYS = layout();
export const N = KEYS.length; // 100
const COLS = 19, ROWS = 6;
const KW = COLS * P, KD = ROWS * P;
const idx = (id: string) => KEYS.findIndex((k) => k.id === id);

/** Key centre in board space (mm): x right, z toward the typist. */
const centre = (k: Key) => new Vector3((k.x + k.w / 2) * P - KW / 2, 0, (k.row + k.h / 2) * P - KD / 2);

/* ── heights (mm, board space; y = 0 is the top of the plate) ── */
const CAP_Y = 7.4; // cap skirt above the plate
const TRAVEL = 3.8;
const CASE_TOP = 3.2;
const CASE_BOTTOM = -21;
const BEZEL = 10;
const CASE_W = KW + 2 * BEZEL, CASE_D = KD + 2 * BEZEL;

/* ── geometry ── */

/** Points of a rounded rectangle (x, z) with CS segments per corner, counter-clockwise seen from above. */
function outline(hx: number, hz: number, r: number, CS: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  const corners: Array<[number, number, number]> = [[1, 1, 0], [-1, 1, 1], [-1, -1, 2], [1, -1, 3]];
  for (const [sx, sz, q] of corners) {
    const cx = sx * (hx - r), cz = sz * (hz - r);
    for (let j = 0; j <= CS; j++) {
      const a = (q + j / CS) * Math.PI / 2;
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  }
  return pts;
}

/** A 1u cap (18 mm skirt, sculpted sides, filleted top, cylindrical dish). Wider caps are stretched in the shader. */
function capGeometry(): BufferGeometry {
  const CS = 5;
  const B = 9.0, TX = 6.4, TZ = 6.7, H = 8.2, F = 1.25, DISH = 0.6, rB = 1.1, rT = 2.2;
  const rings: Array<{ hx: number; hz: number; r: number; y: number; dish: number }> = [];
  const SIDE = 5;
  for (let i = 0; i <= SIDE; i++) {
    const t = i / SIDE;
    // the walls bow out a hair near the top, as a moulded cap does
    const e = t + 0.12 * Math.sin(Math.PI * t);
    rings.push({ hx: B + (TX + F - B) * e, hz: B + (TZ + F - B) * e, r: rB + (rT + F - rB) * t, y: t * (H - F), dish: 0 });
  }
  const FIL = 5;
  for (let i = 1; i <= FIL; i++) {
    const th = (i / FIL) * Math.PI / 2;
    rings.push({ hx: TX + F * Math.cos(th), hz: TZ + F * Math.cos(th), r: rT + F * Math.cos(th), y: H - F + F * Math.sin(th), dish: Math.sin(th) });
  }
  const TOP = 5;
  for (let i = 1; i < TOP; i++) {
    const s = 1 - i / TOP;
    rings.push({ hx: TX * s, hz: TZ * s, r: rT * s, y: H, dish: 1 });
  }
  const pos: number[] = [];
  const top: number[] = [];
  const index: number[] = [];
  const M = outline(1, 1, 0.5, CS).length;
  for (const ring of rings) {
    for (const [x, z] of outline(ring.hx, ring.hz, ring.r, CS)) {
      const dz = Math.min(1, Math.abs(z) / TZ);
      pos.push(x, ring.y - ring.dish * DISH * (1 - dz * dz), z);
      top.push(ring.dish > 0.5 ? 1 : 0);
    }
  }
  const centreV = pos.length / 3;
  pos.push(0, H - DISH, 0);
  top.push(1);
  for (let i = 0; i < rings.length - 1; i++) {
    for (let k = 0; k < M; k++) {
      const a = i * M + k, b = i * M + ((k + 1) % M), c = (i + 1) * M + k, d = (i + 1) * M + ((k + 1) % M);
      index.push(a, c, b, b, c, d);
    }
  }
  const last = (rings.length - 1) * M;
  for (let k = 0; k < M; k++) index.push(last + k, centreV, last + ((k + 1) % M));
  // bottom: its own ring, so its normal stays flat
  const base = pos.length / 3;
  for (const [x, z] of outline(B, B, rB, CS)) { pos.push(x, 0, z); top.push(0); }
  const bc = pos.length / 3;
  pos.push(0, 0, 0); top.push(0);
  for (let k = 0; k < M; k++) index.push(base + k, base + ((k + 1) % M), bc);
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('aTop', new BufferAttribute(new Float32Array(top), 1));
  g.setIndex(index);
  g.computeVertexNormals();
  // wind outward whatever the outline's handedness came out as
  const n = g.getAttribute('normal');
  if (n.getX(2) < 0 && pos[6]! > 0) { index.reverse(); g.setIndex(index); g.computeVertexNormals(); }
  return g;
}

/** A switch: plate-mounted housing, smoky top, cream stem. Vertex colours carry the two plastics. */
function switchGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const paint = (g: BufferGeometry, hex: string) => {
    const c = new Color(hex);
    const cols = new Float32Array(g.getAttribute('position').count * 3);
    for (let i = 0; i < cols.length; i += 3) { cols[i] = c.r; cols[i + 1] = c.g; cols[i + 2] = c.b; }
    g.setAttribute('color', new BufferAttribute(cols, 3));
    if (g.index) return g.toNonIndexed();
    return g;
  };
  const housing = new BoxGeometry(14, 5.2, 14); housing.translate(0, 2.6, 0);
  // the top housing tapers: squeeze the upper vertices
  const hp = housing.getAttribute('position');
  for (let i = 0; i < hp.count; i++) if (hp.getY(i) > 3) { hp.setX(i, hp.getX(i) * 0.8); hp.setZ(i, hp.getZ(i) * 0.84); }
  housing.computeVertexNormals();
  parts.push(paint(housing, '#5a524a'));
  const bottom = new BoxGeometry(13.6, 5, 13.6); bottom.translate(0, -2.9, 0);
  parts.push(paint(bottom, '#191715'));
  const stemA = new BoxGeometry(4.1, 3.6, 1.3); stemA.translate(0, 6.6, 0);
  const stemB = new BoxGeometry(1.3, 3.6, 4.1); stemB.translate(0, 6.6, 0);
  parts.push(paint(stemA, '#d9cdb8'), paint(stemB, '#d9cdb8'));
  const g = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))!;
  parts.forEach((p) => p.dispose());
  return g;
}

function roundedRect(w: number, d: number, r: number, holes: Array<{ x: number; z: number; w: number; d: number; r: number }> = []): Shape {
  const trace = (sh: Shape | Path, cx: number, cz: number, hw: number, hd: number, rr: number) => {
    const pts = outline(hw, hd, Math.min(rr, hw - 0.01, hd - 0.01), 6);
    sh.moveTo(cx + pts[0]![0], cz + pts[0]![1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(cx + pts[i]![0], cz + pts[i]![1]);
    sh.closePath();
  };
  const s = new Shape();
  trace(s, 0, 0, w / 2, d / 2, r);
  // (ExtrudeGeometry fixes the winding of the outline and the holes itself)
  for (const h of holes) { const hole = new Path(); trace(hole, h.x, h.z, h.w / 2, h.d / 2, h.r); s.holes.push(hole); }
  return s;
}

/** Extrude a shape drawn in (x, z) upward from y0 to y1 (ExtrudeGeometry extrudes along +Z; this turns it to +Y). */
function slab(shape: Shape, y0: number, y1: number, bevel = 0): BufferGeometry {
  const depth = Math.max(0.01, y1 - y0 - 2 * bevel);
  const g = new ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: bevel > 0 ? 4 : 0, curveSegments: 1,
  });
  // shape (x, y) -> world (x, -z); extrusion +Z -> +Y
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0 + bevel, 0);
  g.computeVertexNormals();
  return g;
}

/* ── the legend atlas: every key's printed label, set in Martian Mono ── */
const AT_C = 8, AT_R = 16, CELL_W = 256, CELL_H = 128;
/** Legend cell on the cap, in mm (centred on the cap top). */
const LEG_W = 25, LEG_H = 12.5;

async function legendAtlas(renderer: WebGLRenderer): Promise<CanvasTexture> {
  let family = 'ui-monospace, Menlo, monospace';
  try {
    const face = new FontFace('KB Legend', `url(${monoUrl})`, { weight: '100 800', stretch: '75% 112.5%' });
    await face.load();
    (document.fonts as FontFaceSet & { add(f: FontFace): void }).add(face);
    family = '"KB Legend", ' + family;
  } catch { /* the fallback monospace still prints legible legends */ }
  const cv = document.createElement('canvas');
  cv.width = AT_C * CELL_W; cv.height = AT_R * CELL_H;
  const g = cv.getContext('2d')!;
  g.clearRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const pxmm = CELL_W / LEG_W;
  KEYS.forEach((k, i) => {
    const cx = (i % AT_C) * CELL_W + CELL_W / 2, cy = Math.floor(i / AT_C) * CELL_H + CELL_H / 2;
    const l = k.label;
    if (!l) return;
    if (l.startsWith('#')) {
      // arrows: drawn, not typed
      const dir = l.slice(1);
      const a = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[dir] ?? 0;
      g.save(); g.translate(cx, cy); g.rotate(a);
      g.lineWidth = 0.42 * pxmm; g.lineCap = 'round'; g.lineJoin = 'round';
      const L = 2.1 * pxmm;
      g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.moveTo(L - 0.9 * pxmm, -0.9 * pxmm); g.lineTo(L, 0); g.lineTo(L - 0.9 * pxmm, 0.9 * pxmm); g.stroke();
      g.restore();
      return;
    }
    const word = l.length > 2;
    const size = (word ? 2.35 : l.length === 2 ? 3.0 : 3.7) * pxmm;
    g.font = `${word ? 520 : 560} ${size}px ${family}`;
    (g as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = word ? 'semi-condensed' : 'normal';
    g.fillText(l, cx, cy + size * 0.04);
  });
  const tex = new CanvasTexture(cv);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.flipY = false;
  return tex;
}

/* ── poses ── */

interface Tf { p: Vector3; q: Quaternion }
const tf = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): Tf => ({ p: new Vector3(x, y, z), q: new Quaternion().setFromEuler(new Euler(rx, ry, rz, 'YXZ')) });

/** Layers of the build, top to bottom. */
const LAYERS = ['caps', 'switches', 'plate', 'pcb', 'case'] as const;
type Layer = typeof LAYERS[number];

export interface Pose {
  /** The whole board in the studio (world units, radians). */
  rig: Tf;
  /** Per-layer offset in board millimetres (the explode). */
  layer: Record<Layer, Vector3>;
  /** Per-cap transform relative to the caps layer, and the cap's footprint (key units). */
  cap: Tf[];
  size: Array<[number, number]>;
  /** 0..1: order in which caps leave for this pose. */
  order: Float32Array;
}

const zero = () => new Vector3();
const layersAt = (o: Partial<Record<Layer, [number, number, number]>> = {}): Record<Layer, Vector3> =>
  Object.fromEntries(LAYERS.map((l) => [l, o[l] ? new Vector3(...o[l]!) : zero()])) as Record<Layer, Vector3>;

/** Row sculpt (OEM-like): the upper rows lean back toward the typist, the bottom row forward. */
const ROW_TILT = [0, 0, 0, 0, 0, 0];
const ROW_LIFT = [0, 0, 0, 0, 0, 0];

function seated(): Pick<Pose, 'cap' | 'size' | 'order'> {
  const cap = KEYS.map((k) => { const c = centre(k); return tf(c.x, CAP_Y + ROW_LIFT[k.row]!, c.z, ROW_TILT[k.row]!, 0, 0); });
  const size = KEYS.map((k) => [k.w, k.h] as [number, number]);
  const order = new Float32Array(N);
  KEYS.forEach((k, i) => { order[i] = (centre(k).x / KW + 0.5) * 0.7 + (k.row / ROWS) * 0.3; });
  return { cap, size, order };
}

/** The ten-by-ten: every cap squared to 1u and filed in a grid that tips toward the camera: cream first, graphite
 *  after, copper in cells 14, 58 and 87. */
export const CELL_OF: number[] = (() => {
  const COPPER_CELLS = [14, 58, 87];
  const free = Array.from({ length: N }, (_, i) => i).filter((c) => !COPPER_CELLS.includes(c));
  const cells = new Array<number>(N);
  let n = 0;
  KEYS.forEach((k, i) => { if (k.kind === 0) cells[i] = free[n++]!; });
  KEYS.forEach((k, i) => { if (k.kind === 1) cells[i] = free[n++]!; });
  let c = 0;
  KEYS.forEach((k, i) => { if (k.kind === 2) cells[i] = COPPER_CELLS[c++]!; });
  return cells;
})();
const GRID = 21.5;
const GRID_TILT = 0.62;
const GRID_Y = 128;
/** The direction a grid cap pops toward the viewer (board space). */
export const GRID_N = new Vector3(0, Math.cos(GRID_TILT), Math.sin(GRID_TILT));

function grid(): Pick<Pose, 'cap' | 'size' | 'order'> {
  const cap = KEYS.map((_, i) => {
    const c = CELL_OF[i]!;
    const gx = (c % 10) - 4.5, gz = Math.floor(c / 10) - 4.5;
    return tf(gx * GRID, GRID_Y - gz * GRID * Math.sin(GRID_TILT), gz * GRID * Math.cos(GRID_TILT), GRID_TILT, 0, 0);
  });
  const size = KEYS.map(() => [1, 1] as [number, number]);
  const order = new Float32Array(N);
  KEYS.forEach((_, i) => { const c = CELL_OF[i]!; order[i] = (Math.floor(c / 10) * 10 + (c % 10)) / 99; });
  return { cap, size, order };
}

export function buildPoses(): Pose[] {
  const s = seated(), g = grid();
  return [
    // 0: the board, three-quarter, floating
    { rig: tf(0.15, 1.35, 0, 0.35, -0.7, 0), layer: layersAt(), ...s },
    // 1: the grid over the board; the board settles lower and flatter
    // (the stripped board sinks away below the frame: the ten-by-ten floats alone)
    { rig: tf(0, 0.62, 0, 0.1, -0.3, 0), layer: layersAt({ switches: [0, -300, -120], plate: [0, -300, -120], pcb: [0, -300, -120], case: [0, -300, -120] }), ...g },
    // 2: typing, low along the rows
    { rig: tf(0, 1.0, 0, 0.05, 0.25, 0), layer: layersAt(), ...s },
    // 3: the build, exploded up and back
    { rig: tf(0, 0.72, -0.1, 0.34, -0.62, 0.04), layer: layersAt({ caps: [0, 118, -44], switches: [0, 78, -28], plate: [0, 44, -15], pcb: [0, 18, -4] }), ...s },
    // 4: the board again, close on Enter
    { rig: tf(0, 1.0, 0, 0.05, -0.35, 0), layer: layersAt(), ...s },
  ];
}

/** What the board types in chapter 2 (a chord per step; AltGr+N is the Polish ń). */
const TYPED: string[][] = [
  ['lshift', 'd'], ['z'], ['i'], ['e'], ['altgr', 'n'], ['space'], ['d'], ['o'], ['b'], ['r'], ['y'], ['comma'], ['space'],
  ['lshift', 'p'], ['a'], ['n'], ['i'], ['e'], ['space'], ['lshift', 't'], ['o'], ['m'], ['a'], ['s'], ['z'], ['u'], ['enter'],
].map((c) => c.map(idx).map(String));
/** Steps in the typing, one per character of TYPED_TEXT plus Enter. */
export const TYPED_STEPS = TYPED_TEXT.length + 1;
/** Local progress window the typing runs in. */
export const TYPE_FROM = 0.04, TYPE_TO = 0.92;

/** How far each key is pressed (0..1) at chapter-2 progress `local`. Returns the number of characters typed. */
function typing(local: number, out: Float32Array): number {
  out.fill(0);
  const n = TYPED.length;
  const u = ((local - TYPE_FROM) / (TYPE_TO - TYPE_FROM)) * n;
  if (u <= 0) return 0;
  for (let s = 0; s < n; s++) {
    const p = u - s;
    if (p < 0 || p > 1) continue;
    // a key goes down fast and stays down for most of its step, so a still frame always holds one key pressed
    const down = Math.min(1, Math.max(0, p / 0.08)) * Math.min(1, Math.max(0, (1 - p) / 0.1));
    for (const k of TYPED[s]!) { const i = Number(k); out[i] = Math.max(out[i]!, down); }
  }
  return Math.min(n, Math.floor(u + 0.3));
}

/* ── materials ── */

const CAP_VARY = 'varying vec3 vKey;\nvarying vec3 vCapN;\nvarying float vTopF;\nvarying float vKind;\nvarying float vGlyph;\nvarying float vPress;\nvarying float vTone;\n';

/** Cream PBT and the copper-hot glow of a pressed legend, in linear light. */
const CREAM_L = new Color('#e7dfd0');
const GLOW_L = new Color('#ff8a4a').multiplyScalar(4.5);

function capMaterial(atlas: CanvasTexture): MeshPhysicalMaterial {
  const m = new MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.58, metalness: 0, specularIntensity: 0.55, envMapIntensity: 1 });
  m.onBeforeCompile = (s) => {
    s.uniforms.uAtlas = { value: atlas };
    s.uniforms.uCream = { value: CREAM_L };
    s.uniforms.uGlow = { value: GLOW_L };
    s.vertexShader = 'attribute vec2 aSize;\nattribute float aKind;\nattribute float aGlyph;\nattribute float aTop;\nattribute float aPress;\nattribute float aTone;\n' + CAP_VARY + s.vertexShader
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        // nine-slice: move each half of the 1u cap outward, so a 6.25u bar keeps the 1u corners
        vec2 ext = (aSize - 1.0) * 0.5 * ${P.toFixed(2)};
        transformed.x += sign(position.x) * ext.x;
        transformed.z += sign(position.z) * ext.y;
        vKey = transformed; vCapN = objectNormal; vTopF = aTop; vKind = aKind; vGlyph = aGlyph; vPress = aPress; vTone = aTone;`);
    s.fragmentShader = 'uniform sampler2D uAtlas;\nuniform vec3 uCream;\nuniform vec3 uGlow;\n' + CAP_VARY + s.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        // legends: printed (dye-sub) on PBT, engraved on copper
        vec2 luv = vec2(vKey.x / ${LEG_W.toFixed(1)} + 0.5, vKey.z / ${LEG_H.toFixed(1)} + 0.5);
        float cell = floor(vGlyph + 0.5);
        vec2 auv = (vec2(mod(cell, ${AT_C}.0), floor(cell / ${AT_C}.0)) + clamp(luv, 0.0, 1.0)) / vec2(${AT_C}.0, ${AT_R}.0);
        float inCell = step(0.0, luv.x) * step(luv.x, 1.0) * step(0.0, luv.y) * step(luv.y, 1.0);
        float leg = texture2D(uAtlas, auv).a * inCell * smoothstep(0.55, 0.8, vCapN.y) * step(0.0, vGlyph);
        // in the ten-by-ten every PBT cap turns the same blank cream: 97 alike, 3 copper
        float plain = vKind < 1.5 ? vTone : 0.0;
        diffuseColor.rgb = mix(diffuseColor.rgb, uCream, plain);
        leg *= 1.0 - plain;
        vec3 legC = vKind < 0.5 ? vec3(0.03, 0.026, 0.022) : vKind < 1.5 ? vec3(0.74, 0.69, 0.61) : vec3(0.06, 0.025, 0.01);
        diffuseColor.rgb = mix(diffuseColor.rgb, legC, leg * (vKind > 1.5 ? 0.85 : 0.94));
        // the skirt darkens where it meets the plate (no light gets between the caps)
        diffuseColor.rgb *= mix(0.42, 1.0, smoothstep(0.2, 4.2, vKey.y));
        // a key that is down sits in its neighbours' shade
        diffuseColor.rgb *= 1.0 - 0.34 * vPress;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        // a pressed key lights its legend from below, copper-hot, like a shine-through cap
        totalEmissiveRadiance += uGlow * leg * vPress;`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        // PBT is matte with a sheen on the worn top; copper is polished
        // (the copper cap's filleted rim is buffed harder than its top, so the rim draws a bright ring)
        float rim = smoothstep(0.2, 0.45, vCapN.y) * (1.0 - smoothstep(0.82, 0.95, vCapN.y));
        roughnessFactor = vKind > 1.5 ? mix(0.2, 0.07, rim) + 0.3 * leg : roughnessFactor - 0.08 * vTopF;`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
        metalnessFactor = vKind > 1.5 ? 1.0 - 0.6 * leg : 0.0;`);
  };
  m.customProgramCacheKey = () => 'kb-cap';
  return m;
}

export interface Keyboard {
  rig: Group;
  poses: Pose[];
  apply(a: number, b: number, t: number, local: number, time: number): void;
  /** Characters of TYPED_TEXT on screen after the last apply (chapter 2); TYPED_STEPS once Enter went down. */
  typed: number;
  /** The pointer's ray in world space (null: no hover). Caps under it press while the board rests. */
  pointer(ray: Ray | null): void;
  /** The cap under the pointer (-1: none). */
  readonly over: number;
  /** World position and top normal of the copper caps (all three, or Enter alone): where the glint card aims. */
  copper(outP: Vector3, outN: Vector3, enterOnly: boolean): void;
  dispose(): void;
}

export async function buildKeyboard(renderer: WebGLRenderer, shadows: boolean): Promise<Keyboard> {
  const atlas = await legendAtlas(renderer);
  const rig = new Group();
  rig.scale.setScalar(MM);
  const layers = Object.fromEntries(LAYERS.map((l) => { const g = new Group(); g.name = l; rig.add(g); return [l, g]; })) as Record<Layer, Group>;
  const disposables: Array<{ dispose(): void }> = [atlas];

  /* caps */
  const capGeo = capGeometry();
  const capMat = capMaterial(atlas);
  const caps = new InstancedMesh(capGeo, capMat, N);
  caps.instanceMatrix.setUsage(DynamicDrawUsage);
  caps.castShadow = shadows; caps.receiveShadow = shadows; caps.frustumCulled = false;
  // copper as metal: its measured reflectance (linear), not the brand swatch, so it reads as metal and not resin
  const CREAM = new Color('#e7dfd0'), GRAPHITE = new Color('#35312d'), COPPER = new Color(0.93, 0.44, 0.22);
  KEYS.forEach((k, i) => caps.setColorAt(i, k.kind === 2 ? COPPER : k.kind === 1 ? GRAPHITE : CREAM));
  const aSize = new InstancedBufferAttribute(new Float32Array(N * 2), 2); aSize.setUsage(DynamicDrawUsage);
  capGeo.setAttribute('aSize', aSize);
  const aPress = new InstancedBufferAttribute(new Float32Array(N), 1); aPress.setUsage(DynamicDrawUsage);
  capGeo.setAttribute('aPress', aPress);
  const aTone = new InstancedBufferAttribute(new Float32Array(N), 1); aTone.setUsage(DynamicDrawUsage);
  capGeo.setAttribute('aTone', aTone);
  capGeo.setAttribute('aKind', new InstancedBufferAttribute(new Float32Array(KEYS.map((k) => k.kind)), 1));
  capGeo.setAttribute('aGlyph', new InstancedBufferAttribute(new Float32Array(KEYS.map((k, i) => (k.label ? i : -1))), 1));
  layers.caps.add(caps);
  disposables.push(capGeo, capMat, caps);

  /* switches */
  const swGeo = switchGeometry();
  const swMat = new MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const sw = new InstancedMesh(swGeo, swMat, N);
  const m4 = new Matrix4();
  KEYS.forEach((k, i) => { const c = centre(k); m4.makeTranslation(c.x, 0, c.z); sw.setMatrixAt(i, m4); });
  sw.castShadow = shadows; sw.receiveShadow = shadows; sw.frustumCulled = false;
  layers.switches.add(sw);
  disposables.push(swGeo, swMat, sw);

  /* plate: brushed aluminium, one cut-out per switch */
  const holes = KEYS.map((k) => { const c = centre(k); return { x: c.x, z: -c.z, w: 14, d: 14, r: 0.5 }; });
  const plateGeo = slab(roundedRect(KW + 4, KD + 4, 2, holes), -1.5, 0);
  const plateMat = new MeshPhysicalMaterial({ color: '#c4c0b9', metalness: 1, roughness: 0.36, envMapIntensity: 1.35 });
  const plate = new Mesh(plateGeo, plateMat);
  plate.castShadow = shadows; plate.receiveShadow = shadows;
  layers.plate.add(plate);
  disposables.push(plateGeo, plateMat);

  /* PCB: matte black, copper pads under every switch */
  const pcbCv = document.createElement('canvas');
  pcbCv.width = 2048; pcbCv.height = Math.round(2048 * (KD + 8) / (KW + 8));
  {
    const g = pcbCv.getContext('2d')!;
    g.fillStyle = '#0b0c0b'; g.fillRect(0, 0, pcbCv.width, pcbCv.height);
    const sx = pcbCv.width / (KW + 8), sz = pcbCv.height / (KD + 8);
    g.strokeStyle = 'rgba(200,112,63,0.55)'; g.lineWidth = 0.35 * sx;
    KEYS.forEach((k) => {
      const c = centre(k);
      const x = (c.x + KW / 2 + 4) * sx, z = (c.z + KD / 2 + 4) * sz;
      // traces: each switch to the row bus
      g.beginPath(); g.moveTo(x - 3.8 * sx, z - 2.5 * sz); g.lineTo(x - 3.8 * sx, z + 6 * sz); g.lineTo(x + 6 * sx, z + 6 * sz); g.stroke();
      g.fillStyle = '#c8703f';
      g.beginPath(); g.arc(x - 3.8 * sx, z - 2.5 * sz, 1.1 * sx, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x + 2.5 * sx, z - 5 * sz, 1.1 * sx, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#1d211e'; g.fillRect(x - 2 * sx, z - 2 * sz, 4 * sx, 4 * sz);
    });
  }
  const pcbTex = new CanvasTexture(pcbCv);
  pcbTex.colorSpace = SRGBColorSpace; pcbTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const pcbGeo = new BoxGeometry(KW + 8, 1.6, KD + 8);
  // top face UVs span the board: BoxGeometry already maps 0..1 per face
  const pcbMat = new MeshStandardMaterial({ map: pcbTex, roughness: 0.85, metalness: 0.05 });
  const pcb = new Mesh(pcbGeo, pcbMat);
  pcb.position.y = -6.4;
  pcb.castShadow = shadows; pcb.receiveShadow = shadows;
  layers.pcb.add(pcb);
  disposables.push(pcbTex, pcbGeo, pcbMat);

  /* case: CNC tray in anodised graphite, polished chamfer on the rim */
  const caseShape = roundedRect(CASE_W, CASE_D, 9, [{ x: 0, z: 0, w: KW + 6, d: KD + 6, r: 3 }]);
  const wallGeo = slab(caseShape, CASE_BOTTOM + 3, CASE_TOP, 1.6);
  const floorGeo = slab(roundedRect(CASE_W - 2, CASE_D - 2, 8.5), CASE_BOTTOM, CASE_BOTTOM + 6, 1.4);
  const caseGeo = mergeGeometries([wallGeo.toNonIndexed(), floorGeo.toNonIndexed()])!;
  wallGeo.dispose(); floorGeo.dispose();
  const caseMat = new MeshPhysicalMaterial({ color: '#2d2a27', metalness: 1, roughness: 0.36, envMapIntensity: 1.15 });
  // anodised graphite, but the diamond-cut chamfer shows bare polished aluminium: one bright line round the rim
  caseMat.onBeforeCompile = (sh) => {
    sh.vertexShader = 'varying vec3 vObjN;\n' + sh.vertexShader.replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n vObjN = objectNormal;');
    sh.fragmentShader = 'varying vec3 vObjN;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 an = abs(normalize(vObjN));
        float cut = 1.0 - smoothstep(0.9, 0.985, max(an.x, max(an.y, an.z)));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.66, 0.64, 0.6), cut);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.12, cut);');
  };
  caseMat.customProgramCacheKey = () => 'kb-case';
  const caseMesh = new Mesh(caseGeo, caseMat);
  caseMesh.castShadow = shadows; caseMesh.receiveShadow = shadows;
  layers.case.add(caseMesh);
  disposables.push(caseGeo, caseMat);

  const poses = buildPoses();
  const press = new Float32Array(N);
  const pp = new Vector3(), qq = new Quaternion(), tmpQ = new Quaternion(), e3 = new Euler(), one = new Vector3(1, 1, 1);
  const rp = new Vector3(), rq = new Quaternion(), lv = new Vector3();
  const K = { typed: 0, over: -1 };
  const COPPER_IDS = KEYS.map((k, i) => (k.kind === 2 ? i : -1)).filter((i) => i >= 0);
  const gm = new Matrix4(), gv = new Vector3();
  const ENTER = idx('enter');
  // hover: the cap under the pointer goes down, and springs back when the pointer leaves it
  const hover = new Float32Array(N);
  const worldRay = new Ray(), localRay = new Ray(), inv = new Matrix4(), hit = new Vector3();
  const capTop = new Plane(new Vector3(0, 1, 0), -(CAP_Y + 8));
  let hasRay = false, lastTime = 0;
  const RECTS = KEYS.map((k) => ({ x0: k.x * P - KW / 2, x1: (k.x + k.w) * P - KW / 2, z0: k.row * P - KD / 2, z1: (k.row + k.h) * P - KD / 2 }));
  const pick = (): number => {
    if (!hasRay) return -1;
    layers.caps.updateWorldMatrix(true, false);
    inv.copy(layers.caps.matrixWorld).invert();
    localRay.copy(worldRay).applyMatrix4(inv);
    if (!localRay.intersectPlane(capTop, hit)) return -1;
    return RECTS.findIndex((r) => hit.x > r.x0 && hit.x < r.x1 && hit.z > r.z0 && hit.z < r.z1);
  };

  const ease = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

  const apply = (a: number, b: number, t: number, local: number, time: number): void => {
    const A = poses[a]!, B = poses[b]!;
    const moving = a !== b;
    const et = ease(t);
    // the board
    rp.lerpVectors(A.rig.p, B.rig.p, et);
    rq.slerpQuaternions(A.rig.q, B.rig.q, et);
    const pose = moving ? (t < 0.5 ? a : b) : a;
    // a slow hover while it rests, so the light keeps travelling over the metal
    const w = moving ? 0 : 1;
    rp.y += Math.sin(time * 0.55) * 0.018 * w;
    e3.set(Math.sin(time * 0.37) * 0.006 * w, (pose === 0 ? (local - 0.3) * 0.22 : pose === 3 ? (local - 0.5) * 0.25 : pose === 1 ? (local - 0.5) * 0.12 : 0) * (moving ? 0 : 1), 0);
    tmpQ.setFromEuler(e3);
    rig.position.copy(rp);
    rig.quaternion.copy(rq).multiply(tmpQ);
    // layers (the explode keeps opening while chapter 3 holds)
    for (const l of LAYERS) {
      lv.lerpVectors(A.layer[l], B.layer[l], et);
      if (!moving && a === 3) lv.multiplyScalar(1 + 0.22 * local);
      layers[l].position.copy(lv);
    }
    // caps
    press.fill(0);
    if (!moving && a === 2) K.typed = typing(local, press);
    else K.typed = (moving ? a >= 2 : a > 2) ? TYPED_STEPS : 0;
    const dt = Math.min(0.1, Math.max(0, time - lastTime));
    lastTime = time;
    // the board wakes up once when the film starts on it: one wave of keystrokes runs from Esc to the numpad
    if (!moving && a === 0 && time > 0.3 && time < 3.2) {
      for (let i = 0; i < N; i++) {
        const k = KEYS[i]!;
        const s = (time - 0.45) * 1.25 - (k.x + k.w / 2) / COLS - k.row * 0.035;
        if (s > 0 && s < 0.2) press[i] = Math.max(press[i]!, Math.sin(Math.PI * s / 0.2) * 0.9);
      }
    }
    const over = !moving && (a === 0 || a === 4) ? pick() : -1;
    K.over = over;
    for (let i = 0; i < N; i++) {
      const target = i === over ? 1 : 0;
      hover[i] = hover[i]! + (target - hover[i]!) * (1 - Math.exp(-(target > hover[i]! ? 28 : 9) * dt));
      press[i] = Math.max(press[i]!, hover[i]!);
    }
    if (!moving && a === 4) {
      // Enter goes down once, near the end of the close
      const p = (local - 0.62) / 0.2;
      press[ENTER] = p > 0 && p < 1 ? Math.sin(Math.PI * Math.min(1, p * 1.4)) : 0;
    }
    const stagger = moving ? 0.45 : 0;
    for (let i = 0; i < N; i++) {
      const d = stagger * B.order[i]!;
      const lt = Math.min(1, Math.max(0, (t - d) / Math.max(1 - stagger, 1e-3)));
      const e = moving ? ease(lt) : 0;
      pp.lerpVectors(A.cap[i]!.p, B.cap[i]!.p, e);
      // caps lift clear of their switches before they travel, and settle straight down
      pp.y += Math.sin(Math.PI * e) * (26 + 22 * B.order[i]!);
      qq.slerpQuaternions(A.cap[i]!.q, B.cap[i]!.q, e);
      const sx = A.size[i]![0] + (B.size[i]![0] - A.size[i]![0]) * e;
      const sz = A.size[i]![1] + (B.size[i]![1] - A.size[i]![1]) * e;
      aSize.setXY(i, sx, sz);
      // in-chapter motion
      if (!moving && a === 1 && KEYS[i]!.kind === 2) {
        // the three copper caps step a cap and a half out of the field and tip their tops into the key light
        const pop = ease(Math.min(1, local * 1.6));
        pp.addScaledVector(GRID_N, 30 * pop);
        tmpQ.setFromEuler(e3.set(-0.32 * pop, 0.12 * pop, 0));
        qq.multiply(tmpQ);
      }
      pp.y -= press[i]! * TRAVEL;
      aPress.setX(i, press[i]!);
      aTone.setX(i, a === 1 && b === 1 ? 1 : a === 1 ? 1 - e : b === 1 ? e : 0);
      m4.compose(pp, qq, one);
      caps.setMatrixAt(i, m4);
    }
    caps.instanceMatrix.needsUpdate = true;
    aSize.needsUpdate = true;
    aPress.needsUpdate = true;
    aTone.needsUpdate = true;
  };

  apply(0, 0, 0, 0, 0);
  const kb: Keyboard = {
    rig, poses, apply: (a, b, t, local, time) => { apply(a, b, t, local, time); kb.typed = K.typed; },
    typed: 0,
    pointer(ray: Ray | null): void { hasRay = !!ray; if (ray) worldRay.copy(ray); },
    get over() { return K.over; },
    copper(outP: Vector3, outN: Vector3, enterOnly: boolean): void {
      caps.updateWorldMatrix(true, false);
      outP.set(0, 0, 0); outN.set(0, 0, 0);
      const ids = enterOnly ? [ENTER] : COPPER_IDS;
      for (const i of ids) {
        caps.getMatrixAt(i, gm);
        gm.premultiply(caps.matrixWorld);
        outP.add(gv.set(0, 8, 0).applyMatrix4(gm));
        outN.add(gv.set(0, 1, 0).transformDirection(gm));
      }
      outP.multiplyScalar(1 / ids.length); outN.normalize();
    },
    dispose(): void { disposables.forEach((d) => d.dispose()); },
  };
  return kb;
}

