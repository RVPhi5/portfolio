import Cube from 'cubejs';
import {
  CORNER_FACELET,
  EDGE_FACELET,
  F_CORNER_SLOTS,
  F_EDGE_SLOTS,
  faceToState,
  frontFace,
  legalityErrors,
} from './lib/faceToState';
import { FACES } from './lib/palette';

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

// --- The derived tables should match the geometry of a cube ---
check('4 corner slots touch F', F_CORNER_SLOTS.length === 4, `slots ${F_CORNER_SLOTS.join(',')}`);
check('4 edge slots touch F', F_EDGE_SLOTS.length === 4, `slots ${F_EDGE_SLOTS.join(',')}`);
check(
  'each F slot maps to a distinct facelet',
  new Set([...CORNER_FACELET.values(), ...EDGE_FACELET.values()]).size === 8,
);

// --- My legality invariants must agree with cubejs's own notion of legal ---
{
  let bad = 0;
  for (let i = 0; i < 3000; i++) {
    const errs = legalityErrors(Cube.random().toJSON());
    if (errs.length) bad++;
  }
  check('invariants hold for 3000 cubejs random cubes', bad === 0, `${bad} rejected`);
}

// --- Deliberately illegal states must be caught (guards against a vacuous check) ---
{
  const twisted = new Cube().toJSON();
  twisted.co[0] = 1;
  check('single corner twist rejected', legalityErrors(twisted).length > 0);

  const flipped = new Cube().toJSON();
  flipped.eo[0] = 1;
  check('single edge flip rejected', legalityErrors(flipped).length > 0);

  const swapped = new Cube().toJSON();
  [swapped.cp[0], swapped.cp[1]] = [swapped.cp[1], swapped.cp[0]];
  check('single corner swap rejected', legalityErrors(swapped).length > 0);
}

// --- Fuzz: every random face pattern must be realisable, legal, and exact ---
{
  const rng = (n: number) => Math.floor(Math.random() * n);
  let mismatched = 0;
  let illegal = 0;
  const N = 20000;

  for (let i = 0; i < N; i++) {
    const want = Array.from({ length: 9 }, () => FACES[rng(6)] as string);
    want[4] = 'F'; // centre is immovable
    const state = faceToState(want, rng(8)); // fuzz back-fill variants too
    if (frontFace(state) !== want.join('')) mismatched++;
    if (legalityErrors(state).length) illegal++;
  }

  check(`${N} random face patterns render exactly`, mismatched === 0, `${mismatched} mismatched`);
  check(`${N} random face patterns are legal`, illegal === 0, `${illegal} illegal`);
}

// --- Extremes: uniform faces are the tightest case for the matching ---
{
  let bad = 0;
  for (const letter of FACES) {
    const want = new Array(9).fill(letter);
    want[4] = 'F';
    const state = faceToState(want);
    if (frontFace(state) !== want.join('') || legalityErrors(state).length) bad++;
  }
  check('uniform-colour faces realisable for all 6 letters', bad === 0, `${bad} failed`);
}

console.log(`\n${failures === 0 ? 'PHASE 2 OK' : `${failures} FAILURES`}`);
process.exit(failures === 0 ? 0 : 1);
