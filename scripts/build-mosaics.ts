import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import Cube from 'cubejs';
import {
  GRID_COLS,
  GRID_ROWS,
  STICKER_COLS,
  STICKER_ROWS,
  loadSources,
  writePreview,
} from './lib/images';
import { chooseSharedCentres, isCubeCentre, quantizeWithDither, sliceIntoCubes } from './lib/quantize';
import { FACES, colorToFace, orientationForFront, type ColorIndex, type Face } from './lib/palette';
import { faceToState, frontFace, legalityErrors } from './lib/faceToState';
import { algBetween, initSolver, moveCount } from './lib/solve';
import { BASE_MOVES, applyPerm, deriveFaceletPerms, verifyPerms } from './lib/moves';

/** Colour letters used in the shipped JSON, indexed to match PALETTE. */
const COLOR_LETTERS = ['W', 'Y', 'R', 'O', 'B', 'G'] as const;

const srcDir = join(process.cwd(), 'assets', 'mosaic-source');
const previewDir = join(process.cwd(), 'assets', 'mosaic-preview');
const outFile = join(process.cwd(), 'src', 'mosaic', 'data', 'mosaics.json');

const t0 = Date.now();
const step = (msg: string) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}`);

// ---------------------------------------------------------------- Phase 1 ---
step('phase 1: quantising sources');
const sources = await loadSources(srcDir);
if (sources.length < 2) {
  throw new Error(`need at least 2 source images to build transitions; found ${sources.length}`);
}

const centres = chooseSharedCentres(
  sources.map((s) => s.pixels),
  STICKER_COLS,
  STICKER_ROWS,
  GRID_COLS,
  GRID_ROWS,
);

await mkdir(previewDir, { recursive: true });

const tilesPerMosaic = sources.map((src) => {
  const stickers = quantizeWithDither(src.pixels, STICKER_COLS, STICKER_ROWS, (x, y) => {
    if (!isCubeCentre(x, y)) return undefined;
    return centres[Math.floor(y / 3) * GRID_COLS + Math.floor(x / 3)];
  });
  return { id: src.id, stickers, tiles: sliceIntoCubes(stickers, STICKER_COLS, STICKER_ROWS, GRID_COLS, GRID_ROWS) };
});

for (const m of tilesPerMosaic) {
  await writePreview(join(previewDir, `${m.id}-full.png`), m.stickers, { gap: true });
  await writePreview(join(previewDir, `${m.id}-dimmed.png`), m.stickers, { alpha: 0.12 });
}
step(`  ${sources.length} mosaics x ${GRID_COLS * GRID_ROWS} cubes; previews written`);

// ---------------------------------------------------------------- Phase 2 ---
step('phase 2: building legal cube states');
const CELLS = GRID_COLS * GRID_ROWS;

// Per cell, the orientation is fixed for all time by its locked centre colour.
const orientations = centres.map((c) => orientationForFront(c));
const toFace = orientations.map((o) => colorToFace(o));

/** Render a state's 54 facelets as colour letters using this cell's orientation. */
function stateToColors(state: ReturnType<typeof faceToState>, cell: number): string {
  const faceColors = orientations[cell];
  const letters = new Cube(state).asString();
  let out = '';
  for (const ch of letters) out += COLOR_LETTERS[faceColors[ch as Face]];
  return out;
}

const states: ReturnType<typeof faceToState>[][] = [];
const colorStates: string[][] = [];

for (const [mosaicIndex, m] of tilesPerMosaic.entries()) {
  const perCell: ReturnType<typeof faceToState>[] = [];
  const perCellColors: string[] = [];

  for (let cell = 0; cell < CELLS; cell++) {
    const tile = m.tiles[cell];
    const want = tile.map((c) => toFace[cell][c as ColorIndex] as string);
    // A distinct back-fill per mosaic, so unchanged tiles still have to turn.
    const state = faceToState(want, mosaicIndex + 1);

    const errs = legalityErrors(state);
    if (errs.length) throw new Error(`cell ${cell} of ${m.id} illegal: ${errs.join('; ')}`);
    if (frontFace(state) !== want.join('')) {
      throw new Error(`cell ${cell} of ${m.id}: front face does not match target`);
    }

    const colors = stateToColors(state, cell);
    // End-to-end check: the colours the browser will draw must equal the
    // quantised tile the image pipeline produced.
    const rendered = colors.slice(18, 27);
    const expected = tile.map((c) => COLOR_LETTERS[c]).join('');
    if (rendered !== expected) {
      throw new Error(`cell ${cell} of ${m.id}: rendered ${rendered} != quantised ${expected}`);
    }

    perCell.push(state);
    perCellColors.push(colors);
  }
  states.push(perCell);
  colorStates.push(perCellColors);
}
step(`  ${sources.length * CELLS} states built, all legal and exact`);

// ---------------------------------------------------------------- Phase 3 ---
step('phase 3: deriving move tables');
const perms = deriveFaceletPerms();
verifyPerms(perms);
step('  facelet permutations verified against 10000 random cubes');

step('phase 3: solving transitions (this is the slow part)');
initSolver();
step('  solver tables ready');

type Transition = { from: string; to: string; sequences: string[] };
const transitions: Transition[] = [];
const allLengths: number[] = [];

/**
 * The algorithm is a pure function of the two states, and large flat regions of
 * an image produce the very same state pair in hundreds of cells. Memoising on
 * the pair cuts ~1008 Kociemba searches down to ~200 — the difference between a
 * build you can re-run and one you avoid re-running.
 */
const algCache = new Map<string, string>();
let solved = 0;
let cacheHits = 0;

for (let i = 0; i < tilesPerMosaic.length; i++) {
  const a = i;
  const b = (i + 1) % tilesPerMosaic.length; // wrap-around closes the cycle
  const sequences: string[] = [];

  for (let cell = 0; cell < CELLS; cell++) {
    const key = `${new Cube(states[a][cell]).asString()}>${new Cube(states[b][cell]).asString()}`;
    let alg = algCache.get(key);
    if (alg === undefined) {
      alg = algBetween(states[a][cell], states[b][cell]);
      algCache.set(key, alg);
      solved++;
      if (solved % 25 === 0) step(`    ${solved} distinct solves done`);
    } else {
      cacheHits++;
    }

    // Replay through the *shipped* representation — colour letters plus the
    // derived permutations — so the data is proven correct in exactly the form
    // the browser will consume, not merely in cubejs's internal model.
    let facelets = colorStates[a][cell];
    for (const token of alg.split(/\s+/).filter(Boolean)) {
      const base = token[0] as (typeof BASE_MOVES)[number];
      const turns = token.endsWith('2') ? 2 : token.endsWith("'") ? 3 : 1;
      for (let t = 0; t < turns; t++) facelets = applyPerm(facelets, perms[base]);
    }
    if (facelets !== colorStates[b][cell]) {
      throw new Error(`cell ${cell}, ${tilesPerMosaic[a].id}->${tilesPerMosaic[b].id}: replay mismatch`);
    }

    sequences.push(alg);
    allLengths.push(moveCount(alg));
  }

  transitions.push({ from: tilesPerMosaic[a].id, to: tilesPerMosaic[b].id, sequences });
  step(`  ${tilesPerMosaic[a].id} -> ${tilesPerMosaic[b].id} solved`);
}

const maxLen = Math.max(...allLengths);
const avgLen = allLengths.reduce((x, y) => x + y, 0) / allLengths.length;
step(`  ${allLengths.length} sequences; max ${maxLen} moves, avg ${avgLen.toFixed(1)}`);
step(`  ${solved} distinct solves, ${cacheHits} cache hits`);

// ------------------------------------------------------------------ Output ---
const payload = {
  gridCols: GRID_COLS,
  gridRows: GRID_ROWS,
  /** perm[j] = source index; one entry per clockwise quarter turn. */
  movePerms: Object.fromEntries(BASE_MOVES.map((m) => [m, perms[m]])),
  mosaics: tilesPerMosaic.map((m, i) => ({
    id: m.id,
    faces: colorStates[i].map((s) => s.slice(18, 27)),
    /** Full 54-facelet colour state; playback needs the hidden faces. */
    states: colorStates[i],
  })),
  transitions,
};

await mkdir(join(process.cwd(), 'src', 'mosaic', 'data'), { recursive: true });
await writeFile(outFile, JSON.stringify(payload));

const bytes = JSON.stringify(payload).length;
step(`wrote src/mosaic/data/mosaics.json (${(bytes / 1024).toFixed(0)} KB)`);
console.log(`\nmosaics: ${tilesPerMosaic.map((m) => m.id).join(' -> ')} -> (wrap)`);
