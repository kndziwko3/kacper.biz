/**
 * Client entry. The page is complete without JS; everything here is enhancement.
 * Astro ClientRouter keeps the canvas alive between pages, so the printed 3D map is mounted once
 * and re-pointed at each new page (rescan) instead of restarting.
 */
import { initAttribution } from './attribution';
import { initLeadForms } from './lead-form';
import { initSmooth, syncScroll, lockScroll } from './motion';
import { initRegistry, rollNumber } from './registry';
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

/* ── running head + thumb index: the guide word and the tab follow the section in view ── */
const TAB_FOR: Record<string, string> = { outreachpilot: 'outreachpilot', indeks: 'outreachpilot', fastlanding: 'fastlanding', fastbot: 'fastlanding', kontakt: 'kontakt', 'bez-www': 'outreachpilot' };
function wayfinding(): Cleanup {
  const guide = document.querySelector<HTMLElement>('[data-guide]:not(section)');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('section[data-guide]'));
  const tabs = Array.from(document.querySelectorAll<HTMLAnchorElement>('.tabs a'));
  if (!guide || !sections.length) return () => undefined;
  const set = (sec: HTMLElement) => {
    const word = sec.dataset.guide ?? '';
    if (guide.textContent !== word) {
      guide.textContent = word;
      if (!reduced) guide.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    }
    const key = TAB_FOR[sec.id] ?? '';
    tabs.forEach((t) => t.classList.toggle('is-here', !!key && (t.getAttribute('href') ?? '').endsWith(key === 'kontakt' ? (root.lang === 'en' ? '/contact' : '/kontakt') : '/' + key)));
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) set(e.target as HTMLElement);
  }, { rootMargin: '-30% 0px -65% 0px' });
  sections.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

/* ── first print: the register column lays its leader dots down and the counts roll in, once per page view ── */
function firstPrint(): Cleanup {
  const reg = document.querySelector<HTMLElement>('.register[data-print]');
  if (!reg || reduced) return () => undefined;
  const r = reg.getBoundingClientRect();
  if (r.top > window.innerHeight || r.bottom < 0) return () => undefined;
  reg.classList.add('is-printing');
  const nf = new Intl.NumberFormat(root.lang === 'en' ? 'en-US' : 'pl-PL');
  const fmt = (n: number) => nf.format(n).replace(/\s/g, '\u00a0');
  const cancels = Array.from(reg.querySelectorAll<HTMLElement>('[data-roll]')).map((el, i) => {
    const to = Number(el.dataset.roll) || 0;
    el.dataset.v = '0';
    el.textContent = fmt(0);
    let cancel = () => undefined as void;
    const t = window.setTimeout(() => { cancel = rollNumber(el, to, fmt, false); }, 120 + i * 45);
    return () => { window.clearTimeout(t); cancel(); el.textContent = fmt(to); };
  });
  return () => cancels.forEach((c) => c());
}

/* ── mobile menu ── */
function menu(): Cleanup {
  const btn = document.querySelector<HTMLButtonElement>('.rhead .rhead-menu');
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

/* ── 3D world: mounted once, after load, only when it is worth it ── */
/** A throwaway context: WebGL2 on a real GPU? Software rasterisers keep the static poster instead. */
function hardwareGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software/i.test(renderer);
  } catch {
    return false;
  }
}

let posterOnly = false;
function startScene(): void {
  if (scene || starting || posterOnly) return;
  const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
  if (!canvas) return;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? '')) { posterOnly = true; return; }
  // ?gl=high|mid|low forces a tier and the live scene even on software GL (QA only)
  const tier = /[?&]gl=(high|mid|low)\b/.exec(location.search)?.[1] as 'high' | 'mid' | 'low' | undefined;
  starting = true;
  const go = async () => {
    try {
      if (!tier && !hardwareGL()) { posterOnly = true; return; }
      const { mountScene } = await import('../scene/index');
      const handle = (await mountScene(canvas, { reducedMotion: reduced, tier })) as SceneHandle | null;
      if (handle) {
        scene = handle;
        canvas.classList.add('is-live');
        // the live map prints over the poster before the poster goes
        window.setTimeout(() => root.classList.add('scene-live'), reduced ? 0 : 1200);
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
    wayfinding(),
    menu(),
    firstPrint(),
    initRegistry(reduced),
    initInstrument(),
    initShowcase(reduced),
    initChat(reduced),
    initBooking(),
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
document.addEventListener('astro:after-swap', () => { swapped = true; root.classList.add('js'); if (scene) root.classList.add('scene-live'); });
document.addEventListener('astro:page-load', boot);
boot();
