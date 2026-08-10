import Cube from 'cubejs';

/** Face turns: the six outer layers. Centres are fixed under these. */
export const FACE_MOVES = ['U', 'R', 'F', 'D', 'L', 'B'] as const;

/**
 * Slice turns: the three middle layers. These are what let a cube change which
 * centre it shows — M and E both contain the F centre, so either one carries it
 * away and brings another in. S is parallel to F and touches no front facelet,
 * so it is invisible head-on, but it still permutes the other four centres.
 */
export const SLICE_MOVES = ['M', 'E', 'S'] as const;

export const BASE_MOVES = [...FACE_MOVES, ...SLICE_MOVES] as const;
export type BaseMove = (typeof BASE_MOVES)[number];

/** Whole-cube rotations, named as cubers name them. */
export const ROTATIONS = ['x', 'y', 'z'] as const;
export type Rotation = (typeof ROTATIONS)[number];

// ------------------------------------------------------------- geometry ---

type Vec = [number, number, number];

/**
 * Where each facelet sits in space.
 *
 * Facelets are numbered URFDLB, nine per face, row-major in that face's own
 * reading frame. Giving every face its normal plus its row and column
 * directions turns that numbering into 3D coordinates, which is what makes
 * slices and rotations derivable rather than hand-written: a turn becomes
 * "rotate the layer at this coordinate", uniformly, for outer and middle
 * layers alike.
 */
const FACE_GEOMETRY: { normal: Vec; rowDir: Vec; colDir: Vec }[] = [
  { normal: [0, 1, 0], rowDir: [0, 0, 1], colDir: [1, 0, 0] }, // U: row 0 is the back row
  { normal: [1, 0, 0], rowDir: [0, -1, 0], colDir: [0, 0, -1] }, // R: col 0 is the front col
  { normal: [0, 0, 1], rowDir: [0, -1, 0], colDir: [1, 0, 0] }, // F
  { normal: [0, -1, 0], rowDir: [0, 0, -1], colDir: [1, 0, 0] }, // D: row 0 is the front row
  { normal: [-1, 0, 0], rowDir: [0, -1, 0], colDir: [0, 0, 1] }, // L: col 0 is the back col
  { normal: [0, 0, -1], rowDir: [0, -1, 0], colDir: [-1, 0, 0] }, // B: col 0 is the right col
];

type Facelet = { pos: Vec; normal: Vec };

const FACELETS: Facelet[] = (() => {
  const out: Facelet[] = [];
  for (const g of FACE_GEOMETRY) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const pos: Vec = [0, 0, 0];
        for (let a = 0; a < 3; a++) {
          pos[a] = g.normal[a] + g.rowDir[a] * (r - 1) + g.colDir[a] * (c - 1);
        }
        out.push({ pos, normal: [...g.normal] as Vec });
      }
    }
  }
  return out;
})();

/**
 * One quarter turn about an axis, in the direction that axis's positive face
 * turns: x follows R, y follows U, z follows F.
 */
function rotate(axis: number, [x, y, z]: Vec): Vec {
  if (axis === 0) return [x, z, -y];
  if (axis === 1) return [-z, y, x];
  return [y, -x, z];
}

function rotateN(axis: number, v: Vec, times: number): Vec {
  let out = v;
  for (let i = 0; i < times; i++) out = rotate(axis, out);
  return out;
}

const key = (p: Vec, n: Vec) => `${p[0]},${p[1]},${p[2]}|${n[0]},${n[1]},${n[2]}`;

const INDEX_BY_KEY = new Map<string, number>(
  FACELETS.map((f, i) => [key(f.pos, f.normal), i]),
);

/**
 * Build the facelet permutation for a turn.
 *
 * `layer` is the coordinate along `axis` that moves — +1 and -1 are the outer
 * faces, 0 is the slice, and `null` turns every layer at once, which is a
 * whole-cube rotation. `dir` is +1 for the axis's positive direction and -1 for
 * its inverse, which is how L, D, M and E differ from R, U and their slices.
 *
 * perm[j] = the index a sticker must be read FROM to land at j, matching the
 * convention the probe-derived tables already use.
 */
function permForTurn(axis: number, layer: number | null, dir: 1 | -1): number[] {
  const perm = new Array<number>(54);
  // A destination's source is found by rotating backwards.
  const back = dir === 1 ? 3 : 1;

  for (let j = 0; j < 54; j++) {
    const f = FACELETS[j];
    if (layer !== null && f.pos[axis] !== layer) {
      perm[j] = j; // outside the moving layer
      continue;
    }
    const srcPos = rotateN(axis, f.pos, back);
    const srcNormal = rotateN(axis, f.normal, back);
    const src = INDEX_BY_KEY.get(key(srcPos, srcNormal));
    if (src === undefined) throw new Error(`no facelet at ${key(srcPos, srcNormal)}`);
    perm[j] = src;
  }
  return perm;
}

/** axis, layer and direction for every turn we emit. */
const TURN_SPEC: Record<BaseMove, { axis: number; layer: number; dir: 1 | -1 }> = {
  U: { axis: 1, layer: 1, dir: 1 },
  D: { axis: 1, layer: -1, dir: -1 },
  E: { axis: 1, layer: 0, dir: -1 }, // follows D
  R: { axis: 0, layer: 1, dir: 1 },
  L: { axis: 0, layer: -1, dir: -1 },
  M: { axis: 0, layer: 0, dir: -1 }, // follows L
  F: { axis: 2, layer: 1, dir: 1 },
  B: { axis: 2, layer: -1, dir: -1 },
  S: { axis: 2, layer: 0, dir: 1 }, // follows F
};

const ROTATION_AXIS: Record<Rotation, number> = { x: 0, y: 1, z: 2 };

/**
 * A rotation turns all three layers at once, so it expands into the three
 * single-layer turns the renderer already knows how to draw. Nothing downstream
 * ever sees a token that is not one layer moving.
 *
 * Inverses and half turns are listed as generators in their own right: each
 * still costs three turns, so letting the search reach a rotation in one step
 * rather than three keeps the prefixes short.
 */
export const ROTATION_EXPANSION: Record<string, string> = {
  x: "R M' L'",
  "x'": "R' M L",
  x2: 'R2 M2 L2',
  y: "U E' D'",
  "y'": "U' E D",
  y2: 'U2 E2 D2',
  z: "F S B'",
  "z'": "F' S' B",
  z2: 'F2 S2 B2',
};

// ------------------------------------------------------- permutation API ---

export const IDENTITY: number[] = Array.from({ length: 54 }, (_, i) => i);

/** Apply a derived permutation once. */
export function applyPerm(facelets: string, perm: number[]): string {
  let out = '';
  for (let j = 0; j < 54; j++) out += facelets[perm[j]];
  return out;
}

/** Compose two permutations: apply `first`, then `second`. */
export function compose(first: number[], second: number[]): number[] {
  const out = new Array<number>(54);
  for (let j = 0; j < 54; j++) out[j] = first[second[j]];
  return out;
}

export function permForToken(perms: Record<BaseMove, number[]>, token: string): number[] {
  const base = token[0] as BaseMove;
  const turns = token.endsWith('2') ? 2 : token.endsWith("'") ? 3 : 1;
  let out = IDENTITY;
  for (let t = 0; t < turns; t++) out = compose(out, perms[base]);
  return out;
}

/** Composite permutation for a whole algorithm string. */
export function permForAlg(perms: Record<BaseMove, number[]>, alg: string): number[] {
  let out = IDENTITY;
  for (const token of alg.split(/\s+/).filter(Boolean)) {
    out = compose(out, permForToken(perms, token));
  }
  return out;
}

/**
 * Facelet permutations for all nine turns, derived from the coordinate model.
 *
 * The six face turns are cross-checked against `probeFacePerms` below, which
 * recovers them from cubejs without using any geometry at all. If the two agree
 * on the faces, the coordinate frame and every rotation direction in it are
 * correct — which is what makes the three slices, derived the same way but
 * unrepresentable in cubejs, trustworthy.
 */
export function deriveFaceletPerms(): Record<BaseMove, number[]> {
  const out = {} as Record<BaseMove, number[]>;
  for (const move of BASE_MOVES) {
    const spec = TURN_SPEC[move];
    out[move] = permForTurn(spec.axis, spec.layer, spec.dir);
  }
  return out;
}

export function deriveRotationPerms(): Record<Rotation, number[]> {
  const out = {} as Record<Rotation, number[]>;
  for (const r of ROTATIONS) out[r] = permForTurn(ROTATION_AXIS[r], null, 1);
  return out;
}

/**
 * Recover the six face permutations from cubejs alone, with no geometry.
 *
 * A solved cube can't reveal this (its facelets aren't distinguishable within a
 * face), so instead we intersect the candidate sources across many random
 * scrambles: any j/i pair that disagrees on even one probe is eliminated, and
 * the true permutation is the only survivor.
 */
export function probeFacePerms(probeCount = 400): Record<string, number[]> {
  const result: Record<string, number[]> = {};

  for (const move of FACE_MOVES) {
    const candidates: Set<number>[] = Array.from(
      { length: 54 },
      () => new Set(Array.from({ length: 54 }, (_, i) => i)),
    );

    for (let n = 0; n < probeCount; n++) {
      const cube = Cube.random();
      const before = cube.asString();
      cube.move(move);
      const after = cube.asString();

      for (let j = 0; j < 54; j++) {
        for (const i of [...candidates[j]]) {
          if (before[i] !== after[j]) candidates[j].delete(i);
        }
      }
    }

    const perm = new Array<number>(54);
    for (let j = 0; j < 54; j++) {
      if (candidates[j].size !== 1) {
        throw new Error(`move ${move}: destination ${j} has ${candidates[j].size} candidates`);
      }
      perm[j] = [...candidates[j]][0];
    }
    result[move] = perm;
  }

  return result;
}

// ---------------------------------------------------------- orientations ---

/** The centre facelet of each face, in URFDLB order. */
export const CENTRE_INDICES = [4, 13, 22, 31, 40, 49];

export type RotationElement = {
  /** Composite facelet permutation. */
  perm: number[];
  /** Renderable move sequence realising it — face and slice turns only. */
  alg: string;
};

/**
 * The 24 whole-cube rotations, each with a move sequence that realises it.
 *
 * Generated by breadth-first closure over x, y and z so the sequences are as
 * short as the generators allow, and so no rotation can be omitted or written
 * down wrong by hand.
 */
export function buildRotationGroup(): RotationElement[] {
  const perms = deriveFaceletPerms();
  // Each generator's permutation comes from replaying its own expansion, so the
  // table and the sequences it emits cannot drift apart.
  const generators = Object.entries(ROTATION_EXPANSION).map(([name, alg]) => ({
    name,
    alg,
    perm: permForAlg(perms, alg),
  }));

  const seen = new Map<string, RotationElement>();
  const start: RotationElement = { perm: IDENTITY, alg: '' };
  seen.set(IDENTITY.join(','), start);

  let frontier: RotationElement[] = [start];
  while (frontier.length) {
    const next: RotationElement[] = [];
    for (const el of frontier) {
      for (const g of generators) {
        const perm = compose(el.perm, g.perm);
        const k = perm.join(',');
        if (seen.has(k)) continue;
        const alg = (el.alg ? `${el.alg} ` : '') + g.alg;
        const made = { perm, alg };
        seen.set(k, made);
        next.push(made);
      }
    }
    frontier = next;
  }

  if (seen.size !== 24) {
    throw new Error(`rotation group has ${seen.size} elements, expected 24`);
  }
  return [...seen.values()];
}

/**
 * The rotation carrying `from`'s centres onto `to`'s.
 *
 * Exactly one of the 24 qualifies whenever both states use the same colour
 * scheme, which every state here does.
 */
export function rotationBetweenCentres(
  group: RotationElement[],
  from: string,
  to: string,
): RotationElement {
  for (const el of group) {
    const moved = applyPerm(from, el.perm);
    if (CENTRE_INDICES.every((i) => moved[i] === to[i])) return el;
  }
  throw new Error('no rotation maps these centres onto each other');
}

// ------------------------------------------------------------ validation ---

/**
 * Prove the derived tables before anything depends on them.
 *
 * Three independent checks: the geometric face turns must equal the ones probed
 * out of cubejs; replaying through the tables must match cubejs for every
 * face-turn variant; and each rotation must equal its own three-turn expansion,
 * which is the only thing tying the slice directions to the rotations.
 */
export function verifyPerms(perms: Record<BaseMove, number[]>, trials = 4000): void {
  const probed = probeFacePerms();
  for (const move of FACE_MOVES) {
    if (perms[move].join(',') !== probed[move].join(',')) {
      throw new Error(`geometric permutation for ${move} disagrees with cubejs probe`);
    }
  }

  for (let n = 0; n < trials; n++) {
    const cube = Cube.random();
    const move = FACE_MOVES[n % FACE_MOVES.length];
    const suffix = ['', "'", '2'][n % 3];
    const alg = move + suffix;

    const before = cube.asString();
    cube.move(alg);
    const expected = cube.asString();

    if (applyPerm(before, permForToken(perms, alg)) !== expected) {
      throw new Error(`derived permutation for ${alg} disagrees with cubejs`);
    }
  }

  const rots = deriveRotationPerms();
  for (const r of ROTATIONS) {
    const expanded = permForAlg(perms, ROTATION_EXPANSION[r]);
    if (expanded.join(',') !== rots[r].join(',')) {
      throw new Error(`rotation ${r} != its expansion "${ROTATION_EXPANSION[r]}"`);
    }
    let four = IDENTITY;
    for (let i = 0; i < 4; i++) four = compose(four, rots[r]);
    if (four.join(',') !== IDENTITY.join(',')) {
      throw new Error(`rotation ${r} is not order 4`);
    }
    // The inverse and half-turn generators must match powers of the base one.
    const inverse = permForAlg(perms, ROTATION_EXPANSION[`${r}'`]);
    const half = permForAlg(perms, ROTATION_EXPANSION[`${r}2`]);
    if (compose(rots[r], inverse).join(',') !== IDENTITY.join(',')) {
      throw new Error(`rotation ${r}' is not the inverse of ${r}`);
    }
    if (compose(rots[r], rots[r]).join(',') !== half.join(',')) {
      throw new Error(`rotation ${r}2 is not ${r} twice`);
    }
  }

  // A slice must leave both outer layers on its axis untouched.
  const untouched: Record<'M' | 'E' | 'S', number[]> = {
    M: [...range(9, 18), ...range(36, 45)], // R and L faces
    E: [...range(0, 9), ...range(27, 36)], // U and D faces
    S: [...range(18, 27), ...range(45, 54)], // F and B faces
  };
  for (const slice of SLICE_MOVES) {
    for (const j of untouched[slice]) {
      if (perms[slice][j] !== j) {
        throw new Error(`slice ${slice} disturbs facelet ${j}, which is on a fixed face`);
      }
    }
  }
}

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a }, (_, i) => a + i);
}
