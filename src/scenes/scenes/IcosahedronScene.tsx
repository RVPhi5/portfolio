import type { SceneProps } from '../types';
import { WireframeSolid } from '../shared/WireframeSolid';

/** 20 faces. */
export function IcosahedronScene({ opacity }: SceneProps) {
  return (
    <WireframeSolid
      opacity={opacity}
      kind="icosahedron"
      radius={1.8}
      spin={[0.1, 0.15, 0]}
      rest={[0.35, 0.2, 0]}
    />
  );
}
