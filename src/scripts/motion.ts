/**
 * Motion engine: Lenis smooth scroll (fine pointers only, never with reduced motion) + GSAP line reveals.
 * Everything here is enhancement: content is readable and navigable without it.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

let lenis: Lenis | null = null;

export function initSmooth(reduced: boolean): void {
  if (lenis || reduced) return;
  if (!window.matchMedia('(pointer: fine)').matches) return; // touch keeps native momentum scrolling
  lenis = new Lenis({ lerp: 0.1, autoRaf: false, anchors: { offset: -80 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export const getLenis = (): Lenis | null => lenis;

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

/** Per-page choreography. Returns a cleanup that reverts every split and trigger. */
export function pageMotion(reduced: boolean): () => void {
  if (reduced) return () => undefined;
  const ctx = gsap.context(() => {
    document.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) return; // already on screen: never hide visible text
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 108,
            duration: 1.05,
            ease: 'expo.out',
            stagger: 0.07,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }),
      });
    });
  });
  const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => {
    cancelAnimationFrame(raf);
    ctx.revert();
  };
}
