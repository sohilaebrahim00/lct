import { useEffect, useRef, useState } from "react";
import { ensureGsap, isDesktopMotion, prefersReducedMotion } from "@/lib/motion";

type CursorMode = "view" | "book" | "explore" | "drag" | "play";

const MODE_LABEL: Record<CursorMode, string> = {
  view: "View",
  book: "Book",
  explore: "Explore",
  drag: "Drag →",
  play: "Play",
};

const SETTLE_DELAY = 130; // ms of no movement before tilt/trail ease back to rest
const TILT_MAX = 7; // degrees — subtle, never a spin

// Magnetic pull is a *hint*, never a teleport: capped in px so the visible
// pin can never separate far enough from the real pointer to make clicking
// feel disconnected. "drag" targets (horizontal filmstrips) and anything
// larger than MAGNETIC_MAX_SIZE are excluded entirely — snapping a large
// panel's cursor to its center would fight the user's actual finger/pointer.
const MAGNETIC_PULL_MAX = 10; // px
const MAGNETIC_MAX_SIZE = 220; // px, either dimension
const MAGNETIC_MODES = new Set(["view", "book", "explore", "play"]);

/**
 * Desktop-only custom cursor: a small 3D champagne-gold location pin that
 * follows the real pointer almost immediately (0.09s), tilts subtly toward
 * the direction of travel, casts a soft grounded shadow, and leaves a faint
 * champagne trail when moving quickly (fades within ~350ms). On small
 * `[data-cursor="view"|"book"|"explore"|"play"]` targets it gets a capped
 * (≤10px) magnetic pull toward center — never a snap — and morphs its label
 * smoothly. "drag" targets and anything larger than 220px are excluded from
 * magnetism entirely so a large panel's cursor never disconnects from the
 * user's actual pointer.
 *
 * Native text cursor is restored (this component fades out) over text
 * inputs, textareas and editable content — see the `html.cursor-none`
 * exceptions in styles.css.
 *
 * Renders nothing on touch/coarse-pointer devices or reduced motion — the
 * system cursor remains the fallback (`cursor-none` is only ever applied
 * while this component is mounted and active, and is removed on cleanup).
 */
const TEXT_ZONE_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, select, [contenteditable="true"], iframe';

export function Cursor() {
  const groupRef = useRef<HTMLDivElement>(null);
  const pinPosRef = useRef<HTMLDivElement>(null);
  const pinTiltRef = useRef<HTMLDivElement>(null);
  const shadowPosRef = useRef<HTMLDivElement>(null);
  const trailPosRef = useRef<HTMLDivElement>(null);
  const trailGlowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const hoverTargetRef = useRef<HTMLElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode | null>(null);

  useEffect(() => {
    const check = () => setEnabled(isDesktopMotion() && window.matchMedia("(pointer: fine)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const { gsap } = ensureGsap();
    const group = groupRef.current;
    const pinPos = pinPosRef.current;
    const pinTilt = pinTiltRef.current;
    const shadowPos = shadowPosRef.current;
    const trailPos = trailPosRef.current;
    const trailGlow = trailGlowRef.current;
    const label = labelRef.current;
    if (!group || !pinPos || !pinTilt || !shadowPos || !trailPos || !trailGlow || !label) return;

    document.documentElement.classList.add("cursor-none");
    gsap.set(pinTilt, { transformPerspective: 500, transformOrigin: "50% 100%" });

    // Position followers — the pin itself is the perceived click position, so
    // it stays inside the 0.06–0.12s "responsive first" range with almost no
    // travel distance; the shadow/trail lag a little further behind so they
    // read as physically distinct (heavier) objects, not one glued unit, but
    // never far enough to be mistaken for the actual hit target.
    const movePinX = gsap.quickTo(pinPos, "x", { duration: 0.09, ease: "power3.out" });
    const movePinY = gsap.quickTo(pinPos, "y", { duration: 0.09, ease: "power3.out" });
    const moveShadowX = gsap.quickTo(shadowPos, "x", { duration: 0.14, ease: "power3.out" });
    const moveShadowY = gsap.quickTo(shadowPos, "y", { duration: 0.14, ease: "power3.out" });
    const moveTrailX = gsap.quickTo(trailPos, "x", { duration: 0.2, ease: "power3.out" });
    const moveTrailY = gsap.quickTo(trailPos, "y", { duration: 0.2, ease: "power3.out" });
    const tiltX = gsap.quickTo(pinTilt, "rotationX", { duration: 0.18, ease: "power3.out" });
    const tiltY = gsap.quickTo(pinTilt, "rotationY", { duration: 0.18, ease: "power3.out" });

    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let lastT = performance.now();
    let settleTimer: number | undefined;
    let inTextZone = false;

    const settle = () => {
      tiltX(0);
      tiltY(0);
      gsap.to(trailGlow, { autoAlpha: 0, duration: 0.4, ease: "power2.out" });
    };

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.hypot(dx, dy) / dt; // px/ms

      const target = hoverTargetRef.current;
      const mode = target?.dataset.cursor as CursorMode | undefined;
      if (
        target &&
        mode &&
        MAGNETIC_MODES.has(mode) &&
        target.offsetWidth <= MAGNETIC_MAX_SIZE &&
        target.offsetHeight <= MAGNETIC_MAX_SIZE
      ) {
        // Capped pull toward the target's center — a hint of magnetism, never
        // a snap. The pin can drift at most MAGNETIC_PULL_MAX px from the
        // real pointer, so it can never read as a different click position.
        const r = target.getBoundingClientRect();
        const pullX = gsap.utils.clamp(
          -MAGNETIC_PULL_MAX,
          MAGNETIC_PULL_MAX,
          (r.left + r.width / 2 - e.clientX) * 0.3,
        );
        const pullY = gsap.utils.clamp(
          -MAGNETIC_PULL_MAX,
          MAGNETIC_PULL_MAX,
          (r.top + r.height / 2 - e.clientY) * 0.3,
        );
        movePinX(e.clientX + pullX);
        movePinY(e.clientY + pullY);
      } else {
        movePinX(e.clientX);
        movePinY(e.clientY);
      }
      moveShadowX(e.clientX);
      moveShadowY(e.clientY);
      moveTrailX(e.clientX);
      moveTrailY(e.clientY);

      // Slight direction-aware tilt — pivots from the pin's planted tip, decays via `settle()`.
      tiltY(gsap.utils.clamp(-TILT_MAX, TILT_MAX, dx * 0.35));
      tiltX(gsap.utils.clamp(-TILT_MAX, TILT_MAX, -dy * 0.35));

      // Faint champagne trail, restrained: only opacity/scale react to speed, no spin.
      if (speed > 0.35) {
        gsap.to(trailGlow, {
          autoAlpha: gsap.utils.clamp(0, 0.4, speed / 3),
          scale: gsap.utils.clamp(1, 1.8, speed),
          duration: 0.15,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SETTLE_DELAY);
    };

    const onOver = (e: MouseEvent) => {
      const eventTarget = e.target as HTMLElement | null;
      const nextInTextZone = !!eventTarget?.closest?.(TEXT_ZONE_SELECTOR);
      if (nextInTextZone !== inTextZone) {
        inTextZone = nextInTextZone;
        gsap.to(group, {
          autoAlpha: inTextZone ? 0 : 1,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      const target = eventTarget?.closest?.("[data-cursor]") as HTMLElement | null;
      if (target === hoverTargetRef.current) return;
      hoverTargetRef.current = target;
      const nextMode = target ? ((target.dataset.cursor as CursorMode) ?? null) : null;

      gsap.to(pinTilt, { scale: target ? 1.22 : 1, duration: 0.35, ease: "power3.out" });

      // Morph the label — fade/rise out, swap text, fade/rise in — never an instant switch.
      gsap.to(label, {
        autoAlpha: 0,
        y: 4,
        duration: 0.14,
        ease: "power2.in",
        onComplete: () => setMode(nextMode),
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      document.documentElement.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.clearTimeout(settleTimer);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !labelRef.current) return;
    const { gsap } = ensureGsap();
    gsap.to(labelRef.current, { autoAlpha: mode ? 1 : 0, y: 0, duration: 0.22, ease: "power2.out" });
  }, [mode, enabled]);

  if (!enabled || prefersReducedMotion()) return null;

  return (
    <div ref={groupRef} className="pointer-events-none" aria-hidden>
      {/* Trail — faint champagne glow, lags furthest behind, fades in ~350ms when movement stops */}
      <div ref={trailPosRef} className="pointer-events-none fixed left-0 top-0 z-[88]" aria-hidden>
        <div
          ref={trailGlowRef}
          className="h-2.5 w-2.5 -translate-x-1/2 -translate-y-[85%] rounded-full opacity-0"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--champagne) 70%, white), transparent 70%)",
            filter: "blur(1.5px)",
          }}
        />
      </div>

      {/* Grounded shadow — lags slightly behind the pin, reads as weight/contact */}
      <div ref={shadowPosRef} className="pointer-events-none fixed left-0 top-0 z-[89]" aria-hidden>
        <div
          className="h-[7px] w-4 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 75%)", filter: "blur(1px)" }}
        />
      </div>

      {/* Pin — tip aligned to the true pointer position via the static -50%/-100% offset */}
      <div ref={pinPosRef} className="pointer-events-none fixed left-0 top-0 z-[90] will-change-transform" aria-hidden>
        <div className="-translate-x-1/2 -translate-y-full" style={{ perspective: "500px" }}>
          <span
            ref={labelRef}
            className="pointer-events-none absolute left-1/2 top-[-1.6rem] -translate-x-1/2 whitespace-nowrap text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-off-white opacity-0"
            style={{ mixBlendMode: "difference" }}
          >
            {mode ? MODE_LABEL[mode] : ""}
          </span>

          <div ref={pinTiltRef} className="will-change-transform">
            <svg width="26" height="34" viewBox="0 0 34 44" fill="none">
              <defs>
                <linearGradient id="lctPinMetal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" style={{ stopColor: "var(--gold-soft)" }} />
                  <stop offset="45%" style={{ stopColor: "var(--champagne)" }} />
                  <stop offset="78%" style={{ stopColor: "var(--gold)" }} />
                  <stop offset="100%" style={{ stopColor: "var(--gold-deep)" }} />
                </linearGradient>
                <radialGradient id="lctPinHighlight" cx="32%" cy="24%" r="55%">
                  <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#fff8e8" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="lctPinShade" cx="72%" cy="82%" r="60%">
                  <stop offset="0%" stopColor="#2a1a06" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2a1a06" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="lctPinCore" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#2a2620" />
                  <stop offset="60%" stopColor="#141210" />
                  <stop offset="100%" stopColor="#070605" />
                </radialGradient>
              </defs>

              {/* Body — beveled metallic gold, dark edge stroke */}
              <path
                d="M17 2C9.82 2 4 7.82 4 15c0 5.6 3.4 11.86 6.66 16.66C13.9 36.4 17 40 17 40s3.1-3.6 6.34-8.34C26.6 26.86 30 20.6 30 15c0-7.18-5.82-13-13-13z"
                fill="url(#lctPinMetal)"
                style={{ stroke: "var(--gold-deep)" }}
                strokeWidth="0.6"
              />
              {/* Specular highlight (upper-left) */}
              <path
                d="M17 2C9.82 2 4 7.82 4 15c0 5.6 3.4 11.86 6.66 16.66C13.9 36.4 17 40 17 40s3.1-3.6 6.34-8.34C26.6 26.86 30 20.6 30 15c0-7.18-5.82-13-13-13z"
                fill="url(#lctPinHighlight)"
              />
              {/* Under-shade (lower-right) — reads as bevel depth */}
              <path
                d="M17 2C9.82 2 4 7.82 4 15c0 5.6 3.4 11.86 6.66 16.66C13.9 36.4 17 40 17 40s3.1-3.6 6.34-8.34C26.6 26.86 30 20.6 30 15c0-7.18-5.82-13-13-13z"
                fill="url(#lctPinShade)"
              />
              {/* Onyx emblem core */}
              <circle cx="17" cy="14.5" r="5.1" fill="url(#lctPinCore)" style={{ stroke: "var(--champagne)" }} strokeOpacity="0.75" strokeWidth="0.7" />
              {/* Glint */}
              <circle cx="14.6" cy="12" r="1" fill="#fff8e8" opacity="0.85" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
