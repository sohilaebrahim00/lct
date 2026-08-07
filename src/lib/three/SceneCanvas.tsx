import type { ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { dprRange } from "./capability";

/**
 * Shared `<Canvas>` defaults for every scene — only ever imported from
 * inside a page's own lazily-loaded canvas module (see `Scene3D`'s doc),
 * never from a route file directly, so three/@react-three/fiber only ever
 * enters a route's bundle behind that dynamic import. DPR is capped at
 * 1.25 on normal devices, 1.5 only on devices that clear a higher
 * capability bar (`isHighCapabilityDevice`) — not device-native DPR.
 */
export function SceneCanvas({
  children,
  camera,
  frameloop = "demand",
}: {
  children: ReactNode;
  camera?: CanvasProps["camera"];
  frameloop?: CanvasProps["frameloop"];
}) {
  return (
    <Canvas
      frameloop={frameloop}
      dpr={dprRange()}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={camera}
    >
      {children}
    </Canvas>
  );
}
