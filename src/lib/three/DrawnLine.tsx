import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import type * as THREE from "three";
import { GOLD_MID } from "./materials";

export interface DrawnLineHandle {
  setProgress: (p: number) => void;
}

export interface DrawnLineProps {
  curve: THREE.Curve<THREE.Vector3>;
  color?: string;
  segments?: number;
  lineWidth?: number;
}

/**
 * A gold route line that draws itself from 0 → 1 progress, imperatively
 * controlled via a ref (`setProgress`) — the GSAP timeline that owns the
 * scene calls this on every tick, the same relationship the DOM-side
 * `drawLine()` helper (`src/lib/reveal.ts`, DrawSVGPlugin) has with its
 * ScrollTrigger. Kept as bounded, local R3F state (not a fully imperative
 * geometry mutation) deliberately — the reveal plays once, briefly, per
 * scene entrance, so the small re-render cost of updating `points` is a
 * reasonable trade for getting a properly *thick*, anti-aliased line via
 * drei's `Line` (a plain `THREE.Line`/`LineBasicMaterial` is capped at a
 * ~1px hairline on most platforms and would read as weak, not premium).
 */
export const DrawnLine = forwardRef<DrawnLineHandle, DrawnLineProps>(function DrawnLine(
  { curve, color = GOLD_MID, segments = 48, lineWidth = 2 },
  ref,
) {
  const [progress, setProgress] = useState(0);
  useImperativeHandle(ref, () => ({ setProgress }), []);

  const points = useMemo(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    const count = Math.max(2, Math.round(segments * clamped));
    return curve.getPoints(count);
  }, [curve, progress, segments]);

  if (points.length < 2) return null;
  return <Line points={points} color={color} lineWidth={lineWidth} toneMapped={false} />;
});
