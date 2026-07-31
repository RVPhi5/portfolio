import { Suspense, lazy } from 'react';
import { SceneBoundary } from './SceneBoundary';

/**
 * Three.js is heavy, so the whole scene system is code-split behind React.lazy.
 * The site renders fully without it and the background fades in once the chunk
 * lands — Three never blocks first paint.
 */
const SceneStage = lazy(() => import('./SceneStage'));

/**
 * The single mount point for the animated background. Drop `<BackgroundScenes />`
 * at the app root, behind the `z-10` content wrapper, and nothing else needs to
 * know this system exists.
 */
export default function BackgroundScenes() {
  return (
    // The boundary sits outside Suspense on purpose: that is the only position
    // that catches a chunk that fails to load (offline, cache miss, bundle
    // removed) as well as errors thrown while rendering the scene itself.
    <SceneBoundary>
      <Suspense fallback={null}>
        <SceneStage />
      </Suspense>
    </SceneBoundary>
  );
}
