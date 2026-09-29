/** Next five working days in Warsaw time as direct links into Justyna's Calendly (Polish public holidays skipped). */
const dayMs = 86_400_000;

function easter(y: number): [number, number] {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return [Math.floor((h + l - 7 * m + 114) / 31), ((h + l - 7 * m + 114) % 31) + 1];
}
function holidays(y: number): Set<string> {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fixed = ['01-01', '01-06', '05-01', '05-03', '08-15', '11-01', '11-11', '12-24', '12-25', '12-26'];
  const [em, ed] = easter(y);
  const base = Date.UTC(y, em - 1, ed);
  const shift = (days: number) => { const d = new Date(base + days * dayMs); return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
  return new Set([...fixed, shift(1), shift(60)].map((md) => `${y}-${md}`)); // Easter Monday, Corpus Christi
}

export function initBooking(): () => void {
  document.querySelectorAll<HTMLElement>('[data-days]').forEach((ul) => {
    const url = ul.dataset.url;
    if (!url) return;
    const locale = ul.dataset.lang === 'en' ? 'en-GB' : 'pl-PL';
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
    const wd = new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Warsaw', weekday: 'short' });
    const dd = new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Warsaw', day: 'numeric' });
    const mm = new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Warsaw', month: 'short' });
    const full = new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Warsaw', weekday: 'long', day: 'numeric', month: 'long' });
    const out: { iso: string; d: Date }[] = [];
    let t = Date.now();
    for (let guard = 0; out.length < 5 && guard < 30; guard++) {
      t += dayMs;
      const d = new Date(t);
      const p = Object.fromEntries(parts.formatToParts(d).map((x) => [x.type, x.value])) as Record<string, string>;
      const iso = `${p.year}-${p.month}-${p.day}`;
      if (p.weekday === 'Sat' || p.weekday === 'Sun' || holidays(Number(p.year)).has(iso)) continue;
      out.push({ iso, d });
    }
    ul.replaceChildren(...out.map(({ iso, d }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `${url}?month=${iso.slice(0, 7)}&date=${iso}`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.dataset.cta = 'talk-day';
      a.setAttribute('aria-label', full.format(d));
      a.innerHTML = `<span class="d-w">${wd.format(d)}</span><span class="d-n">${dd.format(d)}</span><span class="d-m">${mm.format(d)}</span>`;
      li.append(a);
      return li;
    }));
  });
  return () => undefined;
}
