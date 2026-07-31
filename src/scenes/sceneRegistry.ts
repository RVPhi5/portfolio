import type { Scene } from './types';
import { PlaceholderScene } from './scenes/PlaceholderScene';

/**
 * Single source of truth for the rotation. Adding a themed scene is exactly two
 * edits: one new file in `scenes/`, one entry here. Nothing else changes.
 */
export const scenes: Scene[] = [
  {
    id: 'placeholder',
    label: 'Placeholder cube',
    component: PlaceholderScene,
    cameraPosition: [0, 0, 5],
  },
  // Real scenes get appended here later — adding one is a one-line edit + one new file.
];
