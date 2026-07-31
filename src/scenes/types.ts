import type { ComponentType } from 'react';

/**
 * Rules for scene authors
 * -----------------------
 * 1. A scene renders ONLY R3F primitives (meshes, lights, groups). It must not
 *    render a `<Canvas>` of its own — SceneStage owns the single canvas.
 * 2. A scene must animate via `useFrame`, never its own `requestAnimationFrame`.
 *    R3F owns the loop, and SceneStage pauses that loop when the tab is hidden;
 *    a private rAF would keep burning CPU behind the user's back.
 * 3. A scene must not assume it is the only thing mounted. During a crossfade
 *    two scenes are live at once, so avoid mutating shared state (the camera,
 *    `scene.background`, renderer settings) — the rotator owns those.
 * 4. Prefer declarative elements (`<boxGeometry />`, `<meshStandardMaterial />`)
 *    so R3F auto-disposes them on unmount. Anything constructed imperatively
 *    (`new THREE.BufferGeometry()`, `new THREE.Material()`) must be disposed in
 *    a `useEffect` cleanup, or it leaks every rotation cycle.
 * 5. A scene should read `useReducedMotion()` and render a resting pose — no
 *    per-frame motion — when it returns true.
 */

export type SceneProps = {
  /** 0→1 fade-in progress the rotator drives during transitions; scenes may use it or ignore it */
  opacity: number;
};

export type Scene = {
  /** stable key, e.g. "placeholder" — must be unique within the registry */
  id: string;
  /** human name, for debugging / optional caption */
  label: string;
  component: ComponentType<SceneProps>;
  /** optional per-scene camera hint; rotator applies a sensible default if omitted */
  cameraPosition?: [number, number, number];
};
