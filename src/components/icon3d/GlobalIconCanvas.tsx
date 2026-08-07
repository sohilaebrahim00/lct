import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { View, Environment } from "@react-three/drei";

/**
 * A single WebGL context for the entire app. Every <Icon3D> renders its scene
 * into a <View /> that is portalled here — one Canvas, N tracked viewports,
 * smooth 60fps even with dozens of badges on screen.
 *
 * The canvas is a fixed, transparent, non-interactive overlay. <View> reads
 * the DOM rect of each Icon3D wrapper and renders in that region.
 */
export function GlobalIconCanvas() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Canvas
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 40,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      <Suspense fallback={null}>
        {/* Studio HDRI drives PBR reflections across every badge */}
        <Environment preset="studio" environmentIntensity={0.9} />
        <View.Port />
      </Suspense>
    </Canvas>
  );
}
