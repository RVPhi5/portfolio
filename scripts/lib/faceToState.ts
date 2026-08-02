import Cube, { type CubeJson } from 'cubejs';

/**
 * Phase 2: build a legal full cube state whose FRONT face shows a given
 * 9-sticker pattern.
 *
 * Everything here works in cubejs's face-letter alphabet (U/R/F/D/L/B), never
 * in colours. A cube's colour scheme is just a relabelling of those letters by
 * a whole-cube rotation, so doing the construction in letter space means
 * legality can't depend on which orientation the caller picked.
 */

const SOLVED: CubeJson = new Cube().toJSON();
const F_START = 18; // F face occupies facelets 18..26 of the URFDLB string

const clone = (s: CubeJson): CubeJson => ({
  center: [...s.center],
  cp: [...s.cp],
  co: [...s.co],
  ep: [...s.ep],
  eo: [...s.eo],
});

const render = (s: CubeJson): string => new Cube(s).asString();

/**
 * Which facelet on the F face does each corner/edge slot control?
 *
 * Derived by perturbing one slot at a time and diffing the rendered string,
 * rather than hardcoding Kociemba's facelet numbering. A transposed constant
 * here would produce cubes that are perfectly legal but show the wrong picture,
 * which is exactly the kind of bug that survives every downstream assertion.
 */
function deriveSlotFacelets(kind: 'corner' | 'edge'): Map<number, number> {
  const base = render(SOLVED);
  const count = kind === 'corner' ? 8 : 12;
  const map = new Map<number, number>();

  for (let slot = 0; slot < count; slot++) {
    const s = clone(SOLVED);
    if (kind === 'corner') s.co[slot] = 1;
    else s.eo[slot] = 1;
    const str = render(s);

    for (let i = F_START; i < F_START + 9; i++) {
      if (str[i] !== base[i]) map.set(slot, i);
    }
  }
  return map;
}

export const CORNER_FACELET = deriveSlotFacelets('corner');
export const EDGE_FACELET = deriveSlotFacelets('edge');

/** The four corner slots and four edge slots that touch the F face. */
export const F_CORNER_SLOTS = [...CORNER_FACELET.keys()].sort((a, b) => a - b);
export const F_EDGE_SLOTS = [...EDGE_FACELET.keys()].sort((a, b) => a - b);

/**
 * table[slot][piece][orientation] = the letter shown on that slot's F sticker.
 * Also derived by rendering, for the same reason as above.
 */
function deriveStickerTable(
  kind: 'corner' | 'edge',
  slots: number[],
  facelets: Map<number, number>,
): Map<number, string[][]> {
  const pieces = kind === 'corner' ? 8 : 12;
  const oris = kind === 'corner' ? 3 : 2;
  const table = new Map<number, string[][]>();

  for (const slot of slots) {
    const perPiece: string[][] = [];
    for (let piece = 0; piece < pieces; piece++) {
      const perOri: string[] = [];
      for (let ori = 0; ori < oris; ori++) {
        const s = clone(SOLVED);
        if (kind === 'corner') {
          s.cp[slot] = piece;
          s.co[slot] = ori;
        } else {
          s.ep[slot] = piece;
          s.eo[slot] = ori;
        }
        perOri.push(render(s)[facelets.get(slot)!]);
      }
      perPiece.push(perOri);
    }
    table.set(slot, perPiece);
  }
  return table;
}

export const CORNER_STICKERS = deriveStickerTable('corner', F_CORNER_SLOTS, CORNER_FACELET);
export const EDGE_STICKERS = deriveStickerTable('edge', F_EDGE_SLOTS, EDGE_FACELET);

/** Index of the F centre facelet, for asserting the centre matches. */
export const F_CENTRE_FACELET = F_START + 4;

/**
 * Exhaustive assignment of distinct pieces to the F-face slots such that each
 * shows its required letter.
 *
 * The spec suggests randomised retry; backtracking is strictly better — it
 * either finds an assignment or proves none exists, with no flakiness. Every
 * letter appears on exactly 4 corner pieces and 4 edge pieces against only 4
 * slots, so Hall's condition always holds and this never actually fails. It
 * throws loudly rather than degrading if that reasoning is ever wrong.
 */
function assign(
  slots: number[],
  want: string[],
  table: Map<number, string[][]>,
  pieceCount: number,
): { piece: number; ori: number }[] {
  const result: { piece: number; ori: number }[] = new Array(slots.length);
  const used = new Set<number>();

  const step = (k: number): boolean => {
    if (k === slots.length) return true;
    const perPiece = table.get(slots[k])!;
    for (let piece = 0; piece < pieceCount; piece++) {
      if (used.has(piece)) continue;
      const ori = perPiece[piece].indexOf(want[k]);
      if (ori === -1) continue;
      used.add(piece);
      result[k] = { piece, ori };
      if (step(k + 1)) return true;
      used.delete(piece);
    }
    return false;
  };

  if (!step(0)) {
    throw new Error(
      `no assignment for required letters ${want.join('')} — this should be ` +
        `unreachable (every face pattern is realisable); the matching is buggy`,
    );
  }
  return result;
}

/** Sign of a permutation: 0 for even, 1 for odd. */
function permutationParity(p: number[]): number {
  let swaps = 0;
  const a = [...p];
  for (let i = 0; i < a.length; i++) {
    while (a[i] !== i) {
      const j = a[i];
      [a[i], a[j]] = [a[j], a[i]];
      swaps++;
    }
  }
  return swaps % 2;
}

/**
 * Build a legal state whose F face reads `want` (9 letters, row-major).
 * `want[4]` must be 'F' — the centre is immovable, so the caller is responsible
 * for having chosen an orientation whose front centre matches.
 */
export function faceToState(want: string[], variant = 0): CubeJson {
  if (want.length !== 9) throw new Error(`expected 9 letters, got ${want.length}`);
  if (want[4] !== 'F') {
    throw new Error(`centre must be 'F' (centres never move); got '${want[4]}'`);
  }

  // Map the 9 target letters onto the slots that actually render them.
  const cornerWant = F_CORNER_SLOTS.map((slot) => want[CORNER_FACELET.get(slot)! - F_START]);
  const edgeWant = F_EDGE_SLOTS.map((slot) => want[EDGE_FACELET.get(slot)! - F_START]);

  const corners = assign(F_CORNER_SLOTS, cornerWant, CORNER_STICKERS, 8);
  const edges = assign(F_EDGE_SLOTS, edgeWant, EDGE_STICKERS, 12);

  const state: CubeJson = {
    center: [...SOLVED.center],
    cp: new Array(8).fill(-1),
    co: new Array(8).fill(0),
    ep: new Array(12).fill(-1),
    eo: new Array(12).fill(0),
  };

  F_CORNER_SLOTS.forEach((slot, i) => {
    state.cp[slot] = corners[i].piece;
    state.co[slot] = corners[i].ori;
  });
  F_EDGE_SLOTS.forEach((slot, i) => {
    state.ep[slot] = edges[i].piece;
    state.eo[slot] = edges[i].ori;
  });

  // Fill the back with whatever is left. These slots have no F sticker, so
  // they are free variables for the parity repair below.
  const backCornerSlots = [...Array(8).keys()].filter((s) => !F_CORNER_SLOTS.includes(s));
  const backEdgeSlots = [...Array(12).keys()].filter((s) => !F_EDGE_SLOTS.includes(s));
  const freeCorners = [...Array(8).keys()].filter((p) => !state.cp.includes(p));
  const freeEdges = [...Array(12).keys()].filter((p) => !state.ep.includes(p));

  // `variant` shuffles the hidden back pieces without touching the F face.
  //
  // Without it this function is deterministic, so a cube whose tile is
  // identical in two mosaics gets the identical state and an empty move
  // sequence — two thirds of the grid would sit frozen through every
  // transition. Giving each mosaic its own back-fill forces every cube to
  // genuinely turn, even when it ends up showing the same picture.
  backCornerSlots.forEach((slot, i) => {
    state.cp[slot] = freeCorners[(i + variant) % freeCorners.length];
    state.co[slot] = (i + variant) % 3;
  });
  backEdgeSlots.forEach((slot, i) => {
    state.ep[slot] = freeEdges[(i + variant) % freeEdges.length];
    state.eo[slot] = (i + variant) % 2;
  });

  // --- Parity repair, using only back slots so the F face is untouched. ---

  // 1. Permutation parity of corners must equal that of edges. Swapping two
  //    back corners flips corner parity without changing any orientation.
  if (permutationParity(state.cp) !== permutationParity(state.ep)) {
    const [a, b] = backCornerSlots;
    [state.cp[a], state.cp[b]] = [state.cp[b], state.cp[a]];
  }

  // 2 & 3. Orientation sums must vanish. These are additive corrections, not
  //    assignments — the variant above has already put twists on those slots.
  const twist = state.co.reduce((a, b) => a + b, 0) % 3;
  if (twist !== 0) {
    const s = backCornerSlots[0];
    state.co[s] = (state.co[s] + (3 - twist)) % 3;
  }

  const flip = state.eo.reduce((a, b) => a + b, 0) % 2;
  if (flip !== 0) {
    const s = backEdgeSlots[0];
    state.eo[s] ^= 1;
  }

  return state;
}

/** The three invariants that separate legal cube states from impossible ones. */
export function legalityErrors(s: CubeJson): string[] {
  const errors: string[] = [];
  if (s.co.reduce((a, b) => a + b, 0) % 3 !== 0) errors.push('corner twist sum != 0 mod 3');
  if (s.eo.reduce((a, b) => a + b, 0) % 2 !== 0) errors.push('edge flip sum != 0 mod 2');
  if (permutationParity(s.cp) !== permutationParity(s.ep)) errors.push('corner/edge permutation parity mismatch');
  if (new Set(s.cp).size !== 8) errors.push('corner permutation is not a bijection');
  if (new Set(s.ep).size !== 12) errors.push('edge permutation is not a bijection');
  return errors;
}

/** The 9 F-face letters a state actually renders, row-major. */
export function frontFace(s: CubeJson): string {
  return render(s).slice(F_START, F_START + 9);
}
