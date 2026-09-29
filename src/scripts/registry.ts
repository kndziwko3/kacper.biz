/** Registry demo: sector + city selects update published CEIDG counts, the inflected mail line and the map highlight. */
interface Payload {
  lang: 'pl' | 'en';
  sectors: { slug: string; count: number; name: string; url: string }[];
  cities: { slug: string; count: number; name: string; in: string; lat: number; lon: number }[];
}

export function initRegistry(reduced: boolean): () => void {
  const form = document.querySelector<HTMLFormElement>('[data-registry]');
  const dataEl = document.querySelector<HTMLScriptElement>('[data-registry-data]');
  const section = form?.closest('section');
  if (!form || !dataEl || !section) return () => undefined;
  let data: Payload;
  try { data = JSON.parse(dataEl.textContent || '') as Payload; } catch { return () => undefined; }

  const nf = new Intl.NumberFormat(data.lang === 'pl' ? 'pl-PL' : 'en-US');
  const fmt = (n: number) => nf.format(n).replace(/\s/g, ' ');
  const out = (k: string) => section.querySelector<HTMLElement>(`[data-out="${k}"]`);
  const sectorSel = form.elements.namedItem('sector') as HTMLSelectElement;
  const citySel = form.elements.namedItem('city') as HTMLSelectElement;
  const cta = section.querySelector<HTMLAnchorElement>('[data-cta="registry-sector"]');
  const rows = Array.from(section.querySelectorAll<HTMLElement>('[data-sector-row]'));
  const rafs = new Map<HTMLElement, number>();

  const count = (el: HTMLElement | null, to: number) => {
    if (!el) return;
    const from = Number(el.dataset.v ?? (el.textContent || '').replace(/\D/g, '')) || 0;
    el.dataset.v = String(to);
    cancelAnimationFrame(rafs.get(el) ?? 0);
    if (reduced || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 900);
      el.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 4))));
      if (p < 1) rafs.set(el, requestAnimationFrame(step));
    };
    rafs.set(el, requestAnimationFrame(step));
  };

  let visible = false;
  const emitCity = () => {
    const c = data.cities.find((x) => x.slug === citySel.value);
    document.dispatchEvent(new CustomEvent('kb:city', { detail: visible && c ? { lat: c.lat, lon: c.lon } : null }));
  };

  const update = () => {
    const s = data.sectors.find((x) => x.slug === sectorSel.value);
    const c = data.cities.find((x) => x.slug === citySel.value);
    if (s) {
      count(out('sector'), s.count);
      if (cta) cta.href = s.url;
      rows.forEach((r) => r.classList.toggle('is-active', r.dataset.sectorRow === s.slug));
    }
    if (c) {
      count(out('city'), c.count);
      const loc = out('cityLoc'); if (loc) loc.textContent = data.lang === 'pl' ? c.in : c.name;
      const inflected = out('cityIn');
      if (inflected) {
        inflected.textContent = c.in;
        if (!reduced) inflected.animate([{ opacity: 0, transform: 'translateY(0.3em)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' });
      }
    }
    emitCity();
  };

  form.addEventListener('change', update);
  const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; emitCity(); }, { threshold: 0.25 });
  io.observe(section);
  update();
  return () => {
    io.disconnect();
    rafs.forEach((id) => cancelAnimationFrame(id));
    visible = false;
    emitCity();
  };
}
