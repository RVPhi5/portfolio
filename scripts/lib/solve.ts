import Cube, { type CubeJson } from 'cubejs';

let solverReady = false;

/** Builds Kociemba's move and pruning tables. Takes a few seconds, once. */
export function initSolver(): void {
  if (solverReady) return;
  Cube.initSolver();
  solverReady = true;
}

/**
 * Inverse of a cube state. cubejs has no instance-level invert, so do it on the
 * permutation directly: the piece in slot i moves to slot cp[i], so the inverse
 * sends cp[i] back to i, and a corner twisted by t untwists by (3 - t) mod 3.
 * Edge flips are self-inverse mod 2.
 */
export function invertState(s: CubeJson): CubeJson {
  const cp = new Array<number>(8);
  const co = new Array<number>(8);
  const ep = new Array<number>(12);
  const eo = new Array<number>(12);

  for (let i = 0; i < 8; i++) {
    cp[s.cp[i]] = i;
    co[s.cp[i]] = (3 - s.co[i]) % 3;
  }
  for (let i = 0; i < 12; i++) {
    ep[s.ep[i]] = i;
    eo[s.ep[i]] = s.eo[i];
  }
  return { center: [...s.center], cp, co, ep, eo };
}

/**
 * The move sequence taking state `from` to state `to`.
 *
 * cubejs multiplies as a right action (`A.multiply(B)` == do A, then B), so the
 * algorithm we want is the state Z = from⁻¹ · to. `solve(Z)` returns the
 * sequence that takes Z *to* solved, i.e. Z⁻¹ — so the answer is its inverse.
 *
 * Composing this way keeps sequences inside Kociemba's ~22 move bound. The
 * naive alternative, solve(from) followed by the reverse of solve(to), is up to
 * twice as long and visibly drags.
 */
export function algBetween(from: CubeJson, to: CubeJson): string {
  const z = new Cube(invertState(from)).multiply(new Cube(to));
  if (z.isSolved()) return '';

  const alg = Cube.inverse(z.solve());

  // Replaying is cheap next to solving, so verify every sequence rather than
  // trusting the algebra. A silent convention error here would produce a
  // mosaic that dissolves into noise instead of resolving into the next image.
  const replay = new Cube(from);
  replay.move(alg);
  if (replay.asString() !== new Cube(to).asString()) {
    throw new Error(`sequence "${alg}" does not carry from -> to`);
  }
  return alg;
}

export const moveCount = (alg: string): number => (alg.trim() === '' ? 0 : alg.trim().split(/\s+/).length);
