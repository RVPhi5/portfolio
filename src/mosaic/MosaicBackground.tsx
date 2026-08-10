import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import {
  CUBE_GAP_RATIO,
  HOLD_MS,
  MAX_DPR,
  MIN_GAP,
  OPACITY,
  STICKER_GAP_RATIO,
} from './config';
import { MosaicEngine, type MosaicData } from './engine';
import { RectBatch, drawFace, drawStep } from './render';
import rawData from './data/mosaics.json';

const data = rawData as MosaicData;

/**
 * Full-bleed Rubik's-cube mosaic behind page content.
 *
 * All the expensive work happened at build time; this only replays precomputed
 * move sequences onto a 2D canvas. Visibility and the animation loop are both
 * handled inside one effect — routing them through React state instead would
 * tear down and restart the loop on every tab switch, losing the transition's
 * place.
 */
export function MosaicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      // No 2D context available: render nothing rather than throwing. The site
      // must work with the background entirely absent.
      setFailed(true);
      return;
    }

    const engine = new MosaicEngine(data, Math.floor(Math.random() * data.mosaics.length));

    // One instance for the life of the canvas: its buffers grow to the frame's
    // high-water mark and are then reused, so steady state allocates nothing.
    const batch = new RectBatch(engine.cellCount * 9);

    let cubeSize = 0;
    let cubeGap = 0;
    let stickerGap = 0;
    let originX = 0;
    let originY = 0;
    let raf = 0;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let hiddenAt: number | null = null;

    /**
     * Cube size is the only thing recomputed on resize — the 24x14 logical grid
     * is fixed, so the picture never reflows, only its framing. `max` (not
     * `min`) guarantees the grid covers the viewport and lets overflow crop.
     */
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;

      // Resetting the backing store clears context state, so reapply both.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = OPACITY;

      cubeSize = Math.max(vw / engine.cols, vh / engine.rows);
      cubeGap = Math.max(MIN_GAP, cubeSize * CUBE_GAP_RATIO);
      stickerGap = Math.max(MIN_GAP, cubeSize * STICKER_GAP_RATIO);
      originX = (vw - cubeSize * engine.cols) / 2;
      originY = (vh - cubeSize * engine.rows) / 2;
    };

    const draw = (now: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      ctx.clearRect(0, 0, vw, vh);

      const size = cubeSize - cubeGap;

      for (let cell = 0; cell < engine.cellCount; cell++) {
        const col = cell % engine.cols;
        const row = (cell / engine.cols) | 0;
        const x = originX + col * cubeSize;
        const y = originY + row * cubeSize;

        // Cubes cropped off the edge cost nothing.
        if (x + cubeSize < 0 || y + cubeSize < 0 || x > vw || y > vh) continue;

        const active = engine.sample(now, cell);
        if (active) drawStep(ctx, batch, x, y, size, active.step, active.progress, stickerGap);
        else drawFace(batch, x, y, size, engine.faceAt(cell), stickerGap);
      }

      batch.flush(ctx);
    };

    const tick = (now: number) => {
      draw(now);
      if (engine.settleIfDone(now)) {
        draw(now); // land exactly on the target frame
        scheduleNext();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    function scheduleNext() {
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        engine.beginTransition(performance.now());
        raf = requestAnimationFrame(tick);
      }, HOLD_MS);
    }

    // Nothing changes between transitions, so there is no loop running then —
    // the canvas simply holds its last frame.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = performance.now();
        cancelAnimationFrame(raf);
        clearTimeout(holdTimer);
        return;
      }
      if (hiddenAt !== null) {
        // Credit back the hidden time so cubes resume where they stopped
        // instead of jumping to wherever the wall clock ran on to.
        engine.adjustStart(performance.now() - hiddenAt);
        hiddenAt = null;
      }
      if (engine.isTransitioning) raf = requestAnimationFrame(tick);
      else scheduleNext();
    };

    const onResize = () => {
      layout();
      if (!engine.isTransitioning) draw(performance.now());
    };

    layout();
    draw(performance.now());

    window.addEventListener('resize', onResize);
    if (!reducedMotion) {
      document.addEventListener('visibilitychange', onVisibility);
      scheduleNext();
    }

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
    };
  }, [reducedMotion]);

  if (failed) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default MosaicBackground;
