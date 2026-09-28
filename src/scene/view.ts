/**
 * Per-chapter camera-ish framing. The camera never moves; the whole point-world (a Group) is placed,
 * scaled and rotated so that each chapter's shape lands in the right part of the viewport.
 */

export interface ChapterView {
  /** Base rotation (radians). ry is multiplied by the side (-1..1): the outer edge turns away, the shape opens toward the text. */
  rx: number; ry: number; rz: number;
  /** Nominal projected size of the shape in world units (already accounts for tilt). */
  w: number; h: number;
  /** Max fraction of viewport height on desktop / mobile. */
  hFracDesktop: number; hFracMobile: number;
  /** Pointer tilt gain (yaw, pitch) in radians at the viewport edge. */
  gainY: number; gainX: number;
}

export const VIEWS: readonly ChapterView[] = [
  // 0 cloud
  { rx: 0.16, ry: 0, rz: 0, w: 9.0, h: 6.2, hFracDesktop: 0.8, hFracMobile: 0.46, gainY: 0.2, gainX: 0.12 },
  // 1 map
  { rx: -0.56, ry: 0.05, rz: -0.03, w: 6.3, h: 5.15, hFracDesktop: 0.66, hFracMobile: 0.37, gainY: 0.08, gainX: 0.05 },
  // 2 traffic (same map, a touch more tilt so the arcs read)
  { rx: -0.68, ry: 0.05, rz: -0.03, w: 6.3, h: 4.95, hFracDesktop: 0.64, hFracMobile: 0.37, gainY: 0.08, gainX: 0.05 },
  // 3 page
  { rx: -0.1, ry: 0.36, rz: 0.0, w: 6.9, h: 5.0, hFracDesktop: 0.62, hFracMobile: 0.32, gainY: 0.3, gainX: 0.2 },
  // 4 chat
  { rx: -0.07, ry: 0.3, rz: 0.0, w: 7.0, h: 5.8, hFracDesktop: 0.68, hFracMobile: 0.38, gainY: 0.14, gainX: 0.09 },
  // 5 finale
  { rx: 0.44, ry: 0, rz: -0.16, w: 9.6, h: 7.4, hFracDesktop: 0.8, hFracMobile: 0.46, gainY: 0.12, gainX: 0.08 },
];

export interface Frame {
  visW: number; visH: number;
  mobile: boolean;
}

export interface Scales { half: number[]; wide: number[] }

/**
 * Group scale that fits each chapter into its share of the viewport.
 * `half`: the shape lives in one half of the screen (text on the other); `wide`: text is centred, shape may spread.
 */
export function chapterScales(f: Frame): Scales {
  const half = VIEWS.map((v) => {
    if (f.mobile) return Math.min((v.hFracMobile * f.visH) / v.h, (0.9 * f.visW) / v.w);
    return Math.min((v.hFracDesktop * f.visH) / v.h, (0.455 * f.visW) / v.w);
  });
  const wide = VIEWS.map((v, i) => {
    if (f.mobile) return half[i]!;
    return Math.min((v.hFracDesktop * f.visH) / v.h, (0.8 * f.visW) / v.w);
  });
  return { half, wide };
}
