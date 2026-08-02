import { PALETTE, nearestColor, type ColorIndex } from './palette';

export const STICKERS_PER_CUBE = 3;

/**
 * Floyd–Steinberg error diffusion onto the six cube colours.
 *
 * `forced` lets the caller pin specific pixels (used for cube centres, which
 * cannot change colour — see faceToState). A pinned pixel still contributes its
 * quantisation error to the diffusion, so neighbours absorb and partially
 * compensate for the constraint instead of the error simply vanishing.
 */
export function quantizeWithDither(
  rgb: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  forced?: (x: number, y: number) => ColorIndex | undefined,
): Uint8Array {
  // Work in float so diffused error doesn't clip at each step.
  const buf = new Float32Array(width * height * 3);
  for (let i = 0; i < buf.length; i++) buf[i] = rgb[i];

  const out = new Uint8Array(width * height);

  const diffuse = (x: number, y: number, er: number, eg: number, eb: number, f: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = (y * width + x) * 3;
    buf[i] += er * f;
    buf[i + 1] += eg * f;
    buf[i + 2] += eb * f;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const r = buf[i];
      const g = buf[i + 1];
      const b = buf[i + 2];

      const pinned = forced?.(x, y);
      const chosen = pinned ?? nearestColor(r, g, b);
      out[y * width + x] = chosen;

      const target = PALETTE[chosen].rgb;
      const er = r - target[0];
      const eg = g - target[1];
      const eb = b - target[2];

      // Standard Floyd–Steinberg kernel: 7/16 right, 3/16 down-left,
      // 5/16 down, 1/16 down-right.
      diffuse(x + 1, y, er, eg, eb, 7 / 16);
      diffuse(x - 1, y + 1, er, eg, eb, 3 / 16);
      diffuse(x, y + 1, er, eg, eb, 5 / 16);
      diffuse(x + 1, y + 1, er, eg, eb, 1 / 16);
    }
  }

  return out;
}

/**
 * Slice a width×height sticker grid into 3×3 tiles, one per cube, in
 * row-major cube order. Each tile is returned as 9 palette indices read
 * row-major, which is the same reading order as a cube face.
 */
export function sliceIntoCubes(
  stickers: Uint8Array,
  width: number,
  height: number,
  gridCols: number,
  gridRows: number,
): ColorIndex[][] {
  const tiles: ColorIndex[][] = [];
  for (let cy = 0; cy < gridRows; cy++) {
    for (let cx = 0; cx < gridCols; cx++) {
      const tile: ColorIndex[] = [];
      for (let sy = 0; sy < STICKERS_PER_CUBE; sy++) {
        for (let sx = 0; sx < STICKERS_PER_CUBE; sx++) {
          const px = cx * STICKERS_PER_CUBE + sx;
          const py = cy * STICKERS_PER_CUBE + sy;
          tile.push(stickers[py * width + px] as ColorIndex);
        }
      }
      tiles.push(tile);
    }
  }
  return tiles;
}

/** True for sticker coordinates that sit at the centre of their cube. */
export function isCubeCentre(x: number, y: number): boolean {
  return x % STICKERS_PER_CUBE === 1 && y % STICKERS_PER_CUBE === 1;
}

/**
 * Choose one centre colour per cube, shared by every mosaic.
 *
 * Centres are immovable under face turns, so a cube shows the same centre
 * colour in every mosaic it ever displays. Picking the colour that minimises
 * total error against each mosaic's *source* pixel (before quantisation) keeps
 * the compromise as cheap as possible.
 */
export function chooseSharedCentres(
  sources: Array<Uint8Array | Uint8ClampedArray>,
  width: number,
  height: number,
  gridCols: number,
  gridRows: number,
): ColorIndex[] {
  const centres: ColorIndex[] = [];
  for (let cy = 0; cy < gridRows; cy++) {
    for (let cx = 0; cx < gridCols; cx++) {
      const px = cx * STICKERS_PER_CUBE + 1;
      const py = cy * STICKERS_PER_CUBE + 1;
      const i = (py * width + px) * 3;

      let best: ColorIndex = 0;
      let bestD = Infinity;
      for (let c = 0; c < PALETTE.length; c++) {
        let total = 0;
        for (const src of sources) {
          const dr = src[i] - PALETTE[c].rgb[0];
          const dg = src[i + 1] - PALETTE[c].rgb[1];
          const db = src[i + 2] - PALETTE[c].rgb[2];
          total += 2 * dr * dr + 4 * dg * dg + 3 * db * db;
        }
        if (total < bestD) {
          bestD = total;
          best = c as ColorIndex;
        }
      }
      centres.push(best);
    }
  }
  return centres;
}
