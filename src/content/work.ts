/** Portfolio captures (from fastlanding.io/img/work, converted to AVIF/WebP in public/work). Sizes are intrinsic pixels. */
export interface WorkShots { hero: [number, number]; tour: [number, number]; mtour: [number, number] }

export const SHOTS: Record<string, WorkShots> = {
  stomatologia: { hero: [960, 600], tour: [960, 4221], mtour: [440, 8818] },
  hellohome: { hero: [960, 600], tour: [960, 3162], mtour: [440, 7109] },
  casaflamingo: { hero: [960, 600], tour: [960, 3496], mtour: [440, 5849] },
  outreachpilot: { hero: [960, 600], tour: [960, 2264], mtour: [440, 5972] },
};

export const shot = (key: string, kind: keyof WorkShots) => ({
  avif: `/work/${key}-${kind}.avif`,
  webp: `/work/${key}-${kind}.webp`,
  width: SHOTS[key]![kind][0],
  height: SHOTS[key]![kind][1],
});
