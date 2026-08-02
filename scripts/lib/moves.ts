import Cube from 'cubejs';

export const BASE_MOVES = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
export type BaseMove = (typeof BASE_MOVES)[number];

/**
 * Facelet permutation for each clockwise quarter turn: perm[j] = the index a
 * sticker must be read FROM to land at j.
 *
 * Recovered by probing rather than hardcoded. A solved cube can't reveal this
 * (its facelets aren't distinguishable within a face), so instead we intersect
 * the candidate sources across many random scrambles: any j/i pair that
 * disagrees on even one probe is eliminated, and the true permutation is the
 * only survivor. Cheap, and it can't be transposed by a typo.
 */
export function deriveFaceletPerms(probeCount = 400): Record<BaseMove, number[]> {
  const result = {} as Record<BaseMove, number[]>;

  for (const move of BASE_MOVES) {
    // Start with every source index possible for every destination.
    const candidates: Set<number>[] = Array.from({ length: 54 }, () => new Set(Array.from({ length: 54 }, (_, i) => i)));

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
        throw new Error(
          `move ${move}: destination ${j} has ${candidates[j].size} candidate sources; ` +
            `increase probeCount`,
        );
      }
      perm[j] = [...candidates[j]][0];
    }
    result[move] = perm;
  }

  return result;
}

/** Apply a derived permutation once. */
export function applyPerm(facelets: string, perm: number[]): string {
  let out = '';
  for (let j = 0; j < 54; j++) out += facelets[perm[j]];
  return out;
}

/**
 * Independent check that the derived tables reproduce cubejs exactly, including
 * the ' and 2 variants the runtime will replay.
 */
export function verifyPerms(perms: Record<BaseMove, number[]>, trials = 10000): void {
  for (let n = 0; n < trials; n++) {
    const cube = Cube.random();
    const move = BASE_MOVES[n % BASE_MOVES.length];
    const suffix = ['', "'", '2'][n % 3];
    const alg = move + suffix;

    const before = cube.asString();
    cube.move(alg);
    const expected = cube.asString();

    const turns = suffix === '' ? 1 : suffix === '2' ? 2 : 3;
    let actual = before;
    for (let t = 0; t < turns; t++) actual = applyPerm(actual, perms[move]);

    if (actual !== expected) {
      throw new Error(`derived permutation for ${alg} disagrees with cubejs`);
    }
  }
}
