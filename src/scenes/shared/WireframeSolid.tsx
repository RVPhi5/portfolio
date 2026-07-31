import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BoxGeometry,
  DodecahedronGeometry,
  EdgesGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
} from 'three';
import type { BufferGeometry, LineSegments } from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** Site accent (--color-accent); Three can't read CSS variables. */
const ACCENT = '#8B7FF0';

/** Ceiling on opacity — these sit behind text and must stay background texture. */
const MAX_OPACITY = 0.4;

export type SolidKind =
  | 'tetrahedron'
  | 'hexahedron'
  | 'octahedron'
  | 'dodecahedron'
  | 'icosahedron';

/**
 * `radius` is the circumscribed-sphere radius for every solid, so the five read
 * at a consistent size. Three's BoxGeometry takes a side length instead, hence
 * the conversion: a cube of side s has circumradius s·√3/2.
 */
function buildSolid(kind: SolidKind, radius: number): BufferGeometry {
  switch (kind) {
    case 'tetrahedron':
      return new TetrahedronGeometry(radius);
    case 'hexahedron': {
      const side = (2 * radius) / Math.sqrt(3);
      return new BoxGeometry(side, side, side);
    }
    case 'octahedron':
      return new OctahedronGeometry(radius);
    case 'dodecahedron':
      return new DodecahedronGeometry(radius);
    case 'icosahedron':
      return new IcosahedronGeometry(radius);
  }
}

type WireframeSolidProps = {
  opacity: number;
  kind: SolidKind;
  /** Circumscribed-sphere radius. */
  radius: number;
  /** Radians per second about x, y, z. */
  spin: [number, number, number];
  /** Resting orientation — also the pose held under reduced motion. */
  rest: [number, number, number];
};

/**
 * A platonic solid drawn as a true wireframe.
 *
 * Deliberately NOT `<meshBasicMaterial wireframe />`: that draws the
 * triangulated mesh, so every square and pentagon face would be crossed by the
 * diagonal seams Three uses to tessellate it. EdgesGeometry keeps only edges
 * where adjacent faces actually meet at an angle, dropping the coplanar seams —
 * so a dodecahedron renders as 30 pentagon edges rather than 108 triangle ones.
 */
export function WireframeSolid({ opacity, kind, radius, spin, rest }: WireframeSolidProps) {
  const ref = useRef<LineSegments>(null);
  const reducedMotion = useReducedMotion();

  // Keyed on primitives only, so this runs once per solid rather than on every
  // re-render — and re-renders happen every frame while a crossfade is running.
  const geometry = useMemo(() => {
    const base = buildSolid(kind, radius);
    const edges = new EdgesGeometry(base);
    // The source polyhedron is never rendered; it existed only to extract edges.
    base.dispose();
    return edges;
  }, [kind, radius]);

  // Built imperatively, so R3F's auto-dispose doesn't cover it (see types.ts).
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Applied imperatively once instead of via a `rotation` prop: R3F would
  // re-apply that prop on re-render, snapping the solid back to its rest pose
  // every frame of a crossfade.
  const restRef = useRef(rest);
  restRef.current = rest;
  useEffect(() => {
    ref.current?.rotation.set(...restRef.current);
  }, []);

  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.x += spin[0] * delta;
    ref.current.rotation.y += spin[1] * delta;
    ref.current.rotation.z += spin[2] * delta;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial
        color={ACCENT}
        transparent
        opacity={opacity * MAX_OPACITY}
        depthWrite={false}
      />
    </lineSegments>
  );
}
