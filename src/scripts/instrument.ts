/** OutreachPilot "instrument": the step at the viewport centre drives the sticky panel. */
export function initInstrument(): () => void {
  const root = document.querySelector<HTMLElement>('[data-instrument]');
  if (!root) return () => undefined;
  const steps = Array.from(root.querySelectorAll<HTMLElement>('.step'));
  const panes = Array.from(root.querySelectorAll<HTMLElement>('[data-pane]'));
  const counter = root.querySelector<HTMLElement>('[data-panel-count]');
  const total = String(steps.length).padStart(2, '0');
  const set = (i: number) => {
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    panes.forEach((p, k) => p.classList.toggle('is-active', k === i));
    if (counter) counter.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
  };
  set(0);
  const io = new IntersectionObserver(
    (entries) => { for (const e of entries) if (e.isIntersecting) set(steps.indexOf(e.target as HTMLElement)); },
    { rootMargin: '-42% 0px -42% 0px' },
  );
  steps.forEach((s) => io.observe(s));
  return () => io.disconnect();
}
