/**
 * Per-chapter framing. The camera never moves; the whole point-world (a Group) is placed, scaled and
 * rotated so that each chapter's shape lands in the right part of the viewport.
 */
import { GLIWICE, project } from './poland';
import { terrainZ } from './shapes';

export interface ChapterView {
  /** Base rotation (radians). ry is multiplied by the side (-1..1): the outer edge turns away, the shape opens toward the text. */
  rx: number; ry: number; rz: number;
  /** Nominal projected size of the framed area in world units (already accounts for tilt). */
  w: number; h: number;
  /** Max fraction of viewport height on desktop / mobile. */
  hFracDesktop: number; hFracMobile: number;
  /** Pointer tilt gain (yaw, pitch) in radians at the viewport edge. */
  gainY: number; gainX: number;
  /** Local point that is framed at the centre (the close-up looks at Gliwice). */
  focus: readonly [number, number, number];
  /** Turntable: radians the shape turns in its own plane per unit of scroll progress through its window. */
  spin: number;
}

const [GX, GY] = project(GLIWICE[0], GLIWICE[1]);
export const HOME: readonly [number, number, number] = [GX, GY, terrainZ(GX, GY) + 0.05];
const O = [0, 0, 0] as const;

export const VIEWS: readonly ChapterView[] = [
  // 0 cloud
  { rx: 0.16, ry: 0, rz: 0, w: 9.0, h: 6.2, hFracDesktop: 0.8, hFracMobile: 0.46, gainY: 0.2, gainX: 0.12, focus: O, spin: 0 },
  // 1 map
  { rx: -0.56, ry: 0.05, rz: -0.03, w: 6.3, h: 5.15, hFracDesktop: 0.66, hFracMobile: 0.37, gainY: 0.08, gainX: 0.05, focus: O, spin: 0.55 },
  // 2 traffic (same map, laid back further so the arcs stand up off the paper)
  { rx: -0.84, ry: 0.0, rz: -0.03, w: 6.3, h: 4.6, hFracDesktop: 0.62, hFracMobile: 0.37, gainY: 0.08, gainX: 0.05, focus: O, spin: 1.15 },
  // 3 page
  { rx: -0.1, ry: 0.36, rz: 0.0, w: 6.9, h: 5.0, hFracDesktop: 0.62, hFracMobile: 0.32, gainY: 0.3, gainX: 0.2, focus: O, spin: 0 },
  // 4 chat
  { rx: -0.07, ry: 0.3, rz: 0.0, w: 7.0, h: 5.8, hFracDesktop: 0.6, hFracMobile: 0.38, gainY: 0.14, gainX: 0.09, focus: O, spin: 0 },
  // 5 close-up: the same map, low and tight over Gliwice (Katowice, Opole and Kraków at the edges)
  { rx: -0.9, ry: 0.04, rz: -0.08, w: 2.7, h: 1.9, hFracDesktop: 0.72, hFracMobile: 0.4, gainY: 0.06, gainX: 0.04, focus: HOME, spin: 0.4 },
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
    return Math.min((v.hFracDesktop * f.visH) / v.h, (0.44 * f.visW) / v.w);
  });
  const wide = VIEWS.map((v, i) => {
    if (f.mobile) return half[i]!;
    return Math.min((v.hFracDesktop * f.visH) / v.h, (0.8 * f.visW) / v.w);
  });
  return { half, wide };
}
