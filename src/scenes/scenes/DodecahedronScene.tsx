import type { SceneProps } from '../types';
import { WireframeSolid } from '../shared/WireframeSolid';

/** 12 pentagonal faces — the densest wireframe, so it spins slowest. */
export function DodecahedronScene({ opacity }: SceneProps) {
  return (
    <WireframeSolid
      opacity={opacity}
      kind="dodecahedron"
      radius={1.75}
      spin={[0.09, 0.13, 0]}
      rest={[0.25, 0.5, 0]}
    />
  );
}
