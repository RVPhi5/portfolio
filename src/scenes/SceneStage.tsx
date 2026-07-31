import { useCallback, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { SceneRotator } from './SceneRotator';
import { useReducedMotion } from './hooks/useReducedMotion';
import { usePageVisible } from './hooks/usePageVisible';

/** Starting camera. Per-scene `cameraPosition` hints ease away from here. */
const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0, 5];
const DEFAULT_FOV = 45;

/**
 * Probe for a usable WebGL context once, at module scope, using a throwaway
 * canvas. Cheaper and more honest than waiting for the real Canvas to throw:
 * some browsers (and headless/VM environments) expose the API but fail to
 * create a context.
 */
function detectWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    // Release the probe context immediately rather than holding one of the
    // browser's small per-page context budget.
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

let webGLSupported: boolean | null = null;
function hasWebGL(): boolean {
  if (webGLSupported === null) webGLSupported = detectWebGL();
  return webGLSupported;
}

/**
 * Hosts the single R3F canvas behind page content.
 *
 * Fixed, full-viewport, `pointer-events: none`, `z-0` — it must never affect
 * layout or intercept clicks. Page content sits above it in a `z-10` wrapper.
 */
export function SceneStage() {
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const [contextLost, setContextLost] = useState(false);
  const handleContextLost = useCallback(() => setContextLost(true), []);

  if (contextLost || !hasWebGL()) return null;

  // 'never'  — tab is hidden: stop rendering entirely, no CPU/GPU burn.
  // 'demand' — reduced motion: draw when React commits a change, then stop.
  //            (Spec says 'never' here; 'demand' is what actually delivers the
  //            "one static frame then stop" behaviour it asks for — under
  //            'never' the canvas would never paint at all and the background
  //            would be blank rather than static.)
  // 'always' — normal: R3F drives the loop.
  const frameloop = !pageVisible ? 'never' : reducedMotion ? 'demand' : 'always';

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        // Cap at 2: sharp on retina, without paying for 3x device ratios.
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: DEFAULT_FOV }}
        onCreated={({ gl }) => {
          // Fully transparent clear so the site's #0A0A0A body background
          // shows through instead of the renderer painting its own black.
          gl.setClearColor(0x000000, 0);
        }}
      >
        {/* Baseline lighting every scene can rely on. Scenes are free to add
            their own lights on top — these are additive, not exclusive. */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 5, 4]} intensity={2.5} />
        <SceneRotator />
        {/* A lost context (GPU reset, driver sleep) would otherwise leave a
            frozen frame on screen; drop the background instead. */}
        <ContextLossWatcher onLost={handleContextLost} />
      </Canvas>
    </div>
  );
}

/**
 * Inside the Canvas so it can reach the real DOM canvas element. Unmounts the
 * whole stage if the GPU drops the context, rather than leaving a stale frame.
 */
function ContextLossWatcher({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handle = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener('webglcontextlost', handle);
    return () => canvas.removeEventListener('webglcontextlost', handle);
  }, [gl, onLost]);

  return null;
}

export default SceneStage;
