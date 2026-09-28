/**
 * kacper.biz scroll-driven 3D world.
 *
 * One morphing THREE.Points cloud (cloud -> Poland map -> live traffic -> landing page -> chat -> rings),
 * driven by which [data-scene] section is at the centre of the viewport. Native scroll only.
 *
 * Draw calls: main points, bloom layer (same geometry, bigger + dimmer), glow halos, traffic packets, ripples (5).
 * No post-processing.
 */
import {
  AddEquation, BufferAttribute, BufferGeometry, CustomBlending, Group, OneFactor, OneMinusSrcAlphaFactor,
  OneMinusSrcColorFactor, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3, WebGLRenderer,
} from 'three';
import { BLOOM_FRAG, GLOW_FRAG, GLOW_VERT, MAIN_VERT, RIPPLE_VERT, SPRITE_FRAG, TRAFFIC_VERT } from './shaders';
import { CHAPTER_COUNT, PALETTE, RINGS, buildTargets } from './shapes';
import { SectionTracker, type Sample } from './tracker';
import { TRAIL_SPAN, buildTraffic } from './traffic';
import { VIEWS, chapterScales, type Frame, type Scales } from './view';

export interface SceneHandle { destroy(): void }

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
  /** Force a quality tier (debugging / the lab page). */
  tier?: Tier;
  /** Set false to disable the frame-time downshift (debugging under software GL). Default true. */
  adaptive?: boolean;
  /** Called after every rendered frame (debugging / the lab page). */
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

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function pickTier(gl: WebGL2RenderingContext): Tier {
  const nav = navigator as NavigatorHints;
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory ?? (cores >= 8 ? 8 : 4);
  const saveData = nav.connection?.saveData === true;
  let coarse = false;
  try { coarse = !window.matchMedia('(pointer: fine)').matches; } catch { /* keep default */ }
  let software = false;
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) software = /swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)));
  } catch { /* masked renderer: assume hardware */ }
  if (saveData || software || cores <= 2 || mem <= 2) return 'low';
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
    // "screen" blend on premultiplied light: soft saturation, valid premultiplied alpha
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneMinusSrcColorFactor,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneMinusSrcAlphaFactor,
  });
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
  const staticMode = opts.reducedMotion;
  const adaptive = opts.adaptive !== false;
  const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array;
  const maxPoint = Math.min(range[1] ?? 64, 256);

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
    const targets = buildTargets(n);
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(targets.pos[0]!, 3));
    const map = new BufferAttribute(targets.pos[1]!, 3);
    geo.setAttribute('aP1', map);
    geo.setAttribute('aP2', map); // traffic chapter reuses the map targets
    geo.setAttribute('aP3', new BufferAttribute(targets.pos[3]!, 3));
    geo.setAttribute('aP4', new BufferAttribute(targets.pos[4]!, 3));
    geo.setAttribute('aP5', new BufferAttribute(targets.pos[5]!, 3));
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
    const uC = { value: 1 };
    const uIntro = { value: staticMode ? 1 : 0 };
    const uDim = { value: 1 };
    const uTraffic = { value: 0 };

    const mainUniforms = {
      uTime: shared.uTime, uPx: shared.uPx, uRef: shared.uRef, uMaxPt: shared.uMaxPt, uPal: shared.uPal,
      uC, uIntro, uDim,
      uSize: { value: [2.9, 2.3, 2.3, 2.3, 2.4, 2.5] },
      uDrift: { value: [0.085, 0.012, 0.012, 0.01, 0.01, 0.03] },
      uBloomK: { value: [0.07, 0.09, 0.09, 0.14, 0.14, 0.16] },
      uAxis: { value: RINGS.map((r) => new Vector3(r.axis[0], r.axis[1], r.axis[2])) },
      uSpin: { value: RINGS.map((r) => r.speed) },
    };
    const mainMat = makeMaterial(MAIN_VERT, SPRITE_FRAG, { ...mainUniforms, uBloom: { value: 0 } });
    const bloomMat = makeMaterial(MAIN_VERT, BLOOM_FRAG, { ...mainUniforms, uBloom: { value: 1 } });
    const glowMat = makeMaterial(GLOW_VERT, GLOW_FRAG, {
      uTime: shared.uTime, uC, uPxW: shared.uPxW, uGScale: shared.uGScale, uMaxPt: shared.uMaxPt, uPal: shared.uPal,
    });
    const packetMat = makeMaterial(TRAFFIC_VERT, SPRITE_FRAG, {
      uTime: shared.uTime, uPx: shared.uPx, uRef: shared.uRef, uMaxPt: shared.uMaxPt, uPal: shared.uPal,
      uTraffic, uSpan: { value: TRAIL_SPAN },
    });
    const rippleMat = makeMaterial(RIPPLE_VERT, SPRITE_FRAG, {
      uTime: shared.uTime, uPx: shared.uPx, uPxW: shared.uPxW, uGScale: shared.uGScale, uRef: shared.uRef,
      uMaxPt: shared.uMaxPt, uPal: shared.uPal, uTraffic,
    });
    disposables.push(mainMat, bloomMat, glowMat, packetMat, rippleMat);

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
    mk(geo, bloomMat, 0);
    mk(geo, mainMat, 1);
    mk(traffic.glow, glowMat, 2);
    const packetPts = mk(traffic.packets, packetMat, 3);
    const ripplePts = mk(traffic.ripples, rippleMat, 4);
    packetPts.visible = ripplePts.visible = false;

    // ------------------------------------------------------------------ state
    const tracker = new SectionTracker(() => { if (staticMode && ready) renderStatic(); });
    const sample: Sample = { c: 1, side: 1 };
    const frame: Frame = { visW: VIS_H, visH: VIS_H, mobile: false };
    let scales: Scales = chapterScales(frame);
    let dpr = Math.min(window.devicePixelRatio || 1, cfg.dpr);
    let width = 1, height = 1;
    let ready = false;
    let destroyed = false;
    let lost = false;

    let c = 1, side = 1, time = staticMode ? 6 : 0, intro = staticMode ? 1 : 0;
    let px = 0, py = 0, tpx = 0, tpy = 0;
    let first = true;
    let raf = 0;
    let last = 0;
    let level = 0, frames = 0, warm = 24, windowFrames = 0, windowMs = 0, ema = 16.7;

    let finePointer = false;
    try { finePointer = window.matchMedia('(pointer: fine)').matches; } catch { finePointer = false; }

    const applySize = (): void => {
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

    /** Place the world and push all per-frame uniforms for chapter value `cv`. */
    const apply = (cv: number, sd: number, t: number): void => {
      const cc = clamp(cv, 0, CHAPTER_COUNT - 1);
      const k = Math.min(CHAPTER_COUNT - 2, Math.floor(cc));
      const f = clamp((cc - k - 0.12) / 0.76, 0, 1); // same hold-then-move remap as the vertex shader
      const m = f * f * f * (f * (f * 6 - 15) + 10);
      const a = VIEWS[k]!, b = VIEWS[k + 1]!;
      const mix = (u: number, v: number): number => u + (v - u) * m;

      const sideEff = frame.mobile ? 0 : sd;
      const spread = Math.abs(sideEff);
      const sc = (i: number): number => (frame.mobile ? scales.half[i]! : scales.wide[i]! + (scales.half[i]! - scales.wide[i]!) * spread);
      const scale = mix(sc(k), sc(k + 1));

      const gy = mix(a.gainY, b.gainY), gx = mix(a.gainX, b.gainX);
      const rx = mix(a.rx, b.rx) - py * gx + 0.018 * Math.sin(t * 0.13 + 1.0);
      const ry = mix(a.ry, b.ry) * sideEff + px * gy + 0.045 * Math.sin(t * 0.17);
      const rz = mix(a.rz, b.rz) + 0.02 * Math.sin(t * 0.11) * (frame.mobile ? 0.5 : 1);

      world.rotation.set(rx, ry, rz);
      world.scale.setScalar(scale);
      world.position.set(px * 0.1, py * 0.06, 0);
      // Lens shift instead of moving the object: the shape is always seen down the optical axis, so a tilted
      // shape on the far side of the screen doesn't shear with perspective.
      const shiftX = sideEff * 0.25 * width;
      const shiftY = (frame.mobile ? 0.18 : 0.0) * height;
      camera.setViewOffset(width, height, -shiftX, shiftY, width, height);
      shared.uGScale.value = scale;

      uC.value = staticMode ? 1 : cc;
      // more points = more light: keep perceived brightness roughly constant across tiers / downshifts
      const densK = clamp(Math.pow(8000 / drawCount, 0.35), 0.6, 1);
      uDim.value = (frame.mobile ? 0.72 : 0.62 + 0.38 * spread) * 0.96 * densK;
      uIntro.value = intro;
      shared.uTime.value = t;

      const tr = staticMode ? 0 : smoothstep(1.3, 2.0, cc) * (1 - smoothstep(2.3, 2.85, cc));
      uTraffic.value = tr;
      packetPts.visible = ripplePts.visible = tr > 0.004;
    };

    const stats = (): SceneStats => ({ tier, count: drawCount, dpr, level, frameMs: staticMode ? 0 : ema, c, side, frames });

    const renderStatic = (): void => {
      if (destroyed || lost) return;
      c = 1;
      side = tracker.hasSections ? tracker.firstSide : 1;
      apply(1, side, time);
      renderer.render(scene, camera);
      opts.onStats?.(stats());
    };

    const downshift = (): void => {
      level++;
      drawCount = Math.max(2500, Math.floor(drawCount * 0.62));
      geo.setDrawRange(0, drawCount);
      const capped = level === 1 ? Math.max(1, Math.min(dpr, 1.25)) : 1;
      if (capped !== dpr) { dpr = capped; applySize(); }
      windowFrames = 0; windowMs = 0; frames = 0;
    };

    const step = (dt: number): void => {
      time += dt;
      tracker.sample(window.scrollY, window.innerHeight, sample);
      if (first) { c = sample.c; side = sample.side; first = false; }
      else {
        const k = 1 - Math.exp(-dt * 3.5);
        c += (sample.c - c) * k;
        side += (sample.side - side) * k;
      }
      const kp = 1 - Math.exp(-dt * 4);
      px += (tpx - px) * kp;
      py += (tpy - py) * kp;
      intro = Math.min(1, intro + dt / 2.8);
      apply(c, side, time);
    };

    const loop = (now: number): void => {
      raf = requestAnimationFrame(loop);
      const raw = last ? now - last : 16.7;
      last = now;
      step(Math.min(0.1, raw / 1000));
      renderer.render(scene, camera);
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
    const onResize = (): void => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (destroyed) return;
        applySize();
        tracker.measure();
        if (staticMode) renderStatic();
      }, 110);
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
    const onLost = (e: Event): void => { e.preventDefault(); lost = true; stopLoop(); };
    const onRestored = (): void => {
      lost = false;
      if (destroyed) return;
      if (staticMode) renderStatic(); else startLoop();
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    if (!staticMode && finePointer) window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    // ------------------------------------------------------------------ first frame (before we return)
    tracker.start();
    applySize();
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
      destroy(): void {
        if (destroyed) return;
        destroyed = true;
        stopLoop();
        window.clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', onVisibility);
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        tracker.destroy();
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
