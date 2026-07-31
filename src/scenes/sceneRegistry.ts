import type { Scene } from './types';
import { TetrahedronScene } from './scenes/TetrahedronScene';
import { HexahedronScene } from './scenes/HexahedronScene';
import { OctahedronScene } from './scenes/OctahedronScene';
import { DodecahedronScene } from './scenes/DodecahedronScene';
import { IcosahedronScene } from './scenes/IcosahedronScene';

/**
 * Single source of truth for the rotation. Adding a scene is exactly two edits:
 * one new file in `scenes/`, one entry here.
 *
 * The five platonic solids, ordered by face count. Every entry shares
 * `cameraPosition` so the solids don't jump in scale as they crossfade —
 * relative size is set per-solid via its circumradius instead.
 */
export const scenes: Scene[] = [
  {
    id: 'tetrahedron',
    label: 'Tetrahedron (4)',
    component: TetrahedronScene,
    cameraPosition: [0, 0, 9],
  },
  {
    id: 'hexahedron',
    label: 'Hexahedron (6)',
    component: HexahedronScene,
    cameraPosition: [0, 0, 9],
  },
  {
    id: 'octahedron',
    label: 'Octahedron (8)',
    component: OctahedronScene,
    cameraPosition: [0, 0, 9],
  },
  {
    id: 'dodecahedron',
    label: 'Dodecahedron (12)',
    component: DodecahedronScene,
    cameraPosition: [0, 0, 9],
  },
  {
    id: 'icosahedron',
    label: 'Icosahedron (20)',
    component: IcosahedronScene,
    cameraPosition: [0, 0, 9],
  },
];
