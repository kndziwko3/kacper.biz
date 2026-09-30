/**
 * Client entry. The page is complete without JS; everything here is enhancement.
 * The film (src/film) mounts once on a real GPU, after the page has loaded and settled, and fades in over the stills.
 * Astro ClientRouter keeps its canvas between pages, so later pages only re-point it (rescan).
 */
import { initAttribution } from './attribution';
import { initLeadForms } from './lead-form';
import { initSmooth, syncScroll, lockScroll } from './motion';
import { initRegistry } from './registry';
import { initShowcase } from './showcase';
import { initChat } from './chat';
import { initBooking } from './booking';
import type { Film, Tier } from '../film/film';

type Cleanup = () => void;

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let film: Film | null = null;
let filmState: 'idle' | 'starting' | 'live' | 'off' = 'idle';
let cleanups: Cleanup[] = [];

/* ── chapter rail: lights the chapter whose track holds the viewport centre ── */
function rail(): Cleanup {
  const nav = document.querySelector<HTMLElement>('[data-rail]');
  if (!nav) return () => undefined;
  const links = new Map(Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-rail-to]')).map((a) => [a.dataset.railTo!, a]));
  const set = (id: string) => links.forEach((a, k) => { if (k === id) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting && links.has(e.target.id)) set(e.target.id);
  }, { rootMargin: '-50% 0px -50% 0px' });
  document.querySelectorAll<HTMLElement>('[data-ch]').forEach((ch) => io.observe(ch));
  // the rail belongs to the film: it steps aside while a sheet or the footer passes under it
  const under = new Set<Element>();
  const io2 = new IntersectionObserver((entries) => {
    for (const e of entries) { if (e.isIntersecting) under.add(e.target); else under.delete(e.target); }
    root.classList.toggle('rail-hide', under.size > 0);
  }, { rootMargin: '-88% 0px 0px 0px' });
  document.querySelectorAll('[data-sheet], footer').forEach((el) => io2.observe(el));
  return () => { io.disconnect(); io2.disconnect(); root.classList.remove('rail-hide'); };
}

/* ── header ground: the band under the pills turns to paper while a light sheet runs beneath it ── */
function headerGround(): Cleanup {
  const light = Array.from(document.querySelectorAll<HTMLElement>('[data-sheet]:not(.sheet--dark)'));
  const under = new Set<Element>();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { if (e.isIntersecting) under.add(e.target); else under.delete(e.target); }
    root.classList.toggle('hd-paper', under.size > 0);
  }, { rootMargin: '0px 0px -92% 0px' });
  light.forEach((el) => io.observe(el));
  return () => { io.disconnect(); root.classList.remove('hd-paper'); };
}

/* ── menu: a full-screen dialog over everything ── */
function menu(): Cleanup {
  const btn = document.querySelector<HTMLButtonElement>('.hd-menu');
  const panel = document.getElementById('menu');
  if (!btn || !panel) return () => undefined;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    root.style.overflow = open ? 'hidden' : '';
    lockScroll(open);
    if (open) panel.querySelector<HTMLElement>('nav a')?.focus();
  };
  const onBtn = () => set(btn.getAttribute('aria-expanded') !== 'true');
  const onPanel = (e: Event) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-menu-close]')) { set(false); btn.focus(); }
    else if (t.closest('a')) set(false);
  };
  const onKey = (e: KeyboardEvent) => {
    if (!panel.classList.contains('is-open')) return;
    if (e.key === 'Escape') { set(false); btn.focus(); return; }
    if (e.key !== 'Tab') return;
    // keep focus inside the dialog
    const f = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button'));
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  btn.addEventListener('click', onBtn);
  panel.addEventListener('click', onPanel);
  document.addEventListener('keydown', onKey);
  return () => {
    btn.removeEventListener('click', onBtn);
    panel.removeEventListener('click', onPanel);
    document.removeEventListener('keydown', onKey);
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    root.style.overflow = '';
    lockScroll(false);
  };
}

/* ── the film ── */
/** A throwaway context: WebGL2 on a real GPU? Software rasterisers keep the stills instead. */
function hardwareGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

function pickTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 8;
  if (coarse) return cores >= 8 && mem >= 6 ? 'mid' : 'low';
  return cores >= 8 && mem >= 8 ? 'high' : 'mid';
}

const filmOff = (): void => { filmState = 'off'; root.classList.add('film-off'); };

async function mountFilm(): Promise<void> {
  if (filmState !== 'idle') return;
  const canvas = document.getElementById('film') as HTMLCanvasElement | null;
  if (!canvas) return;
  // ?gl=high|mid|low forces a tier and the live film even on software GL (QA only)
  const forced = /[?&]gl=(high|mid|low)\b/.exec(location.search)?.[1] as Tier | undefined;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  if (!forced && (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? ''))) { filmOff(); return; }
  if (!forced && !hardwareGL()) { filmOff(); return; }
  filmState = 'starting';
  try {
    const { createFilm } = await import('../film/film');
    film = await createFilm(canvas, { tier: forced ?? pickTier(), reduced, forceQuality: !!forced });
    filmState = 'live';
    requestAnimationFrame(() => root.classList.add('film-live'));
  } catch {
    film = null;
    filmOff();
  }
}

/**
 * The stills are the first paint (and the LCP). The film loads when the visitor starts to scroll or after a few
 * quiet seconds, whichever comes first, and never before the load event.
 */
function scheduleFilm(): void {
  if (filmState !== 'idle') return;
  let fired = false;
  const go = () => {
    if (fired) return;
    fired = true;
    window.clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(() => void mountFilm(), { timeout: 1200 }); else window.setTimeout(() => void mountFilm(), 200);
  };
  const onScroll = () => go();
  let timer = 0;
  const arm = () => {
    timer = window.setTimeout(go, 3500);
    window.addEventListener('scroll', onScroll, { passive: true, once: true });
  };
  if (document.readyState === 'complete') arm(); else window.addEventListener('load', arm, { once: true });
}

/* ── page lifecycle ── */
function onPage(): void {
  root.classList.add('js');
  cleanups.forEach((f) => f());
  cleanups = [];
  syncScroll();
  initAttribution();
  initLeadForms();
  cleanups.push(
    rail(),
    headerGround(),
    menu(),
    initRegistry(reduced),
    initShowcase(reduced),
    initChat(reduced),
    initBooking(),
  );
  if (film) film.rescan();
  else scheduleFilm();
}

let booted = false;
let swapped = false;
const boot = () => {
  if (booted && !swapped) return;
  booted = true;
  swapped = false;
  onPage();
};

initSmooth(reduced);
document.addEventListener('astro:before-swap', () => { cleanups.forEach((f) => f()); cleanups = []; });
document.addEventListener('astro:after-swap', () => {
  swapped = true;
  root.classList.add('js');
  if (filmState === 'live') root.classList.add('film-live');
  if (filmState === 'off') root.classList.add('film-off');
});
document.addEventListener('astro:page-load', boot);
boot();
