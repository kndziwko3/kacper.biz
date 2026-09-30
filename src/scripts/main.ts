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

/* ── wayfinding: the header's centre pill names the chapter or sheet in view ── */
function wayfinding(): Cleanup {
  const word = document.querySelector<HTMLElement>('[data-guide-word]');
  const marks = Array.from(document.querySelectorAll<HTMLElement>('main [data-guide]'));
  if (!word || !marks.length) return () => undefined;
  const set = (el: HTMLElement) => {
    const w = el.dataset.guide ?? '';
    if (!w || word.textContent === w) return;
    word.textContent = w;
    if (!reduced) word.animate([{ opacity: 0, transform: 'translateY(60%)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) set(e.target as HTMLElement);
  }, { rootMargin: '-45% 0px -54% 0px' });
  marks.forEach((m) => io.observe(m));
  return () => io.disconnect();
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
    wayfinding(),
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
