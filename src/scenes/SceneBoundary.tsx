import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

/**
 * The background is decorative, so every failure mode collapses to "render
 * nothing": a missing or failed scenes chunk, a WebGL driver quirk, a throw
 * inside a scene. The site must never show an error UI for it.
 *
 * Deliberately free of any three.js import — it sits *above* the lazy boundary,
 * so pulling in the 3D stack here would undo the code split it is guarding.
 */
export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.warn('[scenes] background disabled after error:', error, info.componentStack);
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
