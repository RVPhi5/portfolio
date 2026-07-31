import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { scenes } from './sceneRegistry';
import { useReducedMotion } from './hooks/useReducedMotion';

/** How long a scene holds before the next one starts fading in. */
export const ROTATE_INTERVAL_MS = 15000;

/** Crossfade duration. Both scenes are mounted for this window. */
export const FADE_MS = 1200;

/** Applied when a scene omits its own `cameraPosition` hint. */
const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0, 5];

/**
 * Exponential-smoothing rate for camera moves between scenes with different
 * hints. Tuned so the move lands within roughly the crossfade window.
 */
const CAMERA_SMOOTHING = 3;

/**
 * Frame deltas are clamped before driving any timer. A backgrounded tab that
 * resumes, or a long GC pause, can hand back a multi-second delta — unclamped,
 * that would skip a whole scene or snap a crossfade to done in one frame.
 */
const MAX_DELTA_S = 0.1;

type Transition = {
  /** index into `scenes` of the scene fading in (or fully shown) */
  current: number;
  /** index of the scene fading out, or null when no transition is in flight */
  previous: number | null;
  /** 0→1 fade progress of `current`; `previous` uses 1 - progress */
  progress: number;
};

/**
 * Owns which scene is showing and the crossfade between scenes.
 *
 * All timing is driven off `useFrame` deltas rather than `setInterval`, so it
 * inherits the stage's frameloop gating for free: when SceneStage pauses the
 * loop (hidden tab), the rotation clock stops with it instead of silently
 * advancing through scenes nobody is watching.
 */
export function SceneRotator() {
  const reducedMotion = useReducedMotion();
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  // Don't cycle through a single-entry registry — it would crossfade a scene
  // with itself.
  const canCycle = scenes.length > 1 && !reducedMotion;

  const [transition, setTransition] = useState<Transition>(() => ({
    // "Both" cycle mode: random start, then advance on a timer.
    current: Math.floor(Math.random() * scenes.length),
    previous: null,
    // Reduced motion gets no fade-in — the first scene is simply present.
    progress: reducedMotion ? 1 : 0,
  }));

  // Frame-local clocks. Kept in refs so ticking them costs no re-render; React
  // state is only touched when a fade is actually in flight.
  const fade = useRef(transition.progress);
  const hold = useRef(0);

  const cameraTarget = useMemo(() => new Vector3(...DEFAULT_CAMERA_POSITION), []);
  const cameraSnapped = useRef(false);

  // Point the camera at the incoming scene's hint. First move snaps (nothing to
  // ease from on mount); reduced motion always snaps.
  useEffect(() => {
    const hint = scenes[transition.current]?.cameraPosition ?? DEFAULT_CAMERA_POSITION;
    cameraTarget.set(...hint);

    if (!cameraSnapped.current || reducedMotion) {
      cameraSnapped.current = true;
      camera.position.copy(cameraTarget);
      camera.lookAt(0, 0, 0);
      // In 'demand' frameloop (reduced motion) nothing else would draw this.
      invalidate();
    }
  }, [transition.current, reducedMotion, camera, cameraTarget, invalidate]);

  // If the preference flips on mid-session, drop any in-flight fade rather than
  // leaving a half-faded pair of scenes frozen on screen.
  useEffect(() => {
    if (!reducedMotion) return;
    fade.current = 1;
    hold.current = 0;
    setTransition((t) => (t.previous === null && t.progress === 1 ? t : { ...t, previous: null, progress: 1 }));
  }, [reducedMotion]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA_S);

    // Ease the camera toward the active scene's hint. Frame-rate independent:
    // the exponential form gives the same trajectory at 60Hz and 144Hz.
    if (!reducedMotion && !camera.position.equals(cameraTarget)) {
      camera.position.lerp(cameraTarget, 1 - Math.exp(-CAMERA_SMOOTHING * delta));
      camera.lookAt(0, 0, 0);
    }

    if (reducedMotion) return;

    if (fade.current < 1) {
      // A crossfade (or the initial fade-in) is running.
      fade.current = Math.min(1, fade.current + (delta * 1000) / FADE_MS);
      const done = fade.current === 1;
      setTransition((t) => ({
        ...t,
        // Unmount the outgoing scene the moment it hits zero opacity, so it
        // stops consuming useFrame ticks and its resources get released.
        previous: done ? null : t.previous,
        progress: fade.current,
      }));
      return;
    }

    if (!canCycle) return;

    hold.current += delta * 1000;
    if (hold.current < ROTATE_INTERVAL_MS) return;

    hold.current = 0;
    fade.current = 0;
    setTransition((t) => ({
      current: (t.current + 1) % scenes.length,
      previous: t.current,
      progress: 0,
    }));
  });

  const active = scenes[transition.current];
  if (!active) return null;

  const outgoing = transition.previous === null ? null : scenes[transition.previous];

  // Rendered as a keyed *list*, not as two positional children. When a scene
  // moves from the incoming slot to the outgoing slot at the start of the next
  // transition, a keyed list lets React move the existing instance; positional
  // children would unmount and remount it, visibly resetting its animation
  // state at the exact moment it starts fading out.
  const layers = [
    ...(outgoing ? [{ scene: outgoing, opacity: 1 - transition.progress }] : []),
    { scene: active, opacity: transition.progress },
  ];

  return (
    <>
      {layers.map(({ scene, opacity }) => {
        const Component = scene.component;
        return <Component key={scene.id} opacity={opacity} />;
      })}
    </>
  );
}
