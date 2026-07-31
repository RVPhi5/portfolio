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
    // Pulled back from 5 so the cube's full diagonal clears the canvas edges:
    // the stage is only half the viewport wide on lg+, and at 5 the cube was
    // being clipped on all sides.
    cameraPosition: [0, 0, 9],
  },
  // Real scenes get appended here later — adding one is a one-line edit + one new file.
];
