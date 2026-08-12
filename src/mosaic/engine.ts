import { COLOR_LETTERS, FRONT_OFFSET, STAGGER, STAGGER_MS, TRANSITION_MS } from './config';
import type { Step } from './render';

export type MosaicData = {
  gridCols: number;
  gridRows: number;
  movePerms: Record<string, number[]>;
  /** `states` is the full 54 facelets; the visible front is 18..26 of it. */
  mosaics: { id: string; states: string[] }[];
  transitions: { from: string; to: string; sequences: string[] }[];
};

const LETTER_INDEX: Record<string, number> = Object.fromEntries(
  COLOR_LETTERS.map((l, i) => [l, i]),
);

const toIndices = (s: string): Uint8Array => {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = LETTER_INDEX[s[i]];
  return out;
};

const frontOf = (state: Uint8Array): Uint8Array => state.slice(FRONT_OFFSET, FRONT_OFFSET + 9);

/** One cube's plan for the current transition. */
type CubePlan = {
  /** Visible steps only; B turns are folded away since they never show. */
  steps: Step[];
  /** Fraction of the window before this cube starts, for STAGGER. */
  startFrac: number;
  /** Fraction of the window this cube's motion occupies. */
  spanFrac: number;
  /** Face to show once the plan completes. */
  finalFace: Uint8Array;
};

/**
 * Owns which mosaic is showing, each cube's state, and the transition plan.
 *
 * The heavy work — solving — already happened at build time. This only applies
 * precomputed permutations and interpolates, so a transition costs one array
 * walk per cube per frame.
 */
export class MosaicEngine {
  readonly cols: number;
  readonly rows: number;
  readonly cellCount: number;

  private data: MosaicData;
  private perms: Record<string, number[]>;
  private mosaicIndex = 0;
  private plans: CubePlan[] = [];
  private faces: Uint8Array[];
  private transitionStart: number | null = null;

  constructor(data: MosaicData, startIndex = 0) {
    this.data = data;
    this.perms = data.movePerms;
    this.cols = data.gridCols;
    this.rows = data.gridRows;
    this.cellCount = this.cols * this.rows;
    this.mosaicIndex = startIndex % data.mosaics.length;
    this.faces = data.mosaics[this.mosaicIndex].states.map((s) => frontOf(toIndices(s)));
  }

  get currentId(): string {
    return this.data.mosaics[this.mosaicIndex].id;
  }

  get isTransitioning(): boolean {
    return this.transitionStart !== null;
  }

  /** Only meaningful when not transitioning. */
  faceAt(cell: number): Uint8Array {
    return this.faces[cell];
  }

  private applyToken(state: Uint8Array, token: string): Uint8Array {
    const perm = this.perms[token[0]];
    const turns = token.endsWith('2') ? 2 : token.endsWith("'") ? 3 : 1;
    let cur = state;
    for (let t = 0; t < turns; t++) {
      const next = new Uint8Array(54);
      for (let j = 0; j < 54; j++) next[j] = cur[perm[j]];
      cur = next;
    }
    return cur;
  }

  /**
   * Expand each cube's move sequence into the frames the renderer needs.
   *
   * B and S turns are dropped here rather than animated with zero duration:
   * neither touches a front facelet, so giving them a slot would show a visible
   * pause. Their state change still happens, because the next step's `from` is
   * taken after they were applied.
   */
  beginTransition(now: number): void {
    const t = this.data.transitions[this.mosaicIndex];
    const nextIndex = (this.mosaicIndex + 1) % this.data.mosaics.length;
    const fromStates = this.data.mosaics[this.mosaicIndex].states;
    const targetFaces = this.data.mosaics[nextIndex].states.map((s) => frontOf(toIndices(s)));

    this.plans = new Array(this.cellCount);

    for (let cell = 0; cell < this.cellCount; cell++) {
      let state = toIndices(fromStates[cell]);
      const steps: Step[] = [];

      for (const token of t.sequences[cell].split(/\s+/).filter(Boolean)) {
        const before = state;
        state = this.applyToken(state, token);
        const face = token[0];
        if (face === 'B' || face === 'S') continue; // no front facelet moves
        steps.push({
          from: frontOf(before),
          to: frontOf(state),
          face: face as Step['face'],
          turns: token.endsWith('2') ? 2 : token.endsWith("'") ? -1 : 1,
        });
      }

      // Deterministic per-cell offset — no RNG, so a resize or remount can't
      // reshuffle the churn mid-transition.
      const jitter = STAGGER ? ((cell * 2654435761) % 1000) / 1000 : 0;
      const startFrac = STAGGER ? (jitter * STAGGER_MS) / TRANSITION_MS : 0;

      this.plans[cell] = {
        steps,
        startFrac,
        spanFrac: 1 - startFrac,
        finalFace: targetFaces[cell],
      };
    }

    this.transitionStart = now;
  }

  /**
   * Advance to `now`. Returns the step and progress each cube should draw, or
   * null for a cube that is resting.
   */
  sample(now: number, cell: number): { step: Step; progress: number } | null {
    if (this.transitionStart === null) return null;
    const plan = this.plans[cell];
    if (!plan || plan.steps.length === 0) return null;

    const elapsed = (now - this.transitionStart) / TRANSITION_MS;
    const local = (elapsed - plan.startFrac) / plan.spanFrac;
    if (local <= 0) return { step: plan.steps[0], progress: 0 };
    if (local >= 1) return null;

    const exact = local * plan.steps.length;
    const index = Math.min(plan.steps.length - 1, Math.floor(exact));
    return { step: plan.steps[index], progress: exact - index };
  }

  /**
   * Slide the transition clock forward by `delta` ms. Used when the tab was
   * hidden mid-transition: without it the cubes would jump to wherever the
   * wall clock had reached while nothing was rendering.
   */
  adjustStart(delta: number): void {
    if (this.transitionStart !== null) this.transitionStart += delta;
  }

  /** True once every cube has landed; snaps state to the new mosaic. */
  settleIfDone(now: number): boolean {
    if (this.transitionStart === null) return false;
    if (now - this.transitionStart < TRANSITION_MS) return false;

    this.mosaicIndex = (this.mosaicIndex + 1) % this.data.mosaics.length;
    this.faces = this.data.mosaics[this.mosaicIndex].states.map((s) => frontOf(toIndices(s)));
    this.plans = [];
    this.transitionStart = null;
    return true;
  }
}
