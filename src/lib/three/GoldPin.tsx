import { useMemo } from "react";
import * as THREE from "three";
import { GOLD_PHYSICAL_PROPS, ONYX_STANDARD_PROPS, GOLD_GLINT } from "./materials";

/**
 * One procedural pin geometry shared by every scene that uses it (Contact,
 * Loader origin/destination pins, Service Areas markers) — a
 * `LatheGeometry` revolved from a 2D profile approximating the same
 * teardrop silhouette as the 2D cursor pin's SVG path, so the 3D object
 * reads as the same brand mark rather than a different shape. Built once,
 * as a module-level singleton: it's a few hundred vertices, effectively
 * free to keep for the app's lifetime, and recreating it per-instance would
 * be the actual waste — this is the "instancing for repeated markers" this
 * project's performance rules ask for.
 */
let pinGeometry: THREE.LatheGeometry | null = null;
function getPinGeometry() {
  if (pinGeometry) return pinGeometry;
  const points = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.05, 0.08),
    new THREE.Vector2(0.16, 0.26),
    new THREE.Vector2(0.3, 0.46),
    new THREE.Vector2(0.4, 0.66),
    new THREE.Vector2(0.42, 0.86),
    new THREE.Vector2(0.38, 1.0),
    new THREE.Vector2(0.25, 1.15),
    new THREE.Vector2(0.08, 1.25),
    new THREE.Vector2(0, 1.28),
  ];
  pinGeometry = new THREE.LatheGeometry(points, 32);
  pinGeometry.computeVertexNormals();
  return pinGeometry;
}

// MeshStandardMaterial, not MeshPhysicalMaterial — the latter's shader is
// meaningfully more expensive (it's a superset that supports clearcoat,
// sheen, transmission, iridescence, etc.) even with those features unused
// at their defaults. Standard's metalness/roughness model alone renders
// this pin correctly at a noticeably lower per-frame cost.
let pinMaterial: THREE.MeshStandardMaterial | null = null;
function getPinMaterial() {
  if (pinMaterial) return pinMaterial;
  pinMaterial = new THREE.MeshStandardMaterial(GOLD_PHYSICAL_PROPS);
  return pinMaterial;
}

let onyxMaterial: THREE.MeshStandardMaterial | null = null;
function getOnyxMaterial() {
  if (onyxMaterial) return onyxMaterial;
  onyxMaterial = new THREE.MeshStandardMaterial(ONYX_STANDARD_PROPS);
  return onyxMaterial;
}

export interface GoldPinProps {
  /** Uniform scale — the base geometry is ~1.3 units tall. */
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Hide the onyx emblem + glint (used for small/distant markers where they'd be imperceptible). */
  detail?: boolean;
}

export function GoldPin({ scale = 1, position, rotation, detail = true }: GoldPinProps) {
  const geometry = useMemo(() => getPinGeometry(), []);
  const material = useMemo(() => getPinMaterial(), []);
  const onyx = useMemo(() => getOnyxMaterial(), []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={material} />
      {detail && (
        <>
          <mesh position={[0, 0.86, 0.33]} material={onyx}>
            <sphereGeometry args={[0.15, 20, 20]} />
          </mesh>
          <mesh position={[-0.05, 0.93, 0.44]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={GOLD_GLINT} />
          </mesh>
        </>
      )}
    </group>
  );
}
