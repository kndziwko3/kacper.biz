/**
 * Index of sectors: radio choices re-typeset the result page (published CEIDG counts, city locative in the email
 * line) and tell the printed map which city to ping. Counters move like a mechanical meter: a damped spring, never
 * a jump (reduced motion: instant).
 */
interface Payload {
  lang: 'pl' | 'en';
  sectors: { slug: string; count: number; name: string; url: string }[];
  cities: { slug: string; count: number; name: string; in: string; lat: number; lon: number }[];
}

/**
 * Rolls the shown number to `to` with a critically damped spring's shape (fast start, no overshoot), normalised to
 * land exactly on time, so a 3-million count settles as quickly as a 3-digit one. Returns a cancel function.
 */
export function rollNumber(el: HTMLElement, to: number, fmt: (n: number) => string, reduced: boolean, ms = 900): () => void {
  const from = Number(el.dataset.v ?? (el.textContent || '').replace(/\D/g, '')) || 0;
  el.dataset.v = String(to);
  if (reduced || from === to) { el.textContent = fmt(to); return () => undefined; }
  const k = 7;
  const shape = (p: number) => 1 - (1 + k * p) * Math.exp(-k * p);
  const norm = shape(1);
  const t0 = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / ms);
    el.textContent = fmt(Math.round(from + (to - from) * (shape(p) / norm)));
    if (p < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export function initRegistry(reduced: boolean): () => void {
  const form = document.querySelector<HTMLFormElement>('[data-registry]');
  const dataEl = document.querySelector<HTMLScriptElement>('[data-registry-data]');
  const section = form?.closest('section');
  if (!form || !dataEl || !section) return () => undefined;
  let data: Payload;
  try { data = JSON.parse(dataEl.textContent || '') as Payload; } catch { return () => undefined; }

  const nf = new Intl.NumberFormat(data.lang === 'pl' ? 'pl-PL' : 'en-US');
  const fmt = (n: number) => nf.format(n).replace(/\s/g, ' ');
  const out = (k: string) => section.querySelector<HTMLElement>(`[data-out="${k}"]`);
  const val = (name: string) => (form.elements.namedItem(name) as RadioNodeList | null)?.value ?? '';
  const cta = section.querySelector<HTMLAnchorElement>('[data-cta="registry-sector"]');
  const cancels = new Map<HTMLElement, () => void>();

  const count = (el: HTMLElement | null, to: number) => {
    if (!el) return;
    cancels.get(el)?.();
    cancels.set(el, rollNumber(el, to, fmt, reduced));
  };
  const swap = (el: HTMLElement | null, text: string) => {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    if (!reduced) el.animate([{ opacity: 0, transform: 'translateY(0.35em)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  };

  let visible = false;
  const emitCity = () => {
    const c = data.cities.find((x) => x.slug === val('city'));
    document.dispatchEvent(new CustomEvent('kb:city', { detail: visible && c ? { lat: c.lat, lon: c.lon } : null }));
  };

  const update = () => {
    const s = data.sectors.find((x) => x.slug === val('sector'));
    const c = data.cities.find((x) => x.slug === val('city'));
    if (s) {
      count(out('sector'), s.count);
      swap(out('sectorName'), s.name);
      if (cta) cta.href = s.url;
    }
    if (c) {
      count(out('city'), c.count);
      swap(out('cityName'), c.name);
      swap(out('cityLoc'), data.lang === 'pl' ? c.in : c.name);
      swap(out('cityIn'), c.in);
    }
    emitCity();
  };

  form.addEventListener('change', update);
  // register rows in the entry pick their sector here (the link still jumps to the index without JS)
  const onPick = (e: Event) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-pick]');
    if (!a) return;
    const input = form.querySelector<HTMLInputElement>(`input[name="sector"][value="${a.dataset.pick}"]`);
    if (input && !input.checked) { input.checked = true; update(); }
  };
  document.addEventListener('click', onPick);
  const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; emitCity(); }, { threshold: 0.2 });
  io.observe(section);
  update();
  return () => {
    io.disconnect();
    form.removeEventListener('change', update);
    document.removeEventListener('click', onPick);
    cancels.forEach((f) => f());
    visible = false;
    emitCity();
  };
}
