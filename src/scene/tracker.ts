/**
 * Maps the page's scroll position to a scene state: which chapter pair is on screen and how far along.
 * Native scrolling only: this module reads layout and never touches scroll events' default behaviour.
 *
 * Every [data-scene] section is a plateau: while the viewport centre is inside it (minus a margin), the
 * chapter holds still. Between two plateaus the state morphs from one section's chapter to the next, so
 * any two chapters can follow each other directly (map -> close-up never passes through the chat).
 *
 * Section attributes:
 *   data-scene="0..5"          chapter
 *   data-scene-side            where the TEXT sits: left | right | center (the shape goes opposite)
 *   data-scene-focus="1"       the "3 in 100" highlight on the map
 *   data-scene-dim="0..1"      brightness multiplier behind dense text
 *   data-scene-occlude         an opaque sheet: when it covers the whole viewport the scene can sleep
 */

interface Plateau { y0: number; y1: number; v: number; s: number; focus: number; dim: number }
interface Span { y0: number; y1: number }

export interface Sample {
  /** Chapter pair and progress between them (a === b on a plateau). */
  a: number;
  b: number;
  t: number;
  /** Where the 3D shape should sit: +1 right, -1 left, 0 centre (opposite of where the text is). */
  side: number;
  focus: number;
  dim: number;
  /** An opaque section covers the whole viewport. */
  occluded: boolean;
}

export class SectionTracker {
  private plateaus: Plateau[] = [];
  private occluders: Span[] = [];
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
    const list: Plateau[] = [];
    const occ: Span[] = [];
    const sy = window.scrollY;
    const vh = window.innerHeight || 800;
    document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el) => {
      const v = parseFloat(el.dataset.scene ?? '');
      if (!Number.isFinite(v)) return;
      const r = el.getBoundingClientRect();
      if (r.height <= 0) return;
      const top = r.top + sy, bottom = r.bottom + sy;
      const side = el.dataset.sceneSide;
      const s = side === 'right' ? -1 : side === 'center' ? 0 : 1;
      const dim = parseFloat(el.dataset.sceneDim ?? '');
      // hold while the viewport centre is well inside the section; morph across the boundary
      const m = Math.min(r.height * 0.3, vh * 0.32);
      list.push({ y0: top + m, y1: bottom - m, v, s, focus: el.dataset.sceneFocus === '1' ? 1 : 0, dim: Number.isFinite(dim) ? dim : 1 });
    });
    // opaque stock (any element marked data-scene-occlude, with or without a chapter of its own)
    document.querySelectorAll<HTMLElement>('[data-scene-occlude]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height > 0) occ.push({ y0: r.top + sy, y1: r.bottom + sy });
    });
    occ.sort((p, q) => p.y0 - q.y0);
    // adjacent sheets count as one: a viewport straddling two opaque sections is still covered
    for (let i = occ.length - 1; i > 0; i--) {
      if (occ[i]!.y0 <= occ[i - 1]!.y1 + 2) { occ[i - 1]!.y1 = Math.max(occ[i - 1]!.y1, occ[i]!.y1); occ.splice(i, 1); }
    }
    list.sort((p, q) => p.y0 - q.y0);
    this.plateaus = list;
    this.occluders = occ;
    this.onMeasured?.();
  }

  get hasSections(): boolean { return this.plateaus.length > 0; }

  /** State for a scroll position. `viewportH` is the layout viewport height. */
  sample(scrollY: number, viewportH: number, out: Sample): Sample {
    const p = this.plateaus;
    const n = p.length;
    out.occluded = this.occluders.some((o) => o.y0 <= scrollY + 1 && o.y1 >= scrollY + viewportH - 1);
    if (n === 0) { out.a = out.b = 1; out.t = 0; out.side = 1; out.focus = 0; out.dim = 1; return out; }
    const y = scrollY + viewportH * 0.5;
    let i = 0;
    while (i < n - 1 && y > p[i]!.y1) i++;
    const cur = p[i]!;
    if (y <= cur.y1 && (y >= cur.y0 || i === 0)) return hold(cur, out);
    if (y > cur.y1) return hold(cur, out); // past the last plateau
    // between p[i-1].y1 and p[i].y0
    const prev = p[i - 1]!;
    const t = clamp01((y - prev.y1) / Math.max(1, cur.y0 - prev.y1));
    out.a = prev.v; out.b = cur.v; out.t = t;
    out.side = prev.s + (cur.s - prev.s) * t;
    out.focus = prev.focus + (cur.focus - prev.focus) * t;
    out.dim = prev.dim + (cur.dim - prev.dim) * t;
    if (out.a === out.b) out.t = 0;
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

function hold(p: Plateau, out: Sample): Sample {
  out.a = out.b = p.v; out.t = 0;
  out.side = p.s; out.focus = p.focus; out.dim = p.dim;
  return out;
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
