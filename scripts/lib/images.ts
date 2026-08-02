import { readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import { PALETTE, type ColorIndex } from './palette';

export const GRID_COLS = 24;
export const GRID_ROWS = 14;
export const STICKER_COLS = GRID_COLS * 3; // 72
export const STICKER_ROWS = GRID_ROWS * 3; // 42

export type Source = { id: string; pixels: Uint8Array };

/**
 * Load every image in the source directory, downsampled to exactly the sticker
 * grid. `fit: 'cover'` crops rather than squashes — the grid's 12:7 aspect is
 * fixed, and distorting the artwork to match would be worse than cropping it.
 */
export async function loadSources(dir: string): Promise<Source[]> {
  const entries = (await readdir(dir))
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort();

  if (entries.length === 0) {
    throw new Error(`no source images found in ${dir}`);
  }

  const sources: Source[] = [];
  for (const file of entries) {
    const { data } = await sharp(join(dir, file))
      .resize(STICKER_COLS, STICKER_ROWS, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    sources.push({ id: parse(file).name, pixels: new Uint8Array(data) });
  }
  return sources;
}

/**
 * Write a magnified PNG of a quantised grid.
 *
 * `alpha` composites the mosaic over the site background at a given opacity —
 * pass the runtime OPACITY to see what visitors will actually see. Judging
 * recognisability from the full-strength render is misleading: at 12% alpha the
 * six colours collapse towards a narrow band of near-black.
 */
export async function writePreview(
  path: string,
  stickers: Uint8Array,
  opts: { scale?: number; alpha?: number; gap?: boolean } = {},
): Promise<void> {
  const scale = opts.scale ?? 12;
  const alpha = opts.alpha ?? 1;
  const gap = opts.gap ?? false;

  const w = STICKER_COLS * scale;
  const h = STICKER_ROWS * scale;
  const out = new Uint8Array(w * h * 3);

  // Site background, which the mosaic is composited over.
  const BG = [0x0a, 0x0a, 0x0a];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.floor(x / scale);
      const sy = Math.floor(y / scale);
      const withinX = x % scale;
      const withinY = y % scale;

      // Optional 1px seam at cube boundaries so the 3x3 structure is visible.
      const onCubeEdge =
        gap && ((sx % 3 === 0 && withinX === 0) || (sy % 3 === 0 && withinY === 0));

      const rgb = PALETTE[stickers[sy * STICKER_COLS + sx] as ColorIndex].rgb;
      const i = (y * w + x) * 3;
      for (let c = 0; c < 3; c++) {
        const src = onCubeEdge ? BG[c] : rgb[c];
        out[i + c] = Math.round(BG[c] * (1 - alpha) + src * alpha);
      }
    }
  }

  await sharp(Buffer.from(out), { raw: { width: w, height: h, channels: 3 } })
    .png()
    .toFile(path);
}
