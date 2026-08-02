import { Component, Suspense, lazy } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

/**
 * mosaics.json plus the playback engine are code-split, so neither the data nor
 * the canvas work blocks first paint. The site renders fully without it.
 */
const MosaicBackground = lazy(() => import('./MosaicBackground'));

/**
 * The background is decorative, so every failure collapses to "render nothing":
 * a chunk that fails to load, a missing 2D context, a throw during playback.
 * Kept free of any mosaic import so it sits above the lazy boundary — that is
 * the only position that also catches a chunk which never arrives.
 */
class MosaicBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.warn('[mosaic] background disabled after error:', error, info.componentStack);
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Single mount point for the mosaic background. */
export default function MosaicBackgroundRoot() {
  return (
    <MosaicBoundary>
      <Suspense fallback={null}>
        <MosaicBackground />
      </Suspense>
    </MosaicBoundary>
  );
}
