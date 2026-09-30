/**
 * Proof frames: each capture slides up inside its frame while the frame crosses the viewport (scroll-linked). The tour
 * starts only once the frame's top has passed 55% of the viewport, so every frame first shows the top of its page.
 */
export function initShowcase(reduced = false): () => void {
  const frames = Array.from(document.querySelectorAll<HTMLElement>('[data-tour]'));
  if (!frames.length || reduced) return () => undefined;
  const live = new Set<HTMLElement>();
  let raf = 0;
  const paint = () => {
    raf = 0;
    const vh = window.innerHeight;
    live.forEach((f) => {
      const img = f.querySelector('img');
      if (!img) return;
      const r = f.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.55 - r.top) / (vh * 0.55 + r.height)));
      const travel = Math.max(0, img.getBoundingClientRect().height - r.height);
      img.style.transform = `translate3d(0, ${(-travel * p).toFixed(1)}px, 0)`;
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { if (e.isIntersecting) live.add(e.target as HTMLElement); else live.delete(e.target as HTMLElement); }
    onScroll();
  });
  frames.forEach((f) => io.observe(f));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
