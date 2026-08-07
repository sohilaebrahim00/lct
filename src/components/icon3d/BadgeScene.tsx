import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { iconPaths } from "./paths";
import type { Icon3DName } from "./registry";

/**
 * Convert a 24x24 SVG path into an extruded 3D geometry, centered and scaled
 * to sit on the front face of a unit-radius medallion. Bevels give a machined
 * metal edge that catches highlights from the studio rig.
 */
function buildSymbolGeometry(d: string): THREE.BufferGeometry {
  const loader = new SVGLoader();
  const data = loader.parse(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}"/></svg>`,
  );
  const shapes: THREE.Shape[] = [];
  for (const p of data.paths) {
    for (const s of SVGLoader.createShapes(p)) shapes.push(s);
  }
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 3,
    bevelEnabled: true,
    bevelThickness: 0.55,
    bevelSize: 0.42,
    bevelSegments: 4,
    curveSegments: 14,
  });
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const cx = (bb.max.x + bb.min.x) / 2;
  const cy = (bb.max.y + bb.min.y) / 2;
  const w = bb.max.x - bb.min.x;
  const h = bb.max.y - bb.min.y;
  const scale = 1.15 / Math.max(w, h);
  geo.translate(-cx, -cy, 0);
  // SVG Y grows downward — flip Y so symbols read upright
  geo.scale(scale, -scale, scale * 0.6);
  geo.computeVertexNormals();
  return geo;
}

// Shared cached geometry per icon so the whole grid re-uses one BufferGeometry
const geometryCache = new Map<Icon3DName, THREE.BufferGeometry>();
function getGeometry(name: Icon3DName): THREE.BufferGeometry {
  let g = geometryCache.get(name);
  if (!g) {
    g = buildSymbolGeometry(iconPaths[name] ?? iconPaths.star);
    geometryCache.set(name, g);
  }
  return g;
}

export function BadgeScene({ name }: { name: Icon3DName }) {
  const group = useRef<THREE.Group>(null!);
  const geometry = useMemo(() => getGeometry(name), [name]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Idle: subtle floating rotation ±2.5° + tiny breathing translate
    group.current.rotation.y = Math.sin(t * 0.7) * 0.045;
    group.current.rotation.x = Math.sin(t * 0.55 + 1) * 0.022;
    group.current.position.y = Math.sin(t * 0.9) * 0.015;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3.4]} fov={26} />

      {/* Studio rig: warm key, cool fill, gold rim */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.8, 3.2, 4.5]} intensity={2.4} color="#fff2c8" />
      <directionalLight position={[-3.2, -1, 2]} intensity={0.75} color="#c8dcff" />
      <directionalLight position={[-1.5, 3, -3]} intensity={1.7} color="#f5b64a" />

      <group ref={group}>
        {/* Medallion base — dark bronze cylinder, front face toward camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.18, 96]} />
          <meshStandardMaterial
            color="#100905"
            metalness={0.95}
            roughness={0.42}
            envMapIntensity={1.1}
          />
        </mesh>

        {/* Beveled outer bezel — champagne gold */}
        <mesh position={[0, 0, 0.09]}>
          <torusGeometry args={[0.94, 0.055, 28, 128]} />
          <meshPhysicalMaterial
            color="#e6b661"
            metalness={1}
            roughness={0.18}
            envMapIntensity={1.6}
            clearcoat={0.4}
            clearcoatRoughness={0.25}
          />
        </mesh>

        {/* Recessed inner well ring — bronze shadow catcher */}
        <mesh position={[0, 0, 0.091]}>
          <ringGeometry args={[0.78, 0.86, 96]} />
          <meshStandardMaterial
            color="#3a2510"
            metalness={0.9}
            roughness={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Extruded gold symbol — raised, machined-metal */}
        <mesh position={[0, 0, 0.09]} geometry={geometry}>
          <meshPhysicalMaterial
            color="#f0c667"
            metalness={1}
            roughness={0.22}
            envMapIntensity={2}
            clearcoat={0.4}
            clearcoatRoughness={0.3}
          />
        </mesh>
      </group>
    </>
  );
}
