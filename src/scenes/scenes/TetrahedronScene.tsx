import type { SceneProps } from '../types';
import { WireframeSolid } from '../shared/WireframeSolid';

/** 4 faces. Runs a larger radius — the sparse silhouette reads small otherwise. */
export function TetrahedronScene({ opacity }: SceneProps) {
  return (
    <WireframeSolid
      opacity={opacity}
      kind="tetrahedron"
      radius={2.0}
      spin={[0.13, 0.19, 0]}
      rest={[0.45, 0.6, 0]}
    />
  );
}
