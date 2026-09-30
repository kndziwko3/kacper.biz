/**
 * The film: one persistent canvas, one object, one camera on a rail. Chapters are CSS-sticky tracks in the page
 * (`[data-ch="<pose>"]`); while a track is pinned, the first 42% of its scroll morphs the object from the previous
 * chapter's pose into this one and the rest is in-chapter motion (`local`). Opaque sheets (`[data-sheet]`) slide over
 * the canvas; when one covers the viewport the film sleeps. Subpages without tracks hold one pose
 * (`[data-film-pose]`).
 *
 * The scroll position is damped once more on top of Lenis (desktop) or native momentum (touch), so the object moves
 * with weight and never twitches with the wheel.
 */
import {
  AgXToneMapping, HalfFloatType, PCFShadowMap, PerspectiveCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { buildStudio, studioEnvironment } from './studio';
import { buildMonolith, smooth } from './monolith';
import { finalPass } from './post';

export type Tier = 'high' | 'mid' | 'low';

export interface FilmOptions {
  tier: Tier;
  /** Reduced motion: no loop, one still per scroll settle. */
  reduced: boolean;
  /** Render one fixed state and stop (posters, QA). */
  still?: State;
  /** Keep full quality on software GL (QA). */
  forceQuality?: boolean;
}

export interface State { a: number; b: number; t: number; local: number }

export interface Film {
  rescan(): void;
  render(state?: State): void;
  destroy(): void;
}

interface Shot { pos: [number, number, number]; tgt: [number, number, number]; fov: number; fx: number; drift: number }

/** Camera per pose. fx: where the object sits on a wide screen (fraction of width from the centre; + = right). */
const SHOTS: Shot[] = [
  { pos: [2.9, 1.9, 5.4], tgt: [0, 1.5, 0], fov: 30, fx: 0.2, drift: 0.34 },
  { pos: [1.1, 5.3, 7.4], tgt: [0, 1.6, 0], fov: 32, fx: 0.2, drift: 0.22 },
  { pos: [-4.6, 2.3, 3.0], tgt: [0.2, 1.0, -1.7], fov: 34, fx: -0.19, drift: 0 },
  { pos: [2.5, 3.7, 9.2], tgt: [0.1, 2.7, 0], fov: 34, fx: 0.2, drift: 0.28 },
  { pos: [-3.9, 1.45, 5.3], tgt: [0, 1.6, 0], fov: 28, fx: -0.19, drift: 0.3 },
];

const TIERS: Record<Tier, { dpr: number; shadows: boolean; shadow: number; msaa: number }> = {
  high: { dpr: 1.5, shadows: true, shadow: 2048, msaa: 4 },
  mid: { dpr: 1.35, shadows: true, shadow: 1024, msaa: 2 },
  low: { dpr: 1, shadows: false, shadow: 512, msaa: 0 },
};
const PIXEL_BUDGET = 2560 * 1440;

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

interface Track { top: number; height: number; pose: number }
interface Span { top: number; bottom: number }

class Tracks {
  items: Track[] = [];
  sheets: Span[] = [];
  routePose: number | null = null;
  measure(): void {
    const sy = window.scrollY;
    this.items = Array.from(document.querySelectorAll<HTMLElement>('[data-ch]')).map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + sy, height: r.height, pose: Number(el.dataset.ch) || 0 };
    }).filter((t) => t.height > 0).sort((p, q) => p.top - q.top);
    this.sheets = Array.from(document.querySelectorAll<HTMLElement>('[data-sheet]')).map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + sy, bottom: r.bottom + sy };
    }).filter((s) => s.bottom > s.top).sort((p, q) => p.top - q.top);
    for (let i = this.sheets.length - 1; i > 0; i--) {
      if (this.sheets[i]!.top <= this.sheets[i - 1]!.bottom + 2) { this.sheets[i - 1]!.bottom = Math.max(this.sheets[i - 1]!.bottom, this.sheets[i]!.bottom); this.sheets.splice(i, 1); }
    }
    const pose = document.querySelector<HTMLElement>('[data-film-pose]')?.dataset.filmPose;
    this.routePose = pose !== undefined && pose !== '' ? Number(pose) : null;
  }
  state(y: number, vh: number, out: State): State {
    const T = this.items;
    if (!T.length) { const p = this.routePose ?? 0; out.a = out.b = p; out.t = 0; out.local = clamp01(y / Math.max(1, vh * 2)); return out; }
    let k = -1;
    for (let i = 0; i < T.length; i++) if (T[i]!.top <= y + 1) k = i;
    if (k < 0) { out.a = out.b = T[0]!.pose; out.t = 0; out.local = 0; return out; }
    const tr = T[k]!;
    const p = clamp01((y - tr.top) / Math.max(1, tr.height - vh));
    if (k === 0) { out.a = out.b = tr.pose; out.t = 0; out.local = p; return out; }
    const tt = smooth(0, 0.42, p);
    if (tt >= 1) { out.a = out.b = tr.pose; out.t = 0; } else { out.a = T[k - 1]!.pose; out.b = tr.pose; out.t = tt; }
    out.local = clamp01((p - 0.42) / 0.58);
    return out;
  }
  covered(y: number, vh: number): boolean {
    return this.sheets.some((s) => s.top <= y + 1 && s.bottom >= y + vh - 1);
  }
}

export async function createFilm(canvas: HTMLCanvasElement, opts: FilmOptions): Promise<Film> {
  const cfg = TIERS[opts.tier];
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance' });
  renderer.toneMapping = AgXToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = cfg.shadows;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 1;
  const studio = buildStudio(scene, cfg.shadows, cfg.shadow);
  const mono = buildMonolith(cfg.shadows);
  scene.add(mono.reflection, mono.mesh);

  const camera = new PerspectiveCamera(30, 1, 0.1, 80);
  const rt = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: cfg.msaa });
  const post = finalPass();
  post.setInput(rt.texture);

  const tracks = new Tracks();
  const target: State = { a: 0, b: 0, t: 0, local: 0 };
  const state: State = { a: 0, b: 0, t: 0, local: 0 };

  let width = 1, height = 1, dpr = 1, dprScale = 1, mobile = false;
  let yD = window.scrollY, time = 0, raf = 0, last = 0, destroyed = false, asleep = false;
  let px = 0, py = 0, tpx = 0, tpy = 0;
  let ema = 16.7, frames = 0, shifts = 0;
  const morph = { from: 0, k: 1 };

  const resize = (force = false): void => {
    const w = window.innerWidth, h = window.innerHeight;
    // the phone URL bar changes the height by a few percent: ignore those
    if (!force && w === width && Math.abs(h - height) / Math.max(1, height) < 0.25) return;
    width = w; height = h; mobile = w < 900;
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? Math.min(1.5, cfg.dpr + 0.15) : cfg.dpr) * dprScale;
    if (w * h * dpr * dpr > PIXEL_BUDGET) dpr = Math.sqrt(PIXEL_BUDGET / (w * h));
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
    post.material.uniforms.uRes!.value.set(w, h);
    camera.aspect = w / h;
  };

  const pos = new Vector3(), tgt = new Vector3(), off = new Vector3(), pa = new Vector3(), pb = new Vector3(), ta = new Vector3(), tb = new Vector3();
  const shotInto = (i: number, local: number, P: Vector3, Tg: Vector3): { fov: number; fx: number } => {
    const s = SHOTS[i] ?? SHOTS[0]!;
    P.set(...s.pos); Tg.set(...s.tgt);
    if (i === 2) { P.z -= local * 1.6; Tg.z -= local * 1.6; }
    off.subVectors(P, Tg);
    if (s.drift) off.applyAxisAngle(new Vector3(0, 1, 0), (local - 0.5) * s.drift);
    if (mobile) off.multiplyScalar(1.55);
    P.copy(Tg).add(off);
    return { fov: s.fov, fx: s.fx };
  };

  const place = (st: State): void => {
    const e = st.t * st.t * (3 - 2 * st.t);
    const la = st.a === st.b ? st.local : 1;
    const A = shotInto(st.a, la, pa, ta);
    const B = shotInto(st.b, st.local, pb, tb);
    pos.lerpVectors(pa, pb, e); tgt.lerpVectors(ta, tb, e);
    // pointer: a hand-held nudge, never a turntable
    pos.x += px * 0.22; pos.y += py * 0.12;
    camera.position.copy(pos);
    camera.lookAt(tgt);
    camera.fov = A.fov + (B.fov - A.fov) * e;
    const fx = mobile ? 0 : A.fx + (B.fx - A.fx) * e;
    const shiftY = mobile ? height * 0.12 : 0;
    camera.setViewOffset(width, height, -fx * width, shiftY, width, height);
    camera.updateProjectionMatrix();
    mono.apply(st.a, st.b, st.t, st.local, time);
  };

  const draw = (): void => {
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    post.material.uniforms.uTime!.value = time;
    renderer.render(post.scene, post.camera);
  };

  const step = (dt: number): void => {
    time += dt;
    const y = window.scrollY;
    yD = damp(yD, y, mobile ? 6 : 10, dt);
    if (Math.abs(yD - y) < 0.3) yD = y;
    tracks.state(yD, height, target);
    Object.assign(state, target);
    // a route change re-poses the object instead of cutting to the new page's pose
    if (morph.k < 1) {
      morph.k = Math.min(1, morph.k + dt / 1.8);
      if (target.a === target.b && morph.from !== target.b) { state.a = morph.from; state.b = target.b; state.t = morph.k; }
      else morph.k = 1;
    }
    px = damp(px, tpx, 4, dt); py = damp(py, tpy, 4, dt);
    place(state);
  };

  const loop = (now: number): void => {
    raf = requestAnimationFrame(loop);
    const raw = last ? now - last : 16.7;
    last = now;
    const dt = Math.min(0.05, raw / 1000);
    step(dt);
    const covered = tracks.covered(window.scrollY, height);
    if (covered) { if (asleep) return; asleep = true; } else asleep = false;
    draw();
    // resolution governor: shed pixels on slow devices (never above the tier cap, stops after a few moves)
    if (raw < 200) {
      ema += (raw - ema) * 0.05;
      if (++frames > 90 && shifts < 4) {
        if (ema > 24 && dprScale > 0.6) { dprScale -= 0.15; shifts++; frames = 0; resize(true); }
      }
    }
  };

  const onResize = (): void => { resize(); tracks.measure(); if (opts.reduced) render(); };
  const onPointer = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    tpx = (e.clientX / Math.max(1, width)) * 2 - 1;
    tpy = -((e.clientY / Math.max(1, height)) * 2 - 1);
  };
  const onVisibility = (): void => { if (document.hidden) stop(); else start(); };
  let scrollTimer = 0;
  const onStillScroll = (): void => { if (!scrollTimer) scrollTimer = window.setTimeout(() => { scrollTimer = 0; render(); }, 120); };

  const start = (): void => { if (!raf && !destroyed && !opts.reduced && !opts.still) { last = 0; raf = requestAnimationFrame(loop); } };
  const stop = (): void => { if (raf) cancelAnimationFrame(raf); raf = 0; };

  function render(st?: State): void {
    if (destroyed) return;
    if (st) Object.assign(state, st);
    else { yD = window.scrollY; tracks.state(yD, height, state); }
    place(state);
    draw();
  }

  resize(true);
  tracks.measure();
  // compile everything before the first visible frame
  try { await renderer.compileAsync(scene, camera); } catch { /* compiled on first render instead */ }
  await new Promise((r) => setTimeout(r, 0));

  if (opts.still) render(opts.still);
  else if (opts.reduced) { render(); window.addEventListener('scroll', onStillScroll, { passive: true }); }
  else {
    step(1 / 60); draw();
    start();
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
  }
  window.addEventListener('resize', onResize, { passive: true });
  const ro = new ResizeObserver(() => tracks.measure());
  ro.observe(document.body);

  return {
    rescan(): void {
      // the pose on screen now is where the next page's pose grows from
      const shown = state.t >= 0.5 ? state.b : state.a;
      tracks.measure();
      yD = window.scrollY;
      if (opts.reduced) { render(); return; }
      morph.from = shown; morph.k = 0;
    },
    render,
    destroy(): void {
      destroyed = true;
      stop();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onStillScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      mono.dispose(); studio.dispose(); post.dispose(); rt.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
