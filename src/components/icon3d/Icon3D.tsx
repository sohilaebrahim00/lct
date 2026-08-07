import { useEffect, useRef, useState } from "react";
import type { Icon3DName } from "./registry";
import { IconGlyph } from "./glyphs";

export type Icon3DProps = {
  name: Icon3DName;
  size?: number;
  label?: string;
  className?: string;
  /** When false, render as a plain metallic glyph (used inline in colored buttons). */
  container?: boolean;
  /** Optional stagger delay for entry animation (ms). */
  delayMs?: number;
};

/**
 * Pseudo-3D luxury metal badge.
 *
 * Built from layered SVG + CSS 3D transforms (no WebGL, no ExtrudeGeometry):
 *  - Back face (extruded body) sits behind at translateZ(-7px)
 *  - Dark metallic disc with inset highlights
 *  - Conic-gradient beveled gold rim
 *  - Inner bronze ring + recessed well
 *  - Raised gold symbol at translateZ(+6px)
 *  - Ivory gloss + diagonal light sweep on entry / hover
 *
 * Idle: small yaw + float. Hover: badge lifts toward camera with brighter rim.
 * Respects prefers-reduced-motion.
 */
export function Icon3D({
  name,
  size = 64,
  label,
  className,
  container = true,
  delayMs = 0,
}: Icon3DProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    // Trigger the entry sweep once the badge scrolls into view
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Inline glyph — no medallion (used inside filled buttons/FABs)
  if (!container) {
    return (
      <div
        className={["relative inline-flex items-center justify-center", className]
          .filter(Boolean)
          .join(" ")}
        style={{ width: size, height: size }}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <div style={{ width: "72%", height: "72%" }}>
          <IconGlyph name={name} gradientId={`inline-${name}`} />
        </div>
      </div>
    );
  }

  const gradientId = `badge-${name}-${size}`;

  // Slight three-quarter perspective for icons that read better tilted
  const tilt = name === "plane";

  return (
    <div
      ref={wrap}
      className={["icon3d-badge", className].filter(Boolean).join(" ")}
      data-in={inView ? "true" : "false"}
      data-tilt={tilt ? "true" : "false"}
      style={{
        width: size,
        height: size,
        animationDelay: delayMs ? `${delayMs}ms` : undefined,
      }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Soft contact shadow */}
      <span className="icon3d-badge__shadow" aria-hidden />

      {/* 3D stage — preserve-3d, floats and yaws gently */}
      <div
        className="icon3d-badge__stage"
        style={{ animationDelay: delayMs ? `${delayMs}ms` : undefined }}
      >
        {/* Layered depth */}
        <span className="icon3d-badge__layer icon3d-badge__back" aria-hidden />
        <span className="icon3d-badge__layer icon3d-badge__disc" aria-hidden />
        <span className="icon3d-badge__layer icon3d-badge__rim" aria-hidden />
        <span className="icon3d-badge__layer icon3d-badge__ring" aria-hidden />
        <span className="icon3d-badge__layer icon3d-badge__well" aria-hidden />
        <span className="icon3d-badge__layer icon3d-badge__gloss" aria-hidden />

        {/* Raised gold symbol */}
        <div className="icon3d-badge__glyph">
          <IconGlyph name={name} gradientId={gradientId} />
        </div>

        {/* Diagonal light sweep — once on entry, once on hover */}
        <span className="icon3d-badge__layer icon3d-badge__sweep" aria-hidden />
      </div>
    </div>
  );
}
