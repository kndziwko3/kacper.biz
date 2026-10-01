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
  DepthTexture, Euler, HalfFloatType, NeutralToneMapping, Raycaster, RectAreaLight, Vector2, PCFShadowMap, PerspectiveCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { buildStudio, studioEnvironment } from './studio';
import { buildKeyboard } from './keyboard';
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
  /** Render at the page's full devicePixelRatio, past the pixel budget (supersampled stills). */
  supersample?: boolean;
}

export interface State {
  a: number; b: number; t: number; local: number;
  /** Phones: how far the stage that owns the object has scrolled (px, + = down): the film rides with its chapter. */
  ride?: number;
}

export interface Film {
  rescan(): void;
  /** Characters of the chapter-2 sentence the board has typed so far (the page mirrors them). */
  typed(): number;
  render(state?: State): void;
  destroy(): void;
}

interface Shot {
  pos: [number, number, number];
  tgt: [number, number, number];
  fov: number;
  /** Where the object sits on a wide screen (fraction of width from the centre; + = right). */
  fx: number;
  drift: number;
  /** The look of the chapter: environment light, where the key spot points and how wide, lens aperture, vignette. */
  env: number;
  key: [number, number, number];
  cone: number;
  ap: number;
  vig: number;
  /** Exposure and the cool rim from behind (the exploded build separates its layers with it). */
  exp: number;
  rim: number;
  /** Phone framing: camera distance multiplier and how far the picture rides up (fraction of the height). */
  mob: [number, number];
}

/** Camera and light per pose. */
export const SHOTS: Shot[] = [
  { pos: [3.6, 2.7, 5.4], tgt: [0.6, 1.45, 0], fov: 28, fx: 0.4, drift: 0.22, env: 1, key: [0.3, 1.2, 0], cone: 0.42, ap: 0.035, vig: 0.42, exp: 1, rim: 0.8, mob: [1.8, 0.2] },
  { pos: [1.3, 8.4, 8.2], tgt: [0.15, 1.75, 0], fov: 24, fx: 0.29, drift: 0.16, env: 1, key: [0.2, 1.9, 0.2], cone: 0.42, ap: 0.03, vig: 0.42, exp: 0.86, rim: 0.8, mob: [1.85, 0.24] },
  { pos: [-2.2, 2.9, 4.4], tgt: [-0.95, 1.2, 0.25], fov: 28, fx: -0.25, drift: 0.1, env: 0.9, key: [0, 1.0, 0], cone: 0.42, ap: 0.06, vig: 0.45, exp: 1, rim: 0.7, mob: [2.2, 0.3] },
  { pos: [3.46, 3.54, 6.89], tgt: [0.1, 1.45, 0], fov: 32, fx: 0.24, drift: 0.2, env: 1, key: [0.1, 1.2, 0], cone: 0.42, ap: 0.03, vig: 0.42, exp: 1, rim: 3.2, mob: [1.72, 0.1] },
  { pos: [0.15, 2.2, 1.7], tgt: [0.94, 1.2, 0.48], fov: 22, fx: 0.3, drift: 0.08, env: 0.55, key: [0.94, 1.2, 0.48], cone: 0.3, ap: 0.12, vig: 0.5, exp: 1, rim: 0.5, mob: [1.35, 0.27] },
];

const TIERS: Record<Tier, { dpr: number; shadows: boolean; shadow: number; msaa: number; dof: number }> = {
  high: { dpr: 1.5, shadows: true, shadow: 2048, msaa: 4, dof: 40 },
  mid: { dpr: 1.35, shadows: true, shadow: 1024, msaa: 2, dof: 20 },
  low: { dpr: 1, shadows: false, shadow: 512, msaa: 2, dof: 0 },
};
const PIXEL_BUDGET = 2560 * 1440;

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
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
  /**
   * A chapter takes the object over from LEAD viewports before its track pins (while the previous stage or sheet is
   * still scrolling away) and finishes the move MORPH of the way into its pinned scroll, so the object has arrived by
   * the time the new copy holds still. The rest of the pinned scroll is the chapter's own motion (`local`).
   */
  state(y: number, vh: number, out: State): State {
    const T = this.items;
    if (!T.length) { const p = this.routePose ?? 0; out.a = out.b = p; out.t = 0; out.local = clamp01(y / Math.max(1, vh * 2)); return out; }
    const LEAD = 0.55, MORPH = 0.16;
    let k = -1;
    for (let i = 0; i < T.length; i++) if (T[i]!.top - (i > 0 ? LEAD * vh : 0) <= y + 1) k = i;
    if (k < 0) { out.a = out.b = T[0]!.pose; out.t = 0; out.local = 0; return out; }
    const tr = T[k]!;
    const span = Math.max(1, tr.height - vh);
    if (k === 0) { out.a = out.b = tr.pose; out.t = 0; out.local = clamp01((y - tr.top) / span); return out; }
    const m0 = tr.top - LEAD * vh, m1 = tr.top + MORPH * span;
    const tt = smooth(m0, m1, y);
    if (tt >= 1) { out.a = out.b = tr.pose; out.t = 0; } else { out.a = T[k - 1]!.pose; out.b = tr.pose; out.t = tt; }
    out.local = clamp01((y - m1) / Math.max(1, tr.top + span - m1));
    return out;
  }
  /**
   * Phones: where the stage that owns the object is (px, + = below its pinned place). It comes up from below until it
   * pins and scrolls away once its pinned span is spent; a subpage head simply scrolls with the page. Raw scroll, so
   * the object moves exactly with the page.
   */
  ride(y: number, vh: number): number {
    const T = this.items;
    if (!T.length) return -y;
    const LEAD = 0.55;
    let k = 0;
    for (let i = 0; i < T.length; i++) if (T[i]!.top - (i > 0 ? LEAD * vh : 0) <= y + 1) k = i;
    const tr = T[k]!;
    const span = Math.max(1, tr.height - vh);
    return y < tr.top ? tr.top - y : -Math.max(0, y - (tr.top + span));
  }
  /** How much of the viewport the nearest sheet covers while it slides in or out (0..1). */
  sheetCover(y: number, vh: number): number {
    let c = 0;
    for (const s of this.sheets) {
      const top = s.top - y, bottom = s.bottom - y;
      if (top < vh && bottom > 0) c = Math.max(c, (Math.min(vh, bottom) - Math.max(0, top)) / vh);
    }
    return c;
  }
  covered(y: number, vh: number): boolean {
    return this.sheets.some((s) => s.top <= y + 1 && s.bottom >= y + vh - 1);
  }
}

export async function createFilm(canvas: HTMLCanvasElement, opts: FilmOptions): Promise<Film> {
  const cfg = TIERS[opts.tier];
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance' });
  // Khronos PBR Neutral keeps the cream caps cream and the copper copper (AgX greys both)
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.86;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = cfg.shadows;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 1;
  const studio = buildStudio(scene, cfg.shadows, cfg.shadow);
  const kb = await buildKeyboard(renderer, cfg.shadows);
  scene.add(kb.rig);
  // the glint: a narrow softbox that follows the camera's mirror angle over the copper caps, so their tops always
  // carry one crisp bright bar (and it slides across Enter as the key goes down)
  RectAreaLightUniformsLib.init();
  const glint = new RectAreaLight('#fff4ea', 16, 1.1, 0.13);
  scene.add(glint);
  const gp = new Vector3(), gn = new Vector3(), gv = new Vector3();

  const camera = new PerspectiveCamera(30, 1, 0.1, 80);
  const rt = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: opts.supersample ? 0 : cfg.msaa });
  if (cfg.dof) rt.depthTexture = new DepthTexture(1, 1);
  const post = finalPass(cfg.dof);
  post.setInput(rt.texture, rt.depthTexture);
  const pu = post.material.uniforms;
  pu.uNear!.value = 0.1; pu.uFar!.value = 80;
  if (import.meta.env.DEV) {
    // look-dev handle: mutate shots and poses from the console, the loop picks them up on the next frame
    (window as unknown as { __film: unknown }).__film = {
      SHOTS, kb, scene, studio, renderer, post,
      rig(i: number, p: [number, number, number], r: [number, number, number]): void {
        const R = kb.poses[i]!.rig; R.p.set(...p); R.q.setFromEuler(new Euler(r[0], r[1], r[2], 'YXZ'));
      },
    };
  }

  const tracks = new Tracks();
  const target: State = { a: 0, b: 0, t: 0, local: 0 };
  const state: State = { a: 0, b: 0, t: 0, local: 0 };

  let width = 1, height = 1, dpr = 1, dprScale = 1, mobile = false;
  let yD = window.scrollY, time = 0, raf = 0, last = 0, destroyed = false, asleep = false;
  let px = 0, py = 0, tpx = 0, tpy = 0, pointerAt = -1e9;
  // a finger on the board presses the cap under it for a moment (touch has no hover)
  let tapX = 0, tapY = 0, tapUntil = -1;
  let lastTyped = -1;
  const raycaster = new Raycaster(), ndc = new Vector2();
  let ema = 16.7, frames = 0, shifts = 0;
  const morph = { from: 0, k: 1 };

  const resize = (force = false): void => {
    const w = window.innerWidth, h = window.innerHeight;
    // the phone URL bar changes the height by a few percent: ignore those
    if (!force && w === width && Math.abs(h - height) / Math.max(1, height) < 0.25) return;
    width = w; height = h;
    // a phone held sideways takes the desktop composition (copy one side, object the other)
    mobile = w < 900 && !(h <= 520 && w > h * 1.25);
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? Math.min(1.5, cfg.dpr + 0.15) : cfg.dpr) * dprScale;
    if (opts.supersample) dpr = window.devicePixelRatio || 1;
    else if (w * h * dpr * dpr > PIXEL_BUDGET) dpr = Math.sqrt(PIXEL_BUDGET / (w * h));
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
    post.material.uniforms.uRes!.value.set(w, h);
    camera.aspect = w / h;
  };

  const pos = new Vector3(), tgt = new Vector3(), off = new Vector3(), pa = new Vector3(), pb = new Vector3(), ta = new Vector3(), tb = new Vector3();
  const shotInto = (i: number, local: number, P: Vector3, Tg: Vector3): Shot => {
    const s = SHOTS[i] ?? SHOTS[0]!;
    P.set(...s.pos); Tg.set(...s.tgt);
    off.subVectors(P, Tg);
    if (s.drift) off.applyAxisAngle(new Vector3(0, 1, 0), (local - 0.5) * s.drift);
    if (mobile) off.multiplyScalar(s.mob[0]);
    P.copy(Tg).add(off);
    return s;
  };
  const keyAt = new Vector3(), ka = new Vector3(), kb3 = new Vector3();

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
    // on a phone the copy sits under the object, so the film rides with its chapter: it leaves upward with the stage
    // that scrolls away and comes up from below with the next one, never parked behind a block of text
    const shiftY = mobile ? height * (A.mob[1] + (B.mob[1] - A.mob[1]) * e) - (st.ride ?? 0) : 0;
    camera.setViewOffset(width, height, -fx * width, shiftY, width, height);
    camera.updateProjectionMatrix();
    // the chapter's look: how much the room lights the object, where the key spot lands, how shallow the lens is
    const mix = (x: number, y: number) => x + (y - x) * e;
    scene.environmentIntensity = mix(A.env, B.env);
    keyAt.lerpVectors(ka.set(...A.key), kb3.set(...B.key), e);
    studio.key.target.position.copy(keyAt);
    studio.key.angle = mix(A.cone, B.cone);
    pu.uFocus!.value = pos.distanceTo(tgt);
    pu.uAperture!.value = mix(A.ap, B.ap) * (mobile ? 0.6 : 1);
    pu.uMaxR!.value = Math.max(6, Math.round(height * dpr * 0.014));
    pu.uVignette!.value = mix(A.vig, B.vig);
    studio.rim.intensity = mix(A.rim, B.rim);
    // a sheet sliding over the film takes some of the light with it, so the handoff reads as paper over a lit set
    pu.uExposure!.value = mix(A.exp, B.exp) * (1 - 0.4 * tracks.sheetCover(yD, height));
    // the pointer presses the cap it rests on (mouse only, and only while it keeps moving now and then)
    const tapping = time < tapUntil;
    if (tapping || (!mobile && time - pointerAt < 4)) {
      camera.updateMatrixWorld();
      raycaster.setFromCamera(tapping ? ndc.set(tapX, tapY) : ndc.set(tpx, tpy), camera);
      kb.pointer(raycaster.ray);
    } else kb.pointer(null);
    kb.apply(st.a, st.b, st.t, st.local, time);
    // aim the glint: mirror the view ray about the copper tops' normal and park the card on that line
    const pose = st.t < 0.5 ? st.a : st.b;
    kb.copper(gp, gn, pose === 4);
    gv.subVectors(gp, camera.position).normalize();
    gv.addScaledVector(gn, -2 * gv.dot(gn));
    glint.position.copy(gp).addScaledVector(gv, 3.4);
    glint.lookAt(gp);
    glint.translateX(pose === 4 ? (st.local - 0.5) * 0.9 : 0);
    if (kb.typed !== lastTyped) {
      lastTyped = kb.typed;
      window.dispatchEvent(new CustomEvent('film:typed', { detail: kb.typed }));
    }
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
    state.ride = mobile ? tracks.ride(y, height) : 0;
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
  const onTap = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse') return;
    tapX = (e.clientX / Math.max(1, width)) * 2 - 1;
    tapY = -((e.clientY / Math.max(1, height)) * 2 - 1);
    tapUntil = time + 0.32;
  };
  const onPointer = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    tpx = (e.clientX / Math.max(1, width)) * 2 - 1;
    tpy = -((e.clientY / Math.max(1, height)) * 2 - 1);
    pointerAt = time;
  };
  const onVisibility = (): void => { if (document.hidden) stop(); else start(); };
  let scrollTimer = 0;
  const onStillScroll = (): void => { if (!scrollTimer) scrollTimer = window.setTimeout(() => { scrollTimer = 0; render(); }, 120); };

  const start = (): void => { if (!raf && !destroyed && !opts.reduced && !opts.still) { last = 0; raf = requestAnimationFrame(loop); } };
  const stop = (): void => { if (raf) cancelAnimationFrame(raf); raf = 0; };

  function render(st?: State): void {
    if (destroyed) return;
    if (st) { Object.assign(state, st); state.ride = st.ride ?? 0; }
    else { yD = window.scrollY; tracks.state(yD, height, state); state.ride = mobile ? tracks.ride(yD, height) : 0; }
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
    window.addEventListener('pointerdown', onTap, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
  }
  window.addEventListener('resize', onResize, { passive: true });
  const ro = new ResizeObserver(() => tracks.measure());
  ro.observe(document.body);

  return {
    typed: () => kb.typed,
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
      window.removeEventListener('pointerdown', onTap);
      window.removeEventListener('scroll', onStillScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      kb.dispose(); studio.dispose(); post.dispose(); rt.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
