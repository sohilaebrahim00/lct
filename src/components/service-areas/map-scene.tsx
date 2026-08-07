import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGSAP } from "@gsap/react";
import { invalidate } from "@react-three/fiber";
import { ensureGsap } from "@/lib/motion";
import { GoldPin } from "@/lib/three/GoldPin";
import { DrawnLine, type DrawnLineHandle } from "@/lib/three/DrawnLine";
import { GOLD_MID } from "@/lib/three/materials";

// Same verified locations/routes as the 2D fallback diagram (`service-areas.tsx`)
// — kept here as the single source for the 3D scene's layout. Positions are
// still stylized, not surveyed, matching the existing "not a literal map" note.
export const AREAS = [
  { name: "Dallas", x: 320, y: 90 },
  { name: "Fort Worth", x: 60, y: 130 },
  { name: "DFW Airport", x: 190, y: 60 },
  { name: "Grapevine", x: 210, y: 30 },
] as const;

export const ROUTES: [number, number][] = [
  [1, 2],
  [2, 3],
  [2, 0],
  [3, 0],
];

const PLANE_W = 4.2;
const PLANE_D = 2.1;

function toScene(x: number, y: number): [number, number, number] {
  return [(x / 380 - 0.5) * PLANE_W, 0, (y / 170 - 0.5) * PLANE_D];
}

export interface ServiceAreasMapSceneProps {
  onHoverArea?: (index: number | null) => void;
}

/**
 * Restrained 3D route visualization — a simplified dark map plane, the same
 * gold pin used on Contact/Loader for every verified location, animated
 * gold routes between them, and a hover highlight (raycast via R3F's
 * built-in pointer events) that also reports up to the page so the
 * always-visible DOM location list can cross-highlight. No unsupported
 * cities, no literal GIS map/imagery.
 */
export function ServiceAreasMapScene({ onHoverArea }: ServiceAreasMapSceneProps) {
  const pinRefs = useRef<(THREE.Group | null)[]>([]);
  const lineHandles = useRef<(DrawnLineHandle | null)[]>([]);

  const curves = useMemo(
    () =>
      ROUTES.map(([a, b]) => {
        const start = new THREE.Vector3(...toScene(AREAS[a].x, AREAS[a].y));
        const end = new THREE.Vector3(...toScene(AREAS[b].x, AREAS[b].y));
        const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.18, 0));
        return new THREE.QuadraticBezierCurve3(start, mid, end);
      }),
    [],
  );

  useGSAP(() => {
    const { gsap } = ensureGsap();
    const tl = gsap.timeline({ delay: 0.2 });

    pinRefs.current.forEach((pin) => {
      if (!pin) return;
      pin.scale.setScalar(0.001);
    });

    lineHandles.current.forEach((handle, i) => {
      if (!handle) return;
      const proxy = { p: 0 };
      tl.to(
        proxy,
        {
          p: 1,
          duration: 0.8,
          ease: "power2.inOut",
          onUpdate: () => {
            handle.setProgress(proxy.p);
            invalidate();
          },
        },
        i * 0.18,
      );
    });

    pinRefs.current.forEach((pin, i) => {
      if (!pin) return;
      tl.to(
        pin.scale,
        { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(2.6)", onUpdate: () => invalidate() },
        i * 0.18 + 0.15,
      );
    });
  }, []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[1.5, 3, 2]} intensity={1} color={GOLD_MID} />
      <directionalLight position={[-2, 1, -1]} intensity={0.35} color="#ffffff" />

      {/* Simplified dark map surface — no imagery, no GIS/tiles. */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[PLANE_W, PLANE_D]} />
        <meshStandardMaterial color="#0d0c0a" roughness={0.95} metalness={0.05} />
      </mesh>

      {curves.map((curve, i) => (
        <DrawnLine
          key={i}
          ref={(el) => {
            lineHandles.current[i] = el;
          }}
          curve={curve}
          lineWidth={1.75}
        />
      ))}

      {AREAS.map((area, i) => (
        <group
          key={area.name}
          ref={(el) => (pinRefs.current[i] = el)}
          position={toScene(area.x, area.y)}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHoverArea?.(i);
            document.body.style.cursor = "default";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHoverArea?.(null);
          }}
        >
          <GoldPin scale={0.22} detail={false} />
        </group>
      ))}
    </>
  );
}
