import Cube, { type CubeJson } from 'cubejs';
import {
  CENTRE_INDICES,
  applyPerm,
  rotationBetweenCentres,
  type RotationElement,
} from './moves';
import { FACES } from './palette';

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

/**
 * The move sequence taking one colour state to another, with no requirement
 * that they show the same centres.
 *
 * Kociemba only searches the face-turn group, where centres are the coordinate
 * frame and therefore immovable. So the centre change is factored out first:
 * rotate `from` until its centres agree with `to`'s — a rotation the cube can
 * actually perform, since it expands into slice turns — and hand Kociemba the
 * remainder, which is now an ordinary same-centre solve.
 *
 * The relabelling into cubejs's face alphabet is keyed off the shared centres,
 * so it renames colours without moving anything: face letters still denote the
 * same physical layers, and the returned algorithm applies as-is.
 */
export function algBetweenColorStates(
  group: RotationElement[],
  from: string,
  to: string,
): string {
  const rotation = rotationBetweenCentres(group, from, to);
  const rotated = applyPerm(from, rotation.perm);

  const colorToLetter = new Map<string, string>();
  CENTRE_INDICES.forEach((idx, face) => colorToLetter.set(rotated[idx], FACES[face]));

  const relabel = (s: string) => {
    let out = '';
    for (const ch of s) {
      const letter = colorToLetter.get(ch);
      if (letter === undefined) throw new Error(`colour ${ch} has no centre to name it`);
      out += letter;
    }
    return out;
  };

  const solved = algBetween(
    Cube.fromString(relabel(rotated)).toJSON(),
    Cube.fromString(relabel(to)).toJSON(),
  );

  return [rotation.alg, solved].filter(Boolean).join(' ');
}

export const moveCount = (alg: string): number => (alg.trim() === '' ? 0 : alg.trim().split(/\s+/).length);
