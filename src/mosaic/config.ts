/** Every tunable in one place. */

/**
 * Alpha the whole mosaic is drawn at, over the site's #0A0A0A background.
 * The reading column is painted solid `bg` (see components/Layout.tsx), so the
 * cubes only ever show in the margins and can run well above the 0.12 that
 * text legibility used to cap them at.
 */
export const OPACITY = 1;

/** How long a completed mosaic sits still before the next transition starts. */
export const HOLD_MS = 8000;

/** Total window for a transition. Every cube finishes inside it. */
export const TRANSITION_MS = 6000;

/**
 * When true, cubes start at slightly offset times for an organic churn instead
 * of moving in lockstep. The offset is taken out of TRANSITION_MS, so the
 * transition still ends when it says it does.
 */
export const STAGGER = true;
export const STAGGER_MS = 1600;

/**
 * Gaps are fractions of the cube's on-screen size, not fixed pixels: the grid
 * is dense enough that a cube is ~19px on a 1080p desktop, where a fixed 2px
 * seam would eat 10% of it. Expressed as ratios, the cube reads the same at
 * any grid density or viewport.
 */
export const CUBE_GAP_RATIO = 0.05;
export const STICKER_GAP_RATIO = 0.03;

/** Floor in device-independent px, so seams never vanish entirely. */
export const MIN_GAP = 0.5;

/** Retina sharpness without the cost of 3x backing stores. */
export const MAX_DPR = 2;

/** Colour letters as emitted by scripts/build-mosaics.ts. */
export const COLOR_HEX: Record<string, string> = {
  W: '#FFFFFF',
  Y: '#FFD500',
  R: '#C41E3A',
  O: '#FF5800',
  B: '#0051BA',
  G: '#009E60',
};

export const COLOR_LETTERS = ['W', 'Y', 'R', 'O', 'B', 'G'] as const;

/** Palette as an index-addressed array, matching the build script's order. */
export const PALETTE_HEX = COLOR_LETTERS.map((l) => COLOR_HEX[l]);

/** The front face occupies facelets 18..26 of the 54-character state. */
export const FRONT_OFFSET = 18;
