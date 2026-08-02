import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

/**
 * Generates stand-in source images so the pipeline is runnable end to end
 * before real artwork exists. Replace the files in assets/mosaic-source/ with
 * your own and re-run `npm run build:mosaics` — nothing here is referenced at
 * runtime.
 *
 * Deliberately pure geometry (no <text>): sharp's SVG rasteriser depends on
 * system fonts, which would make output differ machine to machine.
 *
 * Per the spec's design note these lean on strong light/dark structure rather
 * than hue, because at the final ~12% alpha the mosaic reads as luminance.
 */

const W = 1200;
const H = 700; // 12:7, matching the 72x42 sticker grid

/**
 * Every colour here is drawn FROM the cube palette on purpose.
 *
 * A Rubik's cube has no black. The darkest sticker is blue (~0.09 relative
 * luminance) and the brightest is white (1.0). Feeding the quantiser anything
 * near #000 puts it outside the gamut entirely, and Floyd–Steinberg answers by
 * scattering the six bright colours into noise rather than producing something
 * dark. So the background is blue, not black, and contrast comes from the
 * blue→white luminance spread.
 */
const BLUE = '#0051BA';
const WHITE = '#FFFFFF';
const YELLOW = '#FFD500';

const SOURCES: Record<string, string> = {
  ring: `
    <rect width="${W}" height="${H}" fill="${BLUE}"/>
    <circle cx="${W / 2}" cy="${H / 2}" r="215" fill="none" stroke="${WHITE}" stroke-width="115"/>
    <circle cx="${W / 2}" cy="${H / 2}" r="62" fill="${YELLOW}"/>
  `,
  cross: `
    <rect width="${W}" height="${H}" fill="${BLUE}"/>
    <g fill="${WHITE}">
      <rect x="${W / 2 - 65}" y="110" width="130" height="480"/>
      <rect x="${W / 2 - 250}" y="285" width="500" height="130"/>
    </g>
  `,
  bars: `
    <rect width="${W}" height="${H}" fill="${BLUE}"/>
    <g fill="${WHITE}">
      <rect x="215" y="430" width="130" height="190"/>
      <rect x="385" y="300" width="130" height="320"/>
      <rect x="555" y="140" width="130" height="480"/>
      <rect x="725" y="255" width="130" height="365"/>
      <rect x="895" y="390" width="130" height="230"/>
    </g>
  `,
};

const outDir = join(process.cwd(), 'assets', 'mosaic-source');
await mkdir(outDir, { recursive: true });

for (const [name, body] of Object.entries(SOURCES)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(join(outDir, `${name}.png`), png);
  console.log(`wrote assets/mosaic-source/${name}.png`);
}
