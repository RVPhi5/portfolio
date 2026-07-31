import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { SceneProps } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** Radians per second, per axis. Deliberately slow — this sits behind text. */
const SPIN_X = 0.12;
const SPIN_Y = 0.18;

/** Ceiling on material opacity, so the cube stays a background texture, not a subject. */
const MAX_OPACITY = 0.35;

/** Site accent (--color-accent), pulled in as a literal since Three can't read CSS vars. */
const ACCENT = '#8B7FF0';

/**
 * Pipeline proof: one slowly rotating wireframe cube.
 *
 * It exists to exercise the whole system — registry → rotator → crossfade →
 * frameloop gating → reduced motion — before any real art is built on top.
 * Geometry and material are declarative, so R3F disposes them on unmount.
 */
export function PlaceholderScene({ opacity }: SceneProps) {
  const mesh = useRef<Mesh>(null);
  const reducedMotion = useReducedMotion();

  useFrame((_, delta) => {
    if (reducedMotion || !mesh.current) return;
    mesh.current.rotation.x += SPIN_X * delta;
    mesh.current.rotation.y += SPIN_Y * delta;
  });

  return (
    // A fixed tilt so the resting (reduced-motion) pose reads as a cube in
    // three-quarter view rather than a flat, ambiguous square.
    <mesh ref={mesh} rotation={[0.4, 0.6, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color={ACCENT}
        wireframe
        transparent
        opacity={opacity * MAX_OPACITY}
        // Background geometry should never occlude or z-fight with a later scene
        // that crossfades over it.
        depthWrite={false}
      />
    </mesh>
  );
}
