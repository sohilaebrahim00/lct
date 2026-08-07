import { Component, type ReactNode } from "react";

/**
 * Catches any error thrown by the lazily-loaded 3D loader scene (failed
 * chunk fetch, WebGL init failure inside the Canvas, etc.) so it can never
 * crash or hang the loader — `onError` is called immediately, letting
 * `BrandLoader` fall back to finishing the sequence right away instead of
 * waiting for the outer watchdog timeout.
 */
export class LoaderSceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
