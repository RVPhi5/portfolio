import { readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import { PALETTE, type ColorIndex } from './palette';

export const GRID_COLS = 100;
export const GRID_ROWS = 55;
export const STICKER_COLS = GRID_COLS * 3; // 300
export const STICKER_ROWS = GRID_ROWS * 3; // 165

export type Source = {
  id: string;
  pixels: Uint8Array;
  /**
   * Every sticker already lands exactly on a palette colour, i.e. the source is
   * cube art rather than a photograph. Such an image needs no quantisation at
   * all, and dithering it would only introduce error that isn't there.
   */
  exact: boolean;
};

/**
 * Load every image in the source directory, downsampled to exactly the sticker
 * grid. `fit: 'cover'` crops rather than squashes — the grid's 20:11 aspect is
 * fixed, and distorting the artwork to match would be worse than cropping it.
 *
 * Two downsamples are taken. Area-averaging is right for photographic input,
 * but it blends across sticker boundaries, which would corrupt art that is
 * already drawn as exact cube stickers. So a nearest-neighbour sample is taken
 * as well, and if every one of its pixels is exactly a palette colour, that is
 * the one used and the image passes through untouched.
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
    const path = join(dir, file);

    const sampled = await sampleStickerCentres(path);
    if (sampled && isExactlyPalette(sampled)) {
      sources.push({ id: parse(file).name, pixels: sampled, exact: true });
      continue;
    }

    const averaged = await sharp(path)
      .resize(STICKER_COLS, STICKER_ROWS, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer();
    sources.push({ id: parse(file).name, pixels: new Uint8Array(averaged), exact: false });
  }
  return sources;
}

/**
 * Read one pixel from the middle of each sticker's share of the image.
 *
 * Cube art is normally drawn with the seams between stickers filled in, and any
 * resampling — area-averaging or nearest-neighbour alike — mixes that seam
 * colour into the sticker. Reading the centre of each cell steps over the seams
 * entirely and recovers exactly the colours that were drawn.
 *
 * The crop matches sharp's `fit: 'cover'`: take the largest centred rectangle
 * with the grid's aspect ratio, then divide it into cells.
 */
async function sampleStickerCentres(path: string): Promise<Uint8Array | null> {
  const image = sharp(path);
  const meta = await image.metadata();
  if (!meta.width || !meta.height) return null;

  const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels } = info;

  const target = STICKER_COLS / STICKER_ROWS;
  const cropW = Math.min(W, Math.round(H * target));
  const cropH = Math.min(H, Math.round(W / target));
  const offX = (W - cropW) / 2;
  const offY = (H - cropH) / 2;

  const out = new Uint8Array(STICKER_COLS * STICKER_ROWS * 3);
  for (let sy = 0; sy < STICKER_ROWS; sy++) {
    const py = Math.floor(offY + ((sy + 0.5) * cropH) / STICKER_ROWS);
    for (let sx = 0; sx < STICKER_COLS; sx++) {
      const px = Math.floor(offX + ((sx + 0.5) * cropW) / STICKER_COLS);
      const src = (py * W + px) * channels;
      const dst = (sy * STICKER_COLS + sx) * 3;
      out[dst] = data[src];
      out[dst + 1] = data[src + 1];
      out[dst + 2] = data[src + 2];
    }
  }
  return out;
}

/** True when every pixel is one of the six cube colours, bit for bit. */
function isExactlyPalette(rgb: Uint8Array): boolean {
  for (let i = 0; i < rgb.length; i += 3) {
    const hit = PALETTE.some(
      (p) => p.rgb[0] === rgb[i] && p.rgb[1] === rgb[i + 1] && p.rgb[2] === rgb[i + 2],
    );
    if (!hit) return false;
  }
  return true;
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
