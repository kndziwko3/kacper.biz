/**
 * Maps the page's scroll position to a continuous "chapter" value.
 * Native scrolling only: this module reads layout and never touches scroll events' default behaviour.
 */

interface Anchor { y: number; v: number; s: number }

export interface Sample {
  /** Continuous chapter value (unclamped, interpolated between sections). */
  c: number;
  /** Where the 3D shape should sit: +1 right, -1 left, 0 centre (opposite of where the text is). */
  side: number;
}

export class SectionTracker {
  private anchors: Anchor[] = [];
  private ro: ResizeObserver | null = null;
  private timer = 0;
  private onFonts = (): void => this.schedule();

  constructor(private readonly onMeasured?: () => void) {}

  start(): void {
    this.measure();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.schedule());
      this.ro.observe(document.body);
    }
    window.addEventListener('load', this.onFonts);
    void document.fonts?.ready.then(this.onFonts).catch(() => undefined);
  }

  /** Coalesce bursts of layout changes into one measure (no rAF: the reduced-motion path must stay loop-free). */
  schedule(): void {
    if (this.timer) return;
    this.timer = window.setTimeout(() => {
      this.timer = 0;
      this.measure();
    }, 60);
  }

  measure(): void {
    const list: Anchor[] = [];
    const sy = window.scrollY;
    document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el) => {
      const v = parseFloat(el.dataset.scene ?? '');
      if (!Number.isFinite(v)) return;
      const r = el.getBoundingClientRect();
      const side = el.dataset.sceneSide;
      // data-scene-side is where the TEXT sits; the shape goes to the opposite side.
      const s = side === 'right' ? -1 : side === 'center' ? 0 : 1;
      list.push({ y: r.top + sy + r.height / 2, v, s });
    });
    list.sort((a, b) => a.y - b.y);
    this.anchors = list;
    this.onMeasured?.();
  }

  get hasSections(): boolean { return this.anchors.length > 0; }
  /** Side of the first section (the hero). */
  get firstSide(): number { return this.anchors[0]?.s ?? 1; }

  sample(scrollY: number, viewportH: number, out: Sample): Sample {
    const a = this.anchors;
    const n = a.length;
    if (n === 0) { out.c = 0; out.side = 1; return out; }
    const y = scrollY + viewportH * 0.5;
    if (y <= a[0]!.y) { out.c = a[0]!.v; out.side = a[0]!.s; return out; }
    if (y >= a[n - 1]!.y) { out.c = a[n - 1]!.v; out.side = a[n - 1]!.s; return out; }
    let i = 0;
    while (i < n - 2 && y >= a[i + 1]!.y) i++;
    const p = a[i]!, q = a[i + 1]!;
    const t = (y - p.y) / Math.max(1e-3, q.y - p.y);
    out.c = p.v + (q.v - p.v) * t;
    out.side = p.s + (q.s - p.s) * t;
    return out;
  }

  destroy(): void {
    this.ro?.disconnect();
    this.ro = null;
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = 0;
    window.removeEventListener('load', this.onFonts);
  }
}
