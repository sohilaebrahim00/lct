import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGSAP } from "@gsap/react";
import { invalidate, useThree } from "@react-three/fiber";
import { ensureGsap } from "@/lib/motion";
import { GoldPin } from "@/lib/three/GoldPin";
import { GoldVehicle } from "@/lib/three/GoldVehicle";
import { DrawnLine, type DrawnLineHandle } from "@/lib/three/DrawnLine";
import { GOLD_MID, GOLD_GLINT } from "@/lib/three/materials";

const ORIGIN: [number, number, number] = [-1.7, 0, 0];
const DEST: [number, number, number] = [1.7, 0, 0];

export interface LoaderSceneProps {
  /** Called once the whole pin → route → vehicle → arrival sequence finishes. */
  onDone: () => void;
}

/**
 * The loader's 3D route sequence — origin pin appears, gold route draws,
 * a small vehicle travels it with natural rotation, the destination pin
 * activates on arrival, and the camera performs a subtle push-in. Fully
 * self-contained (own `useGSAP` timeline, calls `onDone` on completion) so
 * `BrandLoader` doesn't need to reach across the Suspense boundary to
 * choreograph it — see that file's own doc comment for why.
 */
export function LoaderScene({ onDone }: LoaderSceneProps) {
  const { camera } = useThree();
  const originRef = useRef<THREE.Group>(null);
  const destRef = useRef<THREE.Group>(null);
  const vehicleRef = useRef<THREE.Group>(null);
  const destGlowRef = useRef<THREE.Mesh>(null);
  const lineHandle = useRef<DrawnLineHandle | null>(null);

  const curve = useMemo(() => {
    const start = new THREE.Vector3(...ORIGIN);
    const end = new THREE.Vector3(...DEST);
    const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.55, 0));
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, []);

  useGSAP(() => {
    const { gsap } = ensureGsap();
    const origin = originRef.current;
    const dest = destRef.current;
    const vehicle = vehicleRef.current;
    const destGlow = destGlowRef.current;
    // Refs should always be populated by the time useGSAP runs (post-mount),
    // but if they somehow aren't, call onDone immediately rather than
    // silently doing nothing — the caller's whole loader must never hang
    // waiting on this scene.
    if (!origin || !dest || !vehicle || !destGlow) {
      onDone();
      return;
    }

    origin.scale.setScalar(0.001);
    dest.scale.setScalar(0.4);
    vehicle.visible = false;
    gsap.set(destGlow.scale, { x: 0.01, y: 0.01, z: 0.01 });
    gsap.set(destGlow.material as THREE.Material, { opacity: 0 });
    camera.position.set(0, 1.3, 3.4);
    camera.lookAt(0, 0, 0);

    // timeScale compresses this to match the loader's overall ~2.5-3s
    // budget (see brand-loader.tsx) — same relative choreography, played
    // back faster rather than hand-retiming every offset.
    const tl = gsap.timeline({ timeScale: 2.0, onComplete: onDone });

    // Origin pin appears
    tl.to(origin.scale, { x: 1, y: 1, z: 1, duration: 0.45, ease: "back.out(2.6)", onUpdate: () => invalidate() }, 0);

    // Route draws
    const routeProxy = { p: 0 };
    tl.to(
      routeProxy,
      {
        p: 1,
        duration: 0.85,
        ease: "power2.inOut",
        onUpdate: () => {
          lineHandle.current?.setProgress(routeProxy.p);
          invalidate();
        },
      },
      0.35,
    );

    // Vehicle travels the route, oriented to the curve's tangent
    tl.set(vehicle, { visible: true }, 1.05)
      .to(
        { t: 0 },
        {
          t: 1,
          duration: 1.0,
          ease: "power1.inOut",
          onUpdate: function () {
            const t = (this.targets()[0] as { t: number }).t;
            const point = curve.getPoint(t);
            const tangent = curve.getTangent(t);
            vehicle.position.copy(point);
            vehicle.position.y += 0.04;
            vehicle.rotation.y = Math.atan2(tangent.z, tangent.x) * -1;
            invalidate();
          },
        },
        1.05,
      );

    // Destination pin activates + camera push-in on arrival
    tl.to(dest.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.3, ease: "power2.out", onUpdate: () => invalidate() }, 2.05)
      .to(dest.scale, { x: 1, y: 1, z: 1, duration: 0.25, ease: "power2.inOut", onUpdate: () => invalidate() }, 2.35)
      .to(
        destGlow.scale,
        { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out", onUpdate: () => invalidate() },
        2.05,
      )
      .to(
        destGlow.material as THREE.Material,
        { opacity: 0.8, duration: 0.3, onUpdate: () => invalidate() },
        2.05,
      )
      .to(
        destGlow.material as THREE.Material,
        { opacity: 0.25, duration: 0.5, onUpdate: () => invalidate() },
        2.4,
      )
      .to(
        camera.position,
        {
          z: 2.7,
          y: 1.05,
          duration: 0.7,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.lookAt(0, 0, 0);
            invalidate();
          },
        },
        2.05,
      );
  }, []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[1.5, 2.5, 2]} intensity={1.05} color={GOLD_MID} />
      <directionalLight position={[-2, 1, 1.5]} intensity={0.4} color="#ffffff" />

      {/* Dark map surface */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 2.4]} />
        <meshStandardMaterial color="#0a0908" roughness={0.95} metalness={0.05} />
      </mesh>

      <DrawnLine
        ref={(el) => {
          lineHandle.current = el;
        }}
        curve={curve}
        lineWidth={2}
      />

      <group ref={originRef} position={ORIGIN}>
        <GoldPin scale={0.3} />
      </group>

      <group ref={destRef} position={DEST}>
        <GoldPin scale={0.3} />
        <mesh ref={destGlowRef} position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color={GOLD_GLINT} transparent opacity={0} />
        </mesh>
      </group>

      <group ref={vehicleRef}>
        <GoldVehicle scale={0.85} />
      </group>
    </>
  );
}
