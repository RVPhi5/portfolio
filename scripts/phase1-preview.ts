import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  GRID_COLS,
  GRID_ROWS,
  STICKER_COLS,
  STICKER_ROWS,
  loadSources,
  writePreview,
} from './lib/images';
import { chooseSharedCentres, isCubeCentre, quantizeWithDither } from './lib/quantize';

/**
 * Phase 1 verification: quantise the sources and write PNGs to eyeball before
 * any cube maths happens. If the image isn't readable here it never will be.
 */
const srcDir = join(process.cwd(), 'assets', 'mosaic-source');
const outDir = join(process.cwd(), 'assets', 'mosaic-preview');
await mkdir(outDir, { recursive: true });

const sources = await loadSources(srcDir);
console.log(`loaded ${sources.length} sources: ${sources.map((s) => s.id).join(', ')}`);

const centres = chooseSharedCentres(
  sources.map((s) => s.pixels),
  STICKER_COLS,
  STICKER_ROWS,
  GRID_COLS,
  GRID_ROWS,
);

for (const src of sources) {
  const forced = (x: number, y: number) => {
    if (!isCubeCentre(x, y)) return undefined;
    const cell = Math.floor(y / 3) * GRID_COLS + Math.floor(x / 3);
    return centres[cell];
  };

  const locked = quantizeWithDither(src.pixels, STICKER_COLS, STICKER_ROWS, forced);
  const free = quantizeWithDither(src.pixels, STICKER_COLS, STICKER_ROWS);

  let differing = 0;
  for (let i = 0; i < locked.length; i++) if (locked[i] !== free[i]) differing++;

  await writePreview(join(outDir, `${src.id}-full.png`), locked, { gap: true });
  await writePreview(join(outDir, `${src.id}-dimmed.png`), locked, { alpha: 0.12 });

  console.log(
    `${src.id.padEnd(10)} centre-lock changed ${differing}/${locked.length} stickers ` +
      `(${((differing / locked.length) * 100).toFixed(1)}%)`,
  );
}

console.log(`\npreviews written to assets/mosaic-preview/`);
