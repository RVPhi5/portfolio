import { PALETTE_HEX, STICKER_GAP } from './config';

/**
 * One visible move: the front face before it, the front face after it, and
 * which layer turned. Nine colour indices each, read row-major.
 */
export type Step = {
  from: Uint8Array; // 9
  to: Uint8Array; // 9
  /** Base face letter: U, D, L, R or F. B never reaches here — it is invisible. */
  face: 'U' | 'D' | 'L' | 'R' | 'F';
  /** Signed quarter turns: 1, -1 or 2. */
  turns: number;
};

/** Which of the 9 front stickers a given layer turn disturbs. */
function affects(face: Step['face'], index: number): boolean {
  switch (face) {
    case 'U':
      return index < 3; // top row
    case 'D':
      return index > 5; // bottom row
    case 'L':
      return index % 3 === 0; // left column
    case 'R':
      return index % 3 === 2; // right column
    case 'F':
      return true; // the whole face turns as a unit
  }
}

function sticker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: number,
) {
  ctx.fillStyle = PALETTE_HEX[color];
  ctx.fillRect(x, y, size, size);
}

/** Draw a still cube face — the common case, since most frames are static. */
export function drawFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  face: Uint8Array,
) {
  const s = (size - 2 * STICKER_GAP) / 3;
  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = (i / 3) | 0;
    sticker(ctx, x + col * (s + STICKER_GAP), y + row * (s + STICKER_GAP), s, face[i]);
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
  x: number,
  y: number,
  size: number,
  step: Step,
  progress: number,
) {
  const s = (size - 2 * STICKER_GAP) / 3;
  const pitch = s + STICKER_GAP;

  if (step.face === 'F') {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate((Math.PI / 2) * step.turns * progress);
    drawFace(ctx, -size / 2, -size / 2, size, step.from);
    ctx.restore();
    return;
  }

  // |cos| runs 1 -> 0 -> 1, so the layer collapses and reopens once per turn.
  const squash = Math.abs(Math.cos(progress * Math.PI * (step.turns === 2 ? 2 : 1)));
  const swapped = progress >= 0.5;
  const shown = swapped ? step.to : step.from;
  const horizontal = step.face === 'U' || step.face === 'D';

  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = (i / 3) | 0;
    const sx = x + col * pitch;
    const sy = y + row * pitch;

    if (!affects(step.face, i)) {
      sticker(ctx, sx, sy, s, step.from[i]);
      continue;
    }

    // Squash about the sticker's own centre line. Drawing the rect directly at
    // the reduced size is cheaper than a save/rotate/restore per sticker, and
    // there are ~3,000 of these per frame.
    if (horizontal) {
      const h = s * squash;
      ctx.fillStyle = PALETTE_HEX[shown[i]];
      ctx.fillRect(sx, sy + (s - h) / 2, s, h);
    } else {
      const w = s * squash;
      ctx.fillStyle = PALETTE_HEX[shown[i]];
      ctx.fillRect(sx + (s - w) / 2, sy, w, s);
    }
  }
}
