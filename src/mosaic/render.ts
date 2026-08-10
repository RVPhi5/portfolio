import { PALETTE_HEX } from './config';

/**
 * One visible move: the front face before it, the front face after it, and
 * which layer turned. Nine colour indices each, read row-major.
 */
export type Step = {
  from: Uint8Array; // 9
  to: Uint8Array; // 9
  /**
   * Base letter of a turn that shows on the front face: the four side layers,
   * the two slices through the front, or F itself. B and S never reach here —
   * neither touches a front facelet.
   */
  face: 'U' | 'D' | 'L' | 'R' | 'F' | 'M' | 'E';
  /** Signed quarter turns: 1, -1 or 2. */
  turns: number;
};

/**
 * Per-colour queue of axis-aligned rects, flushed once per frame.
 *
 * Two costs are being traded off. Assigning `ctx.fillStyle` re-parses a CSS
 * colour string, and the grid draws ~50,000 stickers a frame, so painting each
 * one immediately means ~50,000 parses. But `fillRect` is a renderer fast path
 * that skips path building and tessellation entirely, so batching into a
 * `Path2D` and filling once — which does cut the state changes to six — lands
 * well behind where it started.
 *
 * Queuing coordinates and replaying them as `fillRect` gets both: six
 * `fillStyle` assignments per frame, every sticker still on the fast path.
 */
export class RectBatch {
  /** Packed x, y, w, h per rect, one buffer per palette colour. */
  private buffers: Float32Array[];
  private counts: Int32Array;

  constructor(initialRects = 1024) {
    this.buffers = PALETTE_HEX.map(() => new Float32Array(initialRects * 4));
    this.counts = new Int32Array(PALETTE_HEX.length);
  }

  add(color: number, x: number, y: number, w: number, h: number) {
    let buf = this.buffers[color];
    const n = this.counts[color];
    if ((n + 1) * 4 > buf.length) {
      // Double and copy. Amortises to nothing after the first few frames,
      // because the instance is reused for the life of the canvas.
      const grown = new Float32Array(buf.length * 2);
      grown.set(buf);
      this.buffers[color] = grown;
      buf = grown;
    }
    const i = n * 4;
    buf[i] = x;
    buf[i + 1] = y;
    buf[i + 2] = w;
    buf[i + 3] = h;
    this.counts[color] = n + 1;
  }

  flush(ctx: CanvasRenderingContext2D) {
    for (let c = 0; c < this.buffers.length; c++) {
      const n = this.counts[c];
      if (n === 0) continue;
      ctx.fillStyle = PALETTE_HEX[c];
      const buf = this.buffers[c];
      for (let i = 0; i < n * 4; i += 4) {
        ctx.fillRect(buf[i], buf[i + 1], buf[i + 2], buf[i + 3]);
      }
    }
    this.counts.fill(0);
  }
}

/** Which of the 9 front stickers a given layer turn disturbs. */
function affects(face: Step['face'], index: number): boolean {
  switch (face) {
    case 'U':
      return index < 3; // top row
    case 'D':
      return index > 5; // bottom row
    case 'E':
      return index > 2 && index < 6; // middle row — the slice between U and D
    case 'L':
      return index % 3 === 0; // left column
    case 'R':
      return index % 3 === 2; // right column
    case 'M':
      return index % 3 === 1; // middle column — the slice between L and R
    case 'F':
      return true; // the whole face turns as a unit
  }
}

/** Draw a still cube face — the common case, since most frames are static. */
export function drawFace(
  batch: RectBatch,
  x: number,
  y: number,
  size: number,
  face: Uint8Array,
  gap: number,
) {
  const s = (size - 2 * gap) / 3;
  const pitch = s + gap;
  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = (i / 3) | 0;
    batch.add(face[i], x + col * pitch, y + row * pitch, s, s);
  }
}

/**
 * Draw a cube mid-move.
 *
 * F turns rotate all nine stickers as a rigid unit, which in 2D is exactly what
 * a real F turn looks like head-on — so the `from` face rotated by the turn
 * angle *is* the `to` face at completion, with no swap needed.
 *
 * U/D/L/R turn a layer that is edge-on to the viewer. There is nothing truthful
 * to draw in 2D, so the affected row or column is squashed to zero thickness
 * and back, exchanging colours at the midpoint while it is invisible. It reads
 * as a turn without pretending to be 3D.
 */
export function drawStep(
  ctx: CanvasRenderingContext2D,
  batch: RectBatch,
  x: number,
  y: number,
  size: number,
  step: Step,
  progress: number,
  gap: number,
) {
  const s = (size - 2 * gap) / 3;
  const pitch = s + gap;

  if (step.face === 'F') {
    // Rotated stickers are not axis-aligned, so they cannot be queued. They go
    // straight out under a context rotation — one save/restore per cube, and F
    // is one of five visible faces, so this stays a minority of the frame.
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate((Math.PI / 2) * step.turns * progress);
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = (i / 3) | 0;
      ctx.fillStyle = PALETTE_HEX[step.from[i]];
      ctx.fillRect(-size / 2 + col * pitch, -size / 2 + row * pitch, s, s);
    }
    ctx.restore();
    return;
  }

  // |cos| runs 1 -> 0 -> 1, so the layer collapses and reopens once per turn.
  const squash = Math.abs(Math.cos(progress * Math.PI * (step.turns === 2 ? 2 : 1)));
  const swapped = progress >= 0.5;
  const shown = swapped ? step.to : step.from;
  // U, D and the E slice all turn about the vertical axis, so their layer is a
  // row and squashes in height; L, R and M squash in width.
  const horizontal = step.face === 'U' || step.face === 'D' || step.face === 'E';

  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = (i / 3) | 0;
    const sx = x + col * pitch;
    const sy = y + row * pitch;

    if (!affects(step.face, i)) {
      batch.add(step.from[i], sx, sy, s, s);
      continue;
    }

    // Squash about the sticker's own centre line.
    if (horizontal) {
      const h = s * squash;
      batch.add(shown[i], sx, sy + (s - h) / 2, s, h);
    } else {
      const w = s * squash;
      batch.add(shown[i], sx + (s - w) / 2, sy, w, s);
    }
  }
}
