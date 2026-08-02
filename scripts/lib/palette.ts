/** The six cube colours, in a fixed index order used everywhere downstream. */
export const PALETTE = [
  { name: 'white', hex: '#FFFFFF', rgb: [0xff, 0xff, 0xff] },
  { name: 'yellow', hex: '#FFD500', rgb: [0xff, 0xd5, 0x00] },
  { name: 'red', hex: '#C41E3A', rgb: [0xc4, 0x1e, 0x3a] },
  { name: 'orange', hex: '#FF5800', rgb: [0xff, 0x58, 0x00] },
  { name: 'blue', hex: '#0051BA', rgb: [0x00, 0x51, 0xba] },
  { name: 'green', hex: '#009E60', rgb: [0x00, 0x9e, 0x60] },
] as const satisfies ReadonlyArray<{ name: string; hex: string; rgb: readonly number[] }>;

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** Face-position letters, in the facelet order cubejs uses (URFDLB). */
export const FACES = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
export type Face = (typeof FACES)[number];

/**
 * Base colour scheme: the standard Western cube. Opposite pairs are
 * white/yellow, red/orange, green/blue — matching the palette above.
 */
const BASE: Record<Face, ColorIndex> = { U: 0, R: 2, F: 5, D: 1, L: 3, B: 4 };

/**
 * An orientation is "which colour sits on which face position". Generating the
 * 24 of them as the closure of two rotation generators — rather than writing
 * them out by hand — makes it impossible to accidentally include a mirror
 * image, which would be a colour scheme no physical cube has.
 */
function rotateX(m: Record<Face, ColorIndex>): Record<Face, ColorIndex> {
  return { U: m.F, F: m.D, D: m.B, B: m.U, R: m.R, L: m.L };
}
function rotateY(m: Record<Face, ColorIndex>): Record<Face, ColorIndex> {
  return { F: m.R, R: m.B, B: m.L, L: m.F, U: m.U, D: m.D };
}

function orientationKey(m: Record<Face, ColorIndex>): string {
  return FACES.map((f) => m[f]).join('');
}

export const ORIENTATIONS: Record<Face, ColorIndex>[] = (() => {
  const seen = new Map<string, Record<Face, ColorIndex>>();
  const queue = [BASE];
  while (queue.length) {
    const m = queue.pop()!;
    const key = orientationKey(m);
    if (seen.has(key)) continue;
    seen.set(key, m);
    queue.push(rotateX(m), rotateY(m));
  }
  return [...seen.values()];
})();

/**
 * Pick an orientation whose FRONT face shows `color`. Four of the 24 qualify
 * (the rotations about the F axis); any of them works, so take the first.
 */
export function orientationForFront(color: ColorIndex): Record<Face, ColorIndex> {
  const found = ORIENTATIONS.find((o) => o.F === color);
  if (!found) throw new Error(`no orientation with front colour ${color}`);
  return found;
}

/** Invert an orientation into colour → face-letter, for encoding targets. */
export function colorToFace(o: Record<Face, ColorIndex>): Record<ColorIndex, Face> {
  const out = {} as Record<ColorIndex, Face>;
  for (const f of FACES) out[o[f]] = f;
  return out;
}

/**
 * Squared distance with luma weighting. Plain RGB distance treats a swing in
 * blue as equal to one in green; these weights track perceived brightness,
 * which matters most here because the mosaic is finally drawn at ~12% alpha
 * where hue washes out and only luminance structure survives.
 */
export function colorDistance(r: number, g: number, b: number, target: readonly number[]): number {
  const dr = r - target[0];
  const dg = g - target[1];
  const db = b - target[2];
  return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
}

export function nearestColor(r: number, g: number, b: number): ColorIndex {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < PALETTE.length; i++) {
    const d = colorDistance(r, g, b, PALETTE[i].rgb);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best as ColorIndex;
}
