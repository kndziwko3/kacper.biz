/** Portfolio stage: page scroll picks the project and scrolls its real full-page capture inside the frames. */
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export function initShowcase(): () => void {
  const root = document.querySelector<HTMLElement>('[data-showcase]');
  const track = root?.querySelector<HTMLElement>('.sc-track');
  if (!root || !track) return () => undefined;
  const items = Array.from(root.querySelectorAll<HTMLElement>('.sc-item'));
  const browser = Array.from(root.querySelectorAll<HTMLElement>('.sc-browser .sc-shot'));
  const phone = Array.from(root.querySelectorAll<HTMLElement>('.sc-phone .sc-shot'));
  const host = root.querySelector<HTMLElement>('[data-sc-host]');
  const hosts = items.map((it) => { try { return new URL(it.querySelector('a')!.href).hostname.replace(/^www\./, ''); } catch { return ''; } });
  const mq = window.matchMedia('(min-width: 900px)');
  const n = items.length;
  let active = -1;
  let raf = 0;

  const frame = () => {
    raf = 0;
    if (!mq.matches) return;
    const r = track.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
    const f = p * n;
    const i = Math.min(n - 1, Math.floor(f));
    const local = clamp(f - i, 0, 1);
    if (i !== active) {
      active = i;
      items.forEach((el, k) => el.classList.toggle('is-active', k === i));
      [browser, phone].forEach((set) => set.forEach((el, k) => el.classList.toggle('is-active', k === i)));
      if (host) host.textContent = hosts[i] ?? '';
    }
    const t = clamp((local - 0.1) / 0.8, 0, 1);
    const e = t * t * (3 - 2 * t);
    for (const shot of [browser[i], phone[i]]) {
      if (!shot?.parentElement) continue;
      const max = Math.max(0, shot.offsetHeight - shot.parentElement.clientHeight);
      shot.style.transform = `translate3d(0, ${(-max * e).toFixed(1)}px, 0)`;
    }
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  root.querySelectorAll('img').forEach((img) => img.addEventListener('load', onScroll, { once: true }));
  frame();
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
