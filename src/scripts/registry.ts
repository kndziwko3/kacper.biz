/**
 * Index of sectors: radio choices re-typeset the result page (published CEIDG counts, city locative in the email
 * line) and tell the printed map which city to ink (the scene places the city's label). Counters move like a
 * mechanical meter: a damped spring, never a jump (reduced motion: instant).
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
  // every element showing a value (the readout card and, on a phone, its miniature at the foot of the form)
  const outs = (k: string) => Array.from(section.querySelectorAll<HTMLElement>(`[data-out="${k}"]`));
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
  const maxCity = Math.max(...data.cities.map((x) => x.count));
  const emitCity = () => {
    const c = data.cities.find((x) => x.slug === val('city'));
    // w: how far the red ink spreads on the map, by the city's share of firms
    const detail = visible && c ? { lat: c.lat, lon: c.lon, w: Math.sqrt(c.count / maxCity) } : null;
    document.dispatchEvent(new CustomEvent('kb:city', { detail }));
  };
  const label = (k: string) => section.querySelector<HTMLElement>(`[data-label="${k}"]`);

  const update = () => {
    const s = data.sectors.find((x) => x.slug === val('sector'));
    const c = data.cities.find((x) => x.slug === val('city'));
    if (s) {
      outs('sector').forEach((el) => count(el, s.count));
      outs('sectorName').forEach((el) => swap(el, s.name));
      if (cta) cta.href = s.url;
    }
    if (c) {
      outs('city').forEach((el) => count(el, c.count));
      outs('cityName').forEach((el) => swap(el, c.name));
      outs('cityLoc').forEach((el) => swap(el, data.lang === 'pl' ? c.in : c.name));
      outs('cityIn').forEach((el) => swap(el, c.in));
      const ln = label('name'), lc = label('count');
      if (ln) ln.textContent = c.name;
      if (lc) lc.textContent = fmt(c.count);
    }
    emitCity();
  };

  form.addEventListener('change', update);
  // phone: the list opens to all sectors and closes again
  const more = form.querySelector<HTMLButtonElement>('[data-lk-more]');
  const onMore = () => {
    if (!more) return;
    const open = more.getAttribute('aria-expanded') !== 'true';
    more.setAttribute('aria-expanded', String(open));
    more.closest('.lk-set')?.classList.toggle('is-open', open);
    more.textContent = (open ? more.dataset.less : more.dataset.more) ?? '';
  };
  if (more) { more.hidden = false; more.addEventListener('click', onMore); }
  // the miniature readout steps aside once the full readout card is on screen
  const peek = section.querySelector<HTMLElement>('.lk-peek');
  const card = section.querySelector<HTMLElement>('.lk-card');
  const peekIo = new IntersectionObserver(([e]) => peek?.classList.toggle('is-away', !!e?.isIntersecting), { threshold: 0.15 });
  if (peek && card) peekIo.observe(card);
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
    more?.removeEventListener('click', onMore);
    peekIo.disconnect();
    document.removeEventListener('click', onPick);
    cancels.forEach((f) => f());
    visible = false;
    emitCity();
  };
}
