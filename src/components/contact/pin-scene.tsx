import { useRef } from "react";
import { useThree, invalidate } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import type { Group } from "three";
import { ensureGsap } from "@/lib/motion";
import { GoldPin } from "@/lib/three/GoldPin";
import { GOLD_SOFT, GOLD_DEEP, GOLD_GLINT } from "@/lib/three/materials";

/**
 * The Contact page's signature 3D pin — champagne-gold, onyx emblem, gentle
 * idle bob/rotation, and a light pointer-reactive tilt. Fully GSAP-driven
 * (idle loop + pointer tilt both use `gsap.quickTo`/timelines, cleaned up
 * via `useGSAP`'s automatic revert) rather than a raw `useFrame` loop, per
 * this project's convention that GSAP owns object movement.
 */
export function ContactPinScene() {
  const groupRef = useRef<Group>(null);
  const { gl } = useThree();

  useGSAP(() => {
    const group = groupRef.current;
    if (!group) return;
    const { gsap } = ensureGsap();

    // Entrance — small scale/rise, echoes the DOM pin's own back.out entrance.
    group.scale.setScalar(0.001);
    group.position.y = -0.3;
    gsap.to(group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.9,
      delay: 0.15,
      ease: "back.out(2.2)",
      onUpdate: () => invalidate(),
    });
    gsap.to(group.position, {
      y: 0,
      duration: 0.9,
      delay: 0.15,
      ease: "back.out(2.2)",
      onUpdate: () => invalidate(),
    });

    // Idle bob + sway — continuous but tiny, invalidates a demand-mode
    // render on every tick only while this scene is actually mounted.
    const idle = gsap.timeline({ repeat: -1, yoyo: true, delay: 1.2 });
    idle
      .to(group.position, { y: 0.08, duration: 2.6, ease: "sine.inOut", onUpdate: () => invalidate() }, 0)
      .to(group.rotation, { y: 0.18, duration: 3.1, ease: "sine.inOut", onUpdate: () => invalidate() }, 0);

    // Pointer tilt — quickTo, matching the sitewide cursor's own follow feel.
    const tiltX = gsap.quickTo(group.rotation, "x", { duration: 0.6, ease: "power3.out", onUpdate: () => invalidate() });
    const tiltZ = gsap.quickTo(group.rotation, "z", { duration: 0.6, ease: "power3.out", onUpdate: () => invalidate() });
    const onPointerMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      const withinX = e.clientX >= rect.left - 120 && e.clientX <= rect.right + 120;
      const withinY = e.clientY >= rect.top - 120 && e.clientY <= rect.bottom + 120;
      if (!withinX || !withinY) return;
      tiltZ(THREE_CLAMP(-nx * 0.12));
      tiltX(THREE_CLAMP(ny * 0.1));
    };
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <group position={[0, -0.65, 0]}>
      {/* Brighter front key light (near-white, so the gold reads bright,
          not muddy) + a dim GOLD_DEEP rim light from behind for "darker
          bronze sides" + a soft warm fill so the onyx core still separates
          clearly from the body. No bloom/glow layers — contrast comes from
          light placement and the brighter base material color alone. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[1.4, 2.6, 2.6]} intensity={1.9} color={GOLD_GLINT} />
      <directionalLight position={[-1.8, 0.3, 1.6]} intensity={0.6} color={GOLD_SOFT} />
      <directionalLight position={[0, 1.2, -2.2]} intensity={0.85} color={GOLD_DEEP} />
      <group ref={groupRef}>
        <GoldPin scale={1.15} />
      </group>
    </group>
  );
}

function THREE_CLAMP(v: number) {
  return Math.max(-0.16, Math.min(0.16, v));
}
