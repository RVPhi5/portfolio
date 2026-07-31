import type { SceneProps } from '../types';
import { WireframeSolid } from '../shared/WireframeSolid';

/** 6 faces. Supersedes the old PlaceholderScene, now with true 12-edge wireframe. */
export function HexahedronScene({ opacity }: SceneProps) {
  return (
    <WireframeSolid
      opacity={opacity}
      kind="hexahedron"
      radius={1.8}
      spin={[0.12, 0.18, 0]}
      rest={[0.4, 0.6, 0]}
    />
  );
}
