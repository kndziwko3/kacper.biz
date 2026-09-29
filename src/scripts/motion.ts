/**
 * Smooth scroll: Lenis on fine pointers only, never with reduced motion. Touch keeps native momentum.
 * Everything here is enhancement: the directory is readable and navigable without it.
 */
import Lenis from 'lenis';

let lenis: Lenis | null = null;

export function initSmooth(reduced: boolean): void {
  if (lenis || reduced) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  lenis = new Lenis({ lerp: 0.12, autoRaf: true, anchors: { offset: -64 } });
}

/** After a client-side navigation Astro moves the native scroll position; make Lenis agree with it. */
export function syncScroll(): void {
  if (!lenis) return;
  lenis.resize();
  lenis.scrollTo(window.scrollY, { immediate: true, force: true });
}

export function lockScroll(locked: boolean): void {
  if (!lenis) return;
  if (locked) lenis.stop(); else lenis.start();
}
