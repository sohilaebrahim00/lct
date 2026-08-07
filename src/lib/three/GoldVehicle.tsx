import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { GOLD_PHYSICAL_PROPS, GOLD_GLINT, ONYX_CORE } from "./materials";

let wheelGeometry: THREE.CylinderGeometry | null = null;
function getWheelGeometry() {
  if (wheelGeometry) return wheelGeometry;
  wheelGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
  return wheelGeometry;
}

let wheelMaterial: THREE.MeshStandardMaterial | null = null;
function getWheelMaterial() {
  if (wheelMaterial) return wheelMaterial;
  wheelMaterial = new THREE.MeshStandardMaterial({ color: ONYX_CORE, metalness: 0.3, roughness: 0.6 });
  return wheelMaterial;
}

/**
 * A small, abstract "premium sedan" silhouette — a rounded body + cabin +
 * four wheels + a headlight glint, all primitives (no imported model file).
 * Used by the loader's traveling-vehicle beat. Low-poly and deliberately
 * abstract rather than a literal car model, per the brief's "no cartoon
 * appearance" / restraint requirements.
 */
export function GoldVehicle({ scale = 1 }: { scale?: number }) {
  const wheelGeo = useMemo(() => getWheelGeometry(), []);
  const wheelMat = useMemo(() => getWheelMaterial(), []);

  return (
    <group scale={scale}>
      {/* Lower body */}
      <RoundedBox args={[0.62, 0.16, 0.28]} radius={0.05} smoothness={4} position={[0, 0.12, 0]}>
        <meshPhysicalMaterial {...GOLD_PHYSICAL_PROPS} />
      </RoundedBox>
      {/* Cabin */}
      <RoundedBox args={[0.32, 0.14, 0.24]} radius={0.05} smoothness={4} position={[-0.03, 0.24, 0]}>
        <meshPhysicalMaterial {...GOLD_PHYSICAL_PROPS} />
      </RoundedBox>
      {/* Wheels */}
      {[
        [0.19, 0.03, 0.15],
        [0.19, 0.03, -0.15],
        [-0.19, 0.03, 0.15],
        [-0.19, 0.03, -0.15],
      ].map((p, i) => (
        <mesh key={i} geometry={wheelGeo} material={wheelMat} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]} />
      ))}
      {/* Headlight glint */}
      <mesh position={[0.32, 0.13, 0.09]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={GOLD_GLINT} />
      </mesh>
      <mesh position={[0.32, 0.13, -0.09]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={GOLD_GLINT} />
      </mesh>
    </group>
  );
}
