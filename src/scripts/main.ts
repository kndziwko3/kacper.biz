/**
 * Client entry. Everything here is progressive enhancement: the page is fully
 * readable and navigable with no JS. Heavy work (WebGL) is loaded after LCP.
 */
import { initAttribution } from './attribution';
import { initLeadForms } from './lead-form';

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* ── reveal on scroll ── */
function initReveal(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!els.length) return;
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  els.forEach((el) => io.observe(el));
  // Safety net: never leave content hidden if something goes wrong.
  window.setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 6000);
}

/* ── count-up numbers (final text is in the HTML for crawlers + no-JS) ── */
function initCounters(): void {
  if (reduced) return;
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const el = e.target as HTMLElement;
      const finalText = el.textContent ?? '';
      const digits = finalText.replace(/\D/g, '');
      if (!digits) continue;
      const target = Number(digits);
      const prefix = /^[\d\s]*\d/.exec(finalText)?.[0] ?? '';
      const suffix = finalText.slice(prefix.length);
      const grouped = /\d\s\d/.test(prefix);
      const t0 = performance.now();
      const dur = 1400;
      el.setAttribute('aria-label', finalText);
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        const v = Math.round(target * eased);
        el.textContent = (grouped ? v.toLocaleString('pl-PL').replace(/ /g, ' ') : String(v)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = finalText;
      };
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

/* ── mobile menu ── */
function initMenu(): void {
  const btn = document.querySelector<HTMLButtonElement>('.menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

/* ── magnetic buttons (fine pointers only) ── */
function initMagnetic(): void {
  if (reduced || !finePointer) return;
  document.querySelectorAll<HTMLElement>('.btn').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `translate(${x * 8}px, ${y * 6 - 2}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ── 3D layer: after LCP, only when it is worth it ── */
function initScene(): void {
  const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
  if (!canvas || !document.querySelector('[data-scene]')) return;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? '')) return;

  const start = async () => {
    try {
      const { mountScene } = await import('../scene/index');
      const handle = await mountScene(canvas, { reducedMotion: reduced });
      if (handle) canvas.classList.add('is-live');
    } catch {
      /* the poster + HTML are the fallback */
    }
  };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  const go = () => (idle ? idle(start, { timeout: 2500 }) : window.setTimeout(start, 900));
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

initAttribution();
initLeadForms();
initReveal();
initCounters();
initMenu();
initMagnetic();
initScene();
root.dataset.ready = 'true';
