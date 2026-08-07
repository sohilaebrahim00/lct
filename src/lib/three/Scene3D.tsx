import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { shouldUse3D, watchShouldUse3D } from "./capability";

export interface Scene3DProps {
  /** Static/SVG replacement shown on touch, coarse-pointer, reduced-motion, or no-WebGL. Always required. */
  fallback: ReactNode;
  /**
   * The lazily-imported Canvas content, e.g. `<Suspense fallback={...}><MyCanvas /></Suspense>`
   * where `MyCanvas` is `React.lazy(() => import("./my-canvas"))`. Deliberately NOT rendered
   * (and its module never fetched) until this wrapper has both decided 3D should run and
   * scrolled into view — this file itself imports nothing from three/@react-three/fiber, so
   * merely referencing `Scene3D` never pulls Three.js into a route's bundle.
   */
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** aria-hidden by default — every scene here is decorative; the equivalent content must already exist in the DOM. */
  ariaHidden?: boolean;
}

/**
 * Sitewide entry point for every decorative 3D scene. Enforces the
 * project's hard performance/accessibility rules in one place rather than
 * per-page:
 *  - never imports @react-three/fiber/three itself, so pages that only
 *    reference this gate (and lazily import their actual Canvas content,
 *    see `children` doc above) never fetch Three.js unless 3D actually runs
 *  - re-checks `shouldUse3D()` (desktop motion bar + real WebGL support) and
 *    swaps to `fallback` if it ever becomes false (resize to mobile width,
 *    reduced-motion toggled mid-session)
 *  - only renders `children` (which triggers the lazy Canvas import) once
 *    the wrapper has scrolled into view (IntersectionObserver) AND the tab
 *    is visible, and tears it down again the instant either stops being
 *    true — "pause rendering when scene is outside viewport" / "stop
 *    rendering when the tab is hidden" via full unmount, which also fully
 *    releases the GPU context rather than just flagging it paused
 */
export function Scene3D({ fallback, children, className, style, ariaHidden = true }: Scene3DProps) {
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => watchShouldUse3D(setEnabled), []);

  useEffect(() => {
    if (!enabled) return;
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled]);

  if (!enabled) return <div className={className} style={style}>{fallback}</div>;

  const shouldRender = inView && pageVisible;

  return (
    <div ref={hostRef} className={className} style={style} aria-hidden={ariaHidden}>
      {shouldRender ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
}
