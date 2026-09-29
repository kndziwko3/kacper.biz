/**
 * Client entry. The page is complete without JS; everything here is enhancement.
 * Astro ClientRouter keeps the canvas and poster alive between pages, so the 3D world is mounted once
 * and re-pointed at each new page (rescan) instead of restarting.
 */
import { initAttribution } from './attribution';
import { initLeadForms } from './lead-form';
import { initSmooth, pageMotion, syncScroll, lockScroll } from './motion';
import { initRegistry } from './registry';
import { initInstrument } from './instrument';
import { initShowcase } from './showcase';
import { initChat } from './chat';
import { initBooking } from './booking';

interface SceneHandle {
  destroy(): void;
  rescan?(): void;
  setCity?(lat: number, lon: number): void;
  clearCity?(): void;
}
type Cleanup = () => void;

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scene: SceneHandle | null = null;
let starting = false;
let lastCity: { lat: number; lon: number } | null = null;
let cleanups: Cleanup[] = [];

/* ── live clock (Gliwice) ── */
function clock(): Cleanup {
  const fmt = new Intl.DateTimeFormat(root.lang === 'en' ? 'en-GB' : 'pl-PL', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit' });
  const tick = () => {
    const t = fmt.format(new Date());
    document.querySelectorAll<HTMLElement>('[data-clock]').forEach((el) => { el.textContent = t; });
  };
  tick();
  const id = window.setInterval(tick, 15_000);
  return () => window.clearInterval(id);
}

/* ── header: solid after scrolling, inverted over the paper sheet ── */
function headerState(): Cleanup {
  const header = document.querySelector<HTMLElement>('.site-header');
  const papers = Array.from(document.querySelectorAll<HTMLElement>('.paper'));
  let raf = 0;
  const update = () => {
    raf = 0;
    root.classList.toggle('is-scrolled', window.scrollY > 24);
    const mid = (header?.offsetHeight ?? 64) / 2;
    root.classList.toggle('on-paper', papers.some((p) => { const r = p.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; }));
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
}

/* ── mobile menu ── */
function menu(): Cleanup {
  const btn = document.querySelector<HTMLButtonElement>('.menu-btn');
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
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && panel.classList.contains('is-open')) { set(false); btn.focus(); } };
  btn.addEventListener('click', onBtn);
  panel.addEventListener('click', onPanel);
  document.addEventListener('keydown', onKey);
  return () => {
    btn.removeEventListener('click', onBtn);
    panel.removeEventListener('click', onPanel);
    document.removeEventListener('keydown', onKey);
    root.style.overflow = '';
    lockScroll(false);
  };
}

/* ── fade-up for non-heading blocks ── */
function reveals(): Cleanup {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return () => undefined; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));
  const safety = window.setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 9000);
  return () => { io.disconnect(); window.clearTimeout(safety); };
}

/* ── 3D world: mounted once, after load, only when it is worth it ── */
function startScene(): void {
  if (scene || starting) return;
  const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
  if (!canvas) return;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? '')) return;
  starting = true;
  const go = async () => {
    try {
      const { mountScene } = await import('../scene/index');
      const handle = (await mountScene(canvas, { reducedMotion: reduced })) as SceneHandle | null;
      if (handle) {
        scene = handle;
        canvas.classList.add('is-live');
        document.querySelector('.map-poster')?.classList.add('is-off');
        if (lastCity) scene.setCity?.(lastCity.lat, lastCity.lon);
      }
    } catch {
      /* the poster and the HTML are the fallback */
    } finally {
      starting = false;
    }
  };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  const kick = () => (idle ? idle(go, { timeout: 2000 }) : window.setTimeout(go, 600));
  if (document.readyState === 'complete') kick();
  else window.addEventListener('load', kick, { once: true });
}

document.addEventListener('kb:city', (e) => {
  const d = (e as CustomEvent<{ lat: number; lon: number } | null>).detail;
  lastCity = d;
  if (d) scene?.setCity?.(d.lat, d.lon);
  else scene?.clearCity?.();
});

/* ── page lifecycle ── */
function onPage(): void {
  root.classList.add('js');
  cleanups.forEach((f) => f());
  cleanups = [];
  syncScroll();
  initAttribution();
  initLeadForms();
  cleanups.push(
    clock(),
    headerState(),
    menu(),
    reveals(),
    initRegistry(reduced),
    initInstrument(),
    initShowcase(),
    initChat(reduced),
    initBooking(),
    pageMotion(reduced),
  );
  if (scene) scene.rescan?.();
  else startScene();
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
document.addEventListener('astro:after-swap', () => { swapped = true; root.classList.add('js'); });
document.addEventListener('astro:page-load', boot);
boot();
