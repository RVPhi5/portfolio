import type { SceneProps } from '../types';
import { WireframeSolid } from '../shared/WireframeSolid';

/** 8 faces. */
export function OctahedronScene({ opacity }: SceneProps) {
  return (
    <WireframeSolid
      opacity={opacity}
      kind="octahedron"
      radius={1.95}
      spin={[0.16, 0.14, 0.05]}
      rest={[0.3, 0.35, 0]}
    />
  );
}
