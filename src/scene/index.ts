/**
 * kacper.biz scroll-driven 3D world.
 *
 * One morphing THREE.Points cloud printed in ink on the page's yellow stock (Poland map -> email routes ->
 * landing page -> chat -> close-up on Gliwice),
 * driven by which [data-scene] section is on screen (see tracker.ts). Native scroll only.
 * The canvas survives page navigations (ClientRouter + transition:persist): `rescan()` re-reads the new
 * page and the world morphs to its first chapter instead of restarting.
 *
 * Draw calls: main points, marker rings, traffic packets, ripples (4).
 * No post-processing.
 */
import {
  AddEquation, BufferAttribute, BufferGeometry, CustomBlending, Group, OneFactor, OneMinusSrcAlphaFactor,
  PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3, WebGLRenderer,
} from 'three';
import { project } from './poland';
import { GLOW_FRAG, GLOW_VERT, MAIN_VERT, RIPPLE_VERT, SPRITE_FRAG, TRAFFIC_VERT } from './shaders';
import { CHAPTER_COUNT, PALETTE, buildTargets, mapPitch, terrainZ } from './shapes';
import { SectionTracker, type Sample } from './tracker';
import { TRAIL_SPAN, buildTraffic } from './traffic';
import { HOME, VIEWS, chapterScales, type Frame, type Scales } from './view';

export interface SceneHandle {
  destroy(): void;
  /** Re-read [data-scene] sections after a page swap. */
  rescan(): void;
  /** Light up a city on the map (registry demo); `w` (0..1) sets how far the ink spreads. */
  setCity(lat: number, lon: number, w?: number): void;
  clearCity(): void;
}

export type Tier = 'high' | 'mid' | 'low';

export interface SceneStats {
  tier: Tier;
  count: number;
  dpr: number;
  /** 0 = as picked, 1/2 = downshifted after slow frames. */
  level: number;
  /** Smoothed frame time in ms (0 when not animating). */
  frameMs: number;
  c: number;
  side: number;
  frames: number;
}

export interface SceneOptions {
  reducedMotion: boolean;
  /** Force a quality tier (debugging). */
  tier?: Tier;
  /** Set false to disable the frame-time downshift (debugging under software GL). Default true. */
  adaptive?: boolean;
  /** Called after every rendered frame (debugging). Passing `tier` also keeps the animation on software GL. */
  onStats?: (s: SceneStats) => void;
}

interface TierConfig { count: number; dpr: number; routes: number; ring: number }
const TIERS: Record<Tier, TierConfig> = {
  high: { count: 32000, dpr: 1.5, routes: 88, ring: 56 },
  mid: { count: 16000, dpr: 1.5, routes: 64, ring: 48 },
  low: { count: 8000, dpr: 1.0, routes: 44, ring: 36 },
};

const FOV = 26; // long lens: keeps off-centre shapes from shearing
const CAM_Z = 19.5;
const TAN_HALF = Math.tan((FOV * Math.PI) / 360);
const VIS_H = 2 * TAN_HALF * CAM_Z;

const CONTEXT_ATTRS: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: true,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: false,
};

const clamp = (x: number, a: number, b: number): number => Math.min(b, Math.max(a, x));
const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const smoother = (x: number): number => x * x * x * (x * (x * 6 - 15) + 10);

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/** A software rasteriser (SwiftShader, llvmpipe): every frame costs main-thread CPU, so we draw stills only. */
function isSoftware(gl: WebGL2RenderingContext): boolean {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return !!ext && /swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)));
  } catch { return false; } // masked renderer: assume hardware
}

function pickTier(gl: WebGL2RenderingContext): Tier {
  const nav = navigator as NavigatorHints;
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory ?? (cores >= 8 ? 8 : 4);
  const saveData = nav.connection?.saveData === true;
  let coarse = false;
  try { coarse = !window.matchMedia('(pointer: fine)').matches; } catch { /* keep default */ }
  if (saveData || isSoftware(gl) || cores <= 2 || mem <= 2) return 'low';
  if (coarse || window.innerWidth < 700 || cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}

function makeMaterial(vertexShader: string, fragmentShader: string, uniforms: Record<string, { value: unknown }>): ShaderMaterial {
  return new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    // premultiplied ink laid "over" what is already printed
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneMinusSrcAlphaFactor,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneMinusSrcAlphaFactor,
  });
}

/**
 * What is on screen: a chapter pair and the progress between them. Follows the tracker's target, but never
 * jumps: if the target is an unrelated pair (anchor link, page swap), it first finishes toward the nearest
 * end, then morphs from there. Any chapter can follow any other.
 */
interface Vis { a: number; b: number; t: number }

function advance(v: Vis, target: Sample, dt: number): void {
  const { a: ta, b: tb, t: tt } = target;
  if (v.a === v.b) {
    if (ta === tb) { if (ta !== v.a) { v.b = ta; v.t = 0; } }
    else if (v.a === ta) { v.b = tb; v.t = 0; }
    else if (v.a === tb) { v.a = ta; v.b = tb; v.t = 1; }
    else { v.b = tt < 0.5 ? ta : tb; v.t = 0; }
  }
  let goal: number;
  if (v.a === ta && v.b === tb) goal = ta === tb ? 0 : tt;
  else if (v.a === tb && v.b === ta) { v.a = ta; v.b = tb; v.t = 1 - v.t; goal = tt; }
  else if (v.b === ta || v.b === tb) goal = 1;
  else if (v.a === ta || v.a === tb) goal = 0;
  else goal = v.t > 0.5 ? 1 : 0;
  const d = goal - v.t;
  const k = 1 - Math.exp(-dt * 3.5);
  const floor = dt * 0.12; // a minimum speed, so time-driven morphs finish instead of creeping
  v.t += Math.abs(d * k) < floor ? Math.sign(d) * Math.min(Math.abs(d), floor) : d * k;
  const exact = v.a === ta && v.b === tb;
  if (v.t >= 0.9995 && !(exact && tt < 0.9995)) { v.a = v.b; v.t = 0; }
  else if (v.t <= 0.0005 && !(exact && tt > 0.0005)) { v.b = v.a; v.t = 0; }
}

/** Returns null (never throws) when WebGL2 is unavailable or anything goes wrong while building the scene. */
export async function mountScene(canvas: HTMLCanvasElement, opts: SceneOptions): Promise<SceneHandle | null> {
  try {
    return await create(canvas, opts);
  } catch {
    return null;
  }
}

async function create(canvas: HTMLCanvasElement, opts: SceneOptions): Promise<SceneHandle | null> {
  let gl: WebGL2RenderingContext | null = null;
  try { gl = canvas.getContext('webgl2', CONTEXT_ATTRS); } catch { gl = null; }
  if (!gl || gl.isContextLost()) return null;

  const tier = opts.tier ?? pickTier(gl);
  const cfg = TIERS[tier];
  const staticMode = opts.reducedMotion || (opts.tier === undefined && isSoftware(gl));
  const adaptive = opts.adaptive !== false;
  const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array;
  const maxPoint = Math.min(range[1] ?? 64, 512);

  const renderer = new WebGLRenderer({
    canvas,
    context: gl,
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const disposables: Array<{ dispose(): void }> = [];
  try {
    // ------------------------------------------------------------------ geometry
    const n = cfg.count;
    const targets = await buildTargets(n, undefined, () => new Promise<void>((r) => window.setTimeout(r, 0)));
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(targets.pos[0]!, 3));
    const map = new BufferAttribute(targets.pos[1]!, 3);
    geo.setAttribute('aP1', map);
    geo.setAttribute('aP2', map); // traffic reuses the map targets
    geo.setAttribute('aP3', new BufferAttribute(targets.pos[3]!, 3));
    geo.setAttribute('aP4', new BufferAttribute(targets.pos[4]!, 3));
    geo.setAttribute('aP5', map); // so does the close-up
    const sA = new Float32Array(n * 3);
    const sB = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      sA[i * 3] = targets.style[0]![i]!; sA[i * 3 + 1] = targets.style[1]![i]!; sA[i * 3 + 2] = targets.style[2]![i]!;
      sB[i * 3] = targets.style[3]![i]!; sB[i * 3 + 1] = targets.style[4]![i]!; sB[i * 3 + 2] = targets.style[5]![i]!;
    }
    geo.setAttribute('aSA', new BufferAttribute(sA, 3));
    geo.setAttribute('aSB', new BufferAttribute(sB, 3));
    geo.setAttribute('aRand', new BufferAttribute(targets.rand, 4));
    geo.boundingSphere = null;
    let drawCount = n;
    geo.setDrawRange(0, drawCount);
    disposables.push(geo);

    const traffic = buildTraffic(cfg.routes, cfg.ring);
    disposables.push(traffic.packets, traffic.ripples, traffic.glow);

    // ------------------------------------------------------------------ uniforms
    const pal = PALETTE.map(([r, g, b]) => new Vector3(r, g, b));
    const shared = {
      uTime: { value: 0 },
      uPx: { value: 1 },
      uPxW: { value: 1 },
      uRef: { value: CAM_Z },
      uMaxPt: { value: maxPoint },
      uGScale: { value: 1 },
      uPal: { value: pal },
    };
    const uA = { value: 1 }, uB = { value: 1 }, uT = { value: 0 };
    const uW = { value: [0, 1, 0, 0, 0, 0] };
    const uChatW = { value: 0 }, uMapW = { value: 1 };
    const uIntro = { value: staticMode ? 1 : 0 };
    const uDim = { value: 1 };
    const uFade = { value: 1 };
    const uTraffic = { value: 0 };
    const uFocus = { value: 0 };
    const uCity = { value: new Vector3(0, 0, 0) };
    const uCityAmt = { value: 0 };
    const uCityR = { value: 0 };

    const mainUniforms = {
      uTime: shared.uTime, uPx: shared.uPx, uRef: shared.uRef, uMaxPt: shared.uMaxPt, uPal: shared.uPal,
      uA, uB, uT, uChatW, uMapW, uIntro, uDim, uFocus, uCity, uCityAmt, uCityR,
      uPitch: { value: mapPitch(n) }, uGScale: shared.uGScale, uPxW: shared.uPxW,
      uHome: { value: new Vector3(HOME[0], HOME[1], HOME[2]) },
      uSize: { value: [2.9, 2.3, 2.3, 2.3, 2.4, 3.1] },
      // the printed map holds still (an ordered screen cannot wobble); only the cloud and the drawings breathe
      uDrift: { value: [0.085, 0, 0, 0.01, 0.01, 0] },
      uBloomK: { value: [0.07, 0.09, 0.09, 0.14, 0.14, 0.11] },
    };
    const mainMat = makeMaterial(MAIN_VERT, SPRITE_FRAG, { ...mainUniforms, uBloom: { value: 0 } });
    const glowMat = makeMaterial(GLOW_VERT, GLOW_FRAG, {
      uW, uDim: uFade, uCity, uCityAmt, uCityR, uPxW: shared.uPxW, uGScale: shared.uGScale, uMaxPt: shared.uMaxPt, uPal: shared.uPal,
    });
    const packetMat = makeMaterial(TRAFFIC_VERT, SPRITE_FRAG, {
      uTime: shared.uTime, uPx: shared.uPx, uRef: shared.uRef, uMaxPt: shared.uMaxPt, uPal: shared.uPal,
      uTraffic, uSpan: { value: TRAIL_SPAN },
    });
    const rippleMat = makeMaterial(RIPPLE_VERT, SPRITE_FRAG, {
      uTime: shared.uTime, uPx: shared.uPx, uPxW: shared.uPxW, uGScale: shared.uGScale, uRef: shared.uRef,
      uMaxPt: shared.uMaxPt, uPal: shared.uPal, uTraffic,
    });
    disposables.push(mainMat, glowMat, packetMat, rippleMat);

    // ------------------------------------------------------------------ scene graph
    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.5, 80);
    camera.position.set(0, 0, CAM_Z);
    const world = new Group();
    world.rotation.order = 'YXZ'; // turntable: tilt first, then yaw around the screen-vertical axis
    scene.add(world);
    const mk = (g: BufferGeometry, m: ShaderMaterial, order: number): Points => {
      const p = new Points(g, m);
      p.frustumCulled = false;
      p.renderOrder = order;
      world.add(p);
      return p;
    };
    mk(geo, mainMat, 1); // ink needs no bloom layer
    mk(traffic.glow, glowMat, 2);
    const packetPts = mk(traffic.packets, packetMat, 3);
    const ripplePts = mk(traffic.ripples, rippleMat, 4);
    packetPts.visible = ripplePts.visible = false;

    // ------------------------------------------------------------------ state
    const tracker = new SectionTracker(() => { if (staticMode && ready) renderStatic(); });
    const sample: Sample = { a: 1, b: 1, t: 0, side: 1, focus: 0, dim: 1, occluded: false, spin: 0, cy: 450, cyM: 300 };
    const vis: Vis = { a: 1, b: 1, t: 0 };
    const frame: Frame = { visW: VIS_H, visH: VIS_H, mobile: false };
    const focusV = new Vector3();
    let scales: Scales = chapterScales(frame);
    let dprCap = cfg.dpr;
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    let width = 1, height = 1;
    let ready = false;
    let destroyed = false;
    let lost = false;

    let side = 1, focus = 0, dim = 1, fade = 1, spin = 0, cy = -1, cityAmt = 0, cityTarget = 0, cityR = 0, cityRTarget = 0.2;
    let time = staticMode ? 6 : 0, intro = staticMode ? 1 : 0;
    let px = 0, py = 0, tpx = 0, tpy = 0;
    let first = true;
    let asleep = false;
    let raf = 0;
    let last = 0;
    let level = 0, frames = 0, warm = 24, windowFrames = 0, windowMs = 0, ema = 16.7;

    let finePointer = false;
    try { finePointer = window.matchMedia('(pointer: fine)').matches; } catch { finePointer = false; }

    const applySize = (): void => {
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      width = Math.max(1, canvas.clientWidth || window.innerWidth);
      height = Math.max(1, canvas.clientHeight || window.innerHeight);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      frame.visH = VIS_H;
      frame.visW = VIS_H * camera.aspect;
      frame.mobile = width < 900;
      scales = chapterScales(frame);
      shared.uPx.value = dpr * clamp(height / 900, 0.8, 1.4);
      shared.uPxW.value = (height * dpr) / (2 * TAN_HALF);
    };

    /** Place the world and push all per-frame uniforms for the current visual state. */
    const apply = (t: number): void => {
      const ia = clamp(vis.a, 0, CHAPTER_COUNT - 1), ib = clamp(vis.b, 0, CHAPTER_COUNT - 1);
      const m = smoother(clamp(vis.t, 0, 1));
      const a = VIEWS[ia]!, b = VIEWS[ib]!;
      const mix = (u: number, v: number): number => u + (v - u) * m;

      const sideEff = frame.mobile ? 0 : side;
      const spread = Math.abs(sideEff);
      const sc = (i: number): number => (frame.mobile ? scales.half[i]! : scales.wide[i]! + (scales.half[i]! - scales.wide[i]!) * spread);
      // zoom in log space, so the close-up doesn't rush in at the end
      const scale = Math.exp(mix(Math.log(sc(ia)), Math.log(sc(ib))));

      const gy = mix(a.gainY, b.gainY), gx = mix(a.gainX, b.gainX);
      const rx = mix(a.rx, b.rx) - py * gx + 0.018 * Math.sin(t * 0.13 + 1.0);
      const ry = mix(a.ry, b.ry) * sideEff + px * gy + 0.045 * Math.sin(t * 0.17);
      // turntable: scrolling through a window turns the map in its own plane (rz is applied first in YXZ)
      const rz = mix(a.rz, b.rz) + spin * mix(a.spin, b.spin) * (frame.mobile ? 0.6 : 1) + 0.02 * Math.sin(t * 0.11) * (frame.mobile ? 0.5 : 1);

      world.rotation.set(rx, ry, rz);
      world.scale.setScalar(scale);
      // bring the framed point (Gliwice in the close-up) to the optical axis
      focusV.set(mix(a.focus[0], b.focus[0]), mix(a.focus[1], b.focus[1]), mix(a.focus[2], b.focus[2]))
        .applyEuler(world.rotation).multiplyScalar(scale);
      world.position.set(px * 0.1 - focusV.x, py * 0.06 - focusV.y, -focusV.z);
      // Lens shift instead of moving the object: the shape is always seen down the optical axis, so a tilted
      // shape on the far side of the screen doesn't shear with perspective.
      const shiftX = sideEff * 0.25 * width;
      // the shape sits in its window and travels with it: desktop in the middle of the window's visible part,
      // phones where the window's poster is pinned (the band above the text)
      const shiftY = cy < 0 ? (frame.mobile ? 0.18 * height : 0) : -(cy - height / 2);
      camera.setViewOffset(width, height, -shiftX, shiftY, width, height);
      shared.uGScale.value = scale;

      const w = uW.value;
      w.fill(0);
      w[ia] = (w[ia] ?? 0) + (1 - m);
      w[ib] = (w[ib] ?? 0) + m;
      uA.value = ia; uB.value = ib; uT.value = vis.t;
      uChatW.value = w[4]!;
      uMapW.value = w[1]! + w[2]! + w[5]!;
      uFocus.value = focus;
      uCityAmt.value = cityAmt;
      uCityR.value = cityR;

      // more points = more light: keep perceived brightness roughly constant across tiers / downshifts
      const densK = clamp(Math.pow(8000 / drawCount, 0.35), 0.6, 1);
      uDim.value = (frame.mobile ? 0.92 : 0.86 + 0.14 * spread) * densK * dim * fade;
      uFade.value = dim * fade;
      uIntro.value = intro;
      shared.uTime.value = t;

      const tr = staticMode ? 0 : smoothstep(0.35, 1, w[2]!);
      uTraffic.value = tr * fade;
      packetPts.visible = ripplePts.visible = tr * fade > 0.004;
    };

    /**
     * The picked city's printed label (HTML, so it stays crisp type): placed next to the city's ring by projecting
     * the city through the same matrices the frame was drawn with. Hidden when the index map isn't what's on screen.
     */
    let label: HTMLElement | null = null;
    let labelOn = false;
    const cityV = new Vector3(), edgeV = new Vector3();
    const findLabel = (): void => {
      if (label && labelOn) label.removeAttribute('data-on');
      label = document.querySelector<HTMLElement>('[data-map-label]');
      labelOn = false;
    };
    const placeLabel = (): void => {
      if (!label) return;
      const show = !frame.mobile && cityAmt > 0.5 && cityR > 0.05 && fade > 0.6 && uW.value[1]! > 0.85;
      if (show) {
        cityV.copy(uCity.value).applyMatrix4(world.matrixWorld).project(camera);
        edgeV.set(uCity.value.x + cityR + 0.05, uCity.value.y, uCity.value.z).applyMatrix4(world.matrixWorld).project(camera);
        const x = (cityV.x + 1) * 0.5 * width, y = (1 - cityV.y) * 0.5 * height;
        const r = Math.hypot((edgeV.x - cityV.x) * 0.5 * width, (edgeV.y - cityV.y) * 0.5 * height);
        const flip = x + r + 260 > width;
        label.classList.toggle('is-flip', flip);
        label.style.transform = `translate3d(${Math.round(flip ? x - r - 1 : x + r + 1)}px, ${Math.round(y)}px, 0)`;
      }
      if (show !== labelOn) { labelOn = show; label.toggleAttribute('data-on', show); }
    };

    const stats = (): SceneStats => ({
      tier, count: drawCount, dpr, level, frameMs: staticMode ? 0 : ema, c: vis.a + (vis.b - vis.a) * vis.t, side, frames,
    });

    /** Reduced motion: no animation at all, just the right still for the part of the page on screen. */
    let staticKey = '';
    const renderStatic = (force = true): void => {
      if (destroyed || lost) return;
      tracker.sample(window.scrollY, window.innerHeight, sample);
      const c = sample.t < 0.5 ? sample.a : sample.b;
      const key = `${c}|${Math.round(sample.side)}|${sample.focus > 0.5 ? 1 : 0}|${sample.occluded ? 1 : 0}|${frame.mobile}|${cityTarget}`;
      if (!force && key === staticKey) return;
      staticKey = key;
      vis.a = vis.b = c; vis.t = 0;
      side = Math.round(sample.side);
      focus = sample.focus > 0.5 ? 1 : 0;
      dim = sample.dim;
      fade = sample.occluded ? 0 : 1;
      // reduced motion: no turntable and no travelling, the still is framed on the viewport
      spin = 0;
      cy = -1;
      cityAmt = cityTarget;
      cityR = cityRTarget;
      apply(time);
      renderer.render(scene, camera);
      placeLabel();
      opts.onStats?.(stats());
    };

    const downshift = (): void => {
      level++;
      drawCount = Math.max(2500, Math.floor(drawCount * 0.62));
      geo.setDrawRange(0, drawCount);
      const capped = level === 1 ? Math.max(1, Math.min(dprCap, 1.25)) : 1;
      if (capped !== dprCap) { dprCap = capped; applySize(); }
      windowFrames = 0; windowMs = 0; frames = 0;
    };

    const step = (dt: number): void => {
      time += dt;
      tracker.sample(window.scrollY, window.innerHeight, sample);
      if (first) {
        vis.a = vis.b = sample.t < 0.5 ? sample.a : sample.b; vis.t = 0;
        side = sample.side; focus = sample.focus; dim = sample.dim; fade = sample.occluded ? 0 : 1; spin = sample.spin; cy = frame.mobile ? sample.cyM : sample.cy;
        first = false;
      } else {
        advance(vis, sample, dt);
        const k = 1 - Math.exp(-dt * 3.5);
        side += (sample.side - side) * k;
        focus += (sample.focus - focus) * (1 - Math.exp(-dt * 2.2));
        dim += (sample.dim - dim) * k;
        fade += ((sample.occluded ? 0 : 1) - fade) * (1 - Math.exp(-dt * 6));
        spin += (sample.spin - spin) * (1 - Math.exp(-dt * 5));
        // a touch of lag: the printed sheet slides a hair behind the window, never out of it
        const cyT = frame.mobile ? sample.cyM : sample.cy;
        // phones scroll natively and fast: the map must stay glued to its window there
        cy = frame.mobile ? cyT : cy + (cyT - cy) * (1 - Math.exp(-dt * 14));
      }
      cityAmt += (cityTarget - cityAmt) * (1 - Math.exp(-dt * 3));
      // the ink spreads out from the city and settles (critically damped, no overshoot)
      cityR += (cityRTarget - cityR) * (1 - Math.exp(-dt * 2.6));
      const kp = 1 - Math.exp(-dt * 4);
      px += (tpx - px) * kp;
      py += (tpy - py) * kp;
      // the map prints the first time a window onto it is actually on screen
      if (!sample.occluded) intro = Math.min(1, intro + dt / 2.8);
      apply(time);
    };

    const loop = (now: number): void => {
      raf = requestAnimationFrame(loop);
      const raw = last ? now - last : 16.7;
      last = now;
      step(Math.min(0.1, raw / 1000));
      // under an opaque sheet: draw one empty frame, then skip rendering until it scrolls away
      if (sample.occluded && fade < 0.01) {
        if (asleep) return;
        asleep = true;
      } else asleep = false;
      renderer.render(scene, camera);
      placeLabel();
      frames++;
      if (raw < 250) {
        ema += (Math.min(raw, 100) - ema) * 0.06;
        // adaptive quality: after a warm-up, measure ~60-frame windows; shed load (never add it back)
        if (adaptive && level < 2 && frames > warm) {
          windowFrames++; windowMs += raw;
          if (windowFrames >= 60) {
            if (windowMs / windowFrames > 24) { downshift(); warm = 20; }
            windowFrames = 0; windowMs = 0;
          }
        }
      }
      opts.onStats?.(stats());
    };
    const startLoop = (): void => { if (!raf && !destroyed && !lost && !staticMode) { last = 0; raf = requestAnimationFrame(loop); } };
    const stopLoop = (): void => { if (raf) cancelAnimationFrame(raf); raf = 0; };

    // ------------------------------------------------------------------ events
    let resizeTimer = 0;
    let scrollTimer = 0;
    const onResize = (): void => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (destroyed) return;
        applySize();
        tracker.measure();
        if (staticMode) renderStatic();
      }, 110);
    };
    const onStaticScroll = (): void => {
      if (scrollTimer) return;
      scrollTimer = window.setTimeout(() => { scrollTimer = 0; renderStatic(false); }, 120);
    };
    const onPointer = (e: PointerEvent): void => {
      if (!finePointer || e.pointerType === 'touch') return;
      tpx = clamp((e.clientX / Math.max(1, window.innerWidth)) * 2 - 1, -1, 1);
      tpy = clamp(-((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1), -1, 1);
    };
    const onVisibility = (): void => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    const onLost = (e: Event): void => {
      e.preventDefault();
      lost = true;
      stopLoop();
      // Unlink our geometry/materials from the dead context's caches; three re-uploads and recompiles lazily after restore.
      for (const d of disposables) { try { d.dispose(); } catch { /* ignore */ } }
    };
    const onRestored = (): void => {
      lost = false;
      if (destroyed) return;
      if (staticMode) renderStatic(); else startLoop();
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    if (staticMode) window.addEventListener('scroll', onStaticScroll, { passive: true });
    if (!staticMode && finePointer) window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    // ------------------------------------------------------------------ first frame (before we return)
    tracker.start();
    applySize();
    findLabel();
    // Link all programs up front (traffic layers included) so the first scroll into the traffic chapter doesn't hitch.
    packetPts.visible = ripplePts.visible = true;
    try {
      if (gl.getExtension('KHR_parallel_shader_compile')) {
        await Promise.race([renderer.compileAsync(scene, camera), new Promise<void>((r) => window.setTimeout(r, 2500))]);
      } else {
        renderer.compile(scene, camera);
      }
    } catch { /* the first render compiles synchronously instead */ }
    packetPts.visible = ripplePts.visible = false;
    if (staticMode) {
      ready = true;
      renderStatic();
    } else {
      step(1 / 60);
      renderer.render(scene, camera);
      ready = true;
      if (!document.hidden) startLoop();
    }

    return {
      rescan(): void {
        if (destroyed) return;
        cityTarget = 0;
        findLabel();
        tracker.measure();
        if (staticMode) renderStatic();
      },
      setCity(lat: number, lon: number, w = 0.5): void {
        const [x, y] = project(lon, lat);
        // a different city: the ink spreads again from nothing
        if (Math.hypot(uCity.value.x - x, uCity.value.y - y) > 1e-4 || cityTarget === 0) cityR = 0;
        uCity.value.set(x, y, terrainZ(x, y) + 0.04);
        cityRTarget = 0.1 + 0.2 * clamp(w, 0, 1);
        cityTarget = 1;
        if (staticMode) renderStatic();
      },
      clearCity(): void {
        cityTarget = 0;
        if (staticMode) renderStatic();
      },
      destroy(): void {
        if (destroyed) return;
        destroyed = true;
        stopLoop();
        window.clearTimeout(resizeTimer);
        window.clearTimeout(scrollTimer);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        window.removeEventListener('scroll', onStaticScroll);
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', onVisibility);
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        tracker.destroy();
        if (label) label.removeAttribute('data-on');
        world.clear();
        scene.clear();
        for (const d of disposables) d.dispose();
        renderer.dispose();
      },
    };
  } catch (err) {
    for (const d of disposables) { try { d.dispose(); } catch { /* ignore */ } }
    try { renderer.dispose(); } catch { /* ignore */ }
    throw err;
  }
}
