import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { LOGO_URL, LOGO_ALT } from "@/components/logo";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { shouldUse3D } from "@/lib/three/capability";
import { LoaderSceneBoundary } from "./loader-scene-boundary";

const SESSION_KEY = "lct-loader-seen";
const ROUTE_PATH_ID = "loaderRoutePath";

// The 3D route stage is a strictly bounded, optional enhancement — never a
// dependency. If it isn't ready within this window, the loader proceeds
// with the proven SVG sequence immediately; it never waits longer than
// this for Three.js, and a hard watchdog (below) guarantees the whole
// loader releases the page regardless of what happens with either path.
const THREE_D_RACE_MS = 300;
// Absolute backstop: if nothing else has dismissed the loader by this
// point (GSAP bug, unhandled rejection, anything), force it closed. This
// is the actual fix for "the loader sometimes hangs" — previously, the
// entire page stayed locked behind a single `onDone` callback from a
// lazily-loaded, WebGL-dependent scene with no timeout at all.
const HARD_WATCHDOG_MS = 3500;

const loaderSceneImport = () => import("./loader-scene-canvas");
const LoaderSceneCanvas = lazy(loaderSceneImport);

/**
 * Premium cinematic loader — once per session, ~2.5–3s total. Dark dotted
 * map fades in → a gold pin marks Dallas–Fort Worth → a route draws →
 * a small vehicle travels it → the destination pin activates → wordmark +
 * tagline fade in → a progress line fills → the scene dissolves into the
 * homepage. A 3D version of the route stage plays for capable desktop
 * visitors; everyone else (and any visitor where 3D isn't ready quickly)
 * gets the identical SVG sequence. See the root cause + fix notes in
 * PROJECT_SPEC.md — this file was rewritten to guarantee the page always
 * becomes usable, never gated on Three.js/WebGL/network succeeding.
 */
export function BrandLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [show3D, setShow3D] = useState(false);
  /** Set inside the effect below; called by the 3D scene's `onDone` from the render, outside that closure. */
  const playPhaseBRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — still show once */
    }
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active || !rootRef.current) return;
    const reduce = prefersReducedMotion();
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    document.body.style.overflow = "hidden";

    const { gsap } = ensureGsap();
    const root = rootRef.current;
    let finished = false;
    let raceTimeoutId: number | undefined;
    const watchdogId = window.setTimeout(() => hardFinish(), HARD_WATCHDOG_MS);

    // Guaranteed exit path — idempotent, callable from anywhere (GSAP
    // onComplete, the 3D scene's onDone, the error boundary, or the
    // watchdog). Always removes the scroll lock and hides the overlay.
    function hardFinish() {
      if (finished) return;
      finished = true;
      window.clearTimeout(watchdogId);
      if (raceTimeoutId) window.clearTimeout(raceTimeoutId);
      document.body.style.overflow = "";
      const el = rootRef.current;
      if (el) {
        gsap.to(el, {
          autoAlpha: 0,
          duration: reduce ? 0.15 : 0.4,
          ease: "power2.inOut",
          onComplete: () => setActive(false),
        });
      } else {
        setActive(false);
      }
    }

    const ctx = gsap.context(() => {
      if (reduce || isMobile) {
        gsap
          .timeline({ defaults: { ease: "power3.out" }, onComplete: hardFinish })
          .fromTo(".loader-logo", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 })
          .fromTo(".loader-tagline", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.15)
          .to({}, { duration: 0.3 })
          .to(".loader-panel", {
            yPercent: (i) => (i === 0 ? -100 : 100),
            duration: 0.35,
            ease: "power2.inOut",
          });
        return;
      }

      // ---- Baseline (everything hidden/at-rest before the sequence plays) ----
      gsap.set(".loader-logo", { clipPath: "inset(0 100% 0 0)", autoAlpha: 1 });
      gsap.set(".loader-line", { scaleX: 0 });
      gsap.set(".loader-sweep", { xPercent: -120, autoAlpha: 0 });
      gsap.set(".loader-wordmark", { autoAlpha: 0, y: 14 });
      gsap.set(".loader-tagline", { autoAlpha: 0, y: 8 });
      gsap.set(".loader-progress-fill", { scaleX: 0, transformOrigin: "left center" });

      // ---- Phase B (shared tail): wordmark, tagline, progress, curtain.
      // Same for both route-stage variants; compressed via timeScale to
      // keep total loader time inside the ~2.5–3s budget. ----
      const playPhaseB = () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" }, timeScale: 1.8, onComplete: hardFinish })
          .to(".loader-wordmark", { autoAlpha: 1, y: 0, duration: 0.6 }, 0)
          .to(".loader-logo", { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power3.inOut" }, 0)
          .fromTo(
            ".loader-sweep",
            { xPercent: -120, autoAlpha: 0.85 },
            { xPercent: 140, autoAlpha: 0, duration: 0.7, ease: "power1.inOut" },
            0.2,
          )
          .to(".loader-line", { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, 0.2)
          .to(".loader-tagline", { autoAlpha: 1, y: 0, duration: 0.5 }, 0.35)
          .to(".loader-progress-fill", { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0.7)
          .to({}, { duration: 0.15 }, 1.2)
          .to(
            [".loader-panel-top", ".loader-panel-bottom"],
            {
              yPercent: (i) => (i === 0 ? -105 : 105),
              duration: 0.75,
              ease: "power3.inOut",
              stagger: 0.04,
            },
            1.35,
          )
          .to(".loader-content", { autoAlpha: 0, duration: 0.4 }, 1.4);
      };
      playPhaseBRef.current = playPhaseB;

      // ---- STEP 1 — dark dotted world map fades in (shared by both route-stage variants) ----
      gsap.set(".loader-map", { autoAlpha: 0 });
      gsap.to(".loader-map", { autoAlpha: 1, duration: 0.5, ease: "power2.out" });

      const startSvgPhaseA = () => {
        gsap.set(".loader-route", { autoAlpha: 0 });
        gsap.set(`#${ROUTE_PATH_ID}`, { drawSVG: "0%" });
        gsap.set(".loader-pin-origin", { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(".loader-pin-ripple", { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%" });
        gsap.set(".loader-vehicle-group", { autoAlpha: 0 });
        gsap.set(".loader-vehicle-shadow", { autoAlpha: 0 });
        gsap.set(".loader-vehicle-sheen", { x: -34 });
        gsap.set(".loader-pin-dest", { opacity: 0.22, transformOrigin: "50% 50%" });
        gsap.set(".loader-pin-dest-glow", { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
        gsap.set(".loader-pin-dest-flash", { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
        gsap.set(".loader-pin-dest-ripple", { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%" });

        gsap
          .timeline({ defaults: { ease: "power3.out" }, timeScale: 2.6, onComplete: playPhaseB })
          .to(".loader-route", { autoAlpha: 1, duration: 0.3 }, 0.25)
          .to(".loader-pin-origin", { scale: 1, duration: 0.5, ease: "back.out(2.6)" }, 0.45)
          .to(
            ".loader-pin-ripple",
            { scale: 2.6, autoAlpha: 0, duration: 1.1, ease: "power2.out", stagger: 0.28, repeat: 1 },
            0.55,
          )
          .to(`#${ROUTE_PATH_ID}`, { drawSVG: "100%", duration: 0.95, ease: "power2.inOut" }, 0.95)
          .to(".loader-vehicle-group", { autoAlpha: 1, duration: 0.18 }, 1.05)
          .to(".loader-vehicle-shadow", { autoAlpha: 0.45, duration: 0.18 }, 1.05)
          .to(
            ".loader-vehicle-group",
            { motionPath: { path: `#${ROUTE_PATH_ID}`, autoRotate: true }, duration: 1.0, ease: "power1.inOut" },
            1.1,
          )
          .to(
            ".loader-vehicle-shadow",
            { motionPath: { path: `#${ROUTE_PATH_ID}`, autoRotate: false }, duration: 1.0, ease: "power1.inOut" },
            1.1,
          )
          .to(".loader-vehicle-sheen", { x: 130, duration: 0.6, repeat: 1, ease: "power1.inOut" }, 1.1)
          .to(
            ".loader-vehicle-headlight-glow",
            { opacity: 0.9, scale: 1.25, duration: 0.4, repeat: 2, yoyo: true, ease: "sine.inOut" },
            1.1,
          )
          .to(".loader-vehicle-shadow", { autoAlpha: 0, duration: 0.2 }, 2.02)
          .to(".loader-pin-dest", { opacity: 1, duration: 0.2 }, 2.08)
          .to(".loader-pin-dest-flash", { opacity: 0.95, scale: 2.8, duration: 0.32, ease: "power2.out" }, 2.08)
          .to(".loader-pin-dest-flash", { opacity: 0, duration: 0.28 }, 2.34)
          .to(".loader-pin-dest-glow", { opacity: 0.85, scale: 1.6, duration: 0.4, ease: "power2.out" }, 2.1)
          .to(
            ".loader-pin-dest-ripple",
            { scale: 2.2, autoAlpha: 0, duration: 0.9, ease: "power2.out", stagger: 0.22 },
            2.15,
          )
          .to(".loader-pin-dest-glow", { opacity: 0.35, duration: 0.4 }, 2.55)
          .to(".loader-route", { autoAlpha: 0, duration: 0.35 }, 2.7);
      };

      if (shouldUse3D()) {
        // Race the chunk fetch against a short, hard timeout — this is the
        // fix for the loader depending on Three.js: the SVG path always
        // wins if 3D isn't ready fast, and nothing here can wait longer
        // than THREE_D_RACE_MS before a path is committed to.
        let decided = false;
        raceTimeoutId = window.setTimeout(() => {
          if (decided) return;
          decided = true;
          startSvgPhaseA();
        }, THREE_D_RACE_MS);

        loaderSceneImport()
          .then(() => {
            if (decided) return;
            decided = true;
            window.clearTimeout(raceTimeoutId);
            setShow3D(true);
          })
          .catch(() => {
            if (decided) return;
            decided = true;
            window.clearTimeout(raceTimeoutId);
            startSvgPhaseA();
          });
      } else {
        startSvgPhaseA();
      }
    }, root);

    return () => {
      ctx.revert();
      window.clearTimeout(watchdogId);
      if (raceTimeoutId) window.clearTimeout(raceTimeoutId);
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
      aria-hidden
      role="presentation"
    >
      <div className="loader-panel loader-panel-top absolute inset-x-0 top-0 h-1/2 bg-[color:var(--surface-black)]" />
      <div className="loader-panel loader-panel-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[color:var(--surface-black)]" />

      <div className="loader-content absolute inset-0 z-10 flex flex-col items-center justify-center">
        {/* STEP 1 — dark dotted world map, gold accents, no bright colors */}
        <div
          className="loader-map pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklab, var(--champagne) 55%, transparent) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(60% 60% at 50% 48%, black 35%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(60% 60% at 50% 48%, black 35%, transparent 78%)",
            opacity: 0.4,
          }}
        >
          {[
            { top: "22%", left: "18%" },
            { top: "34%", left: "72%" },
            { top: "64%", left: "28%" },
            { top: "58%", left: "80%" },
            { top: "76%", left: "52%" },
          ].map((p, i) => (
            <span
              key={i}
              className="absolute h-[3px] w-[3px] rounded-full"
              style={{
                top: p.top,
                left: p.left,
                background: "var(--champagne)",
                boxShadow: "0 0 6px 1px color-mix(in oklab, var(--champagne) 70%, transparent)",
              }}
            />
          ))}
        </div>

        {/* STEP 2–5 (3D) — same beats (pin, route, vehicle, arrival, camera
            push-in) rendered with Three.js for WebGL-capable desktop
            visitors, only once the chunk has actually resolved (never
            waited on beyond THREE_D_RACE_MS). Wrapped in an error boundary
            so a failed chunk/WebGL init can never crash or hang the
            loader — it just falls back to finishing immediately. */}
        {show3D && (
          <div className="loader-route-3d pointer-events-none h-[220px] w-[min(84vw,560px)]">
            <LoaderSceneBoundary onError={() => playPhaseBRef.current()}>
              <Suspense fallback={null}>
                <LoaderSceneCanvas
                  onDone={() => {
                    // The SVG path fades `.loader-route` out before the
                    // wordmark appears — mirror that here so the 3D route
                    // stage doesn't stay visible underneath the tail.
                    const { gsap: g } = ensureGsap();
                    g.to(".loader-route-3d", {
                      autoAlpha: 0,
                      duration: 0.25,
                      onComplete: () => playPhaseBRef.current(),
                    });
                  }}
                />
              </Suspense>
            </LoaderSceneBoundary>
          </div>
        )}

        {/* STEP 2–5 (fallback) — same beats as an SVG/DrawSVG/MotionPath
            sequence, used whenever 3D isn't available or isn't ready in
            time (reduced-motion/mobile never reach this branch at all) */}
        {!show3D && (
        <div className="loader-route pointer-events-none w-[min(84vw,560px)]">
          <svg viewBox="0 0 480 170" className="w-full overflow-visible" aria-hidden>
            <defs>
              <radialGradient id="loaderPinGlow">
                <stop offset="0%" style={{ stopColor: "var(--champagne)" }} stopOpacity={0.9} />
                <stop offset="100%" style={{ stopColor: "var(--champagne)" }} stopOpacity={0} />
              </radialGradient>
              <linearGradient id="loaderCarBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f4dfa8" />
                <stop offset="45%" stopColor="#d4af6a" />
                <stop offset="100%" stopColor="#8a6a2f" />
              </linearGradient>
              <linearGradient id="loaderCarSheen" x1="0" y1="0" x2="1" y2="0.15">
                <stop offset="0%" stopColor="#fff8e8" stopOpacity={0} />
                <stop offset="50%" stopColor="#fff8e8" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#fff8e8" stopOpacity={0} />
              </linearGradient>
              <clipPath id="loaderCarClip">
                <path d="M3,27 C1.5,27 1,25.5 2,24 L5,18.5 C6.5,15.5 9,13.5 12,13 L21,11.5 C24,8 30,5.5 37,5 L58,5 C65,5.2 71,7 75.5,10.5 L84,11 C89,11.3 93.5,13.5 95.5,17.5 L97,21 C97.8,22.6 97,25 95,25.5 L90,26.5 L88,26.5 C88,23 85,20.3 81.3,20.3 C77.6,20.3 74.6,23 74.6,26.5 L28.4,26.5 C28.4,23 25.4,20.3 21.7,20.3 C18,20.3 15,23 15,26.5 L8,26.8 Z" />
              </clipPath>
            </defs>

            <path
              id={ROUTE_PATH_ID}
              d="M60,120 C170,94 310,94 420,120"
              fill="none"
              style={{ stroke: "var(--champagne)" }}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.85}
            />

            {/* Origin pin — Dallas–Fort Worth */}
            <g transform="translate(60,120)">
              <circle className="loader-pin-ripple" r={7} fill="none" style={{ stroke: "var(--champagne)" }} strokeWidth={1} />
              <circle className="loader-pin-ripple" r={7} fill="none" style={{ stroke: "var(--champagne)" }} strokeWidth={1} />
              <circle className="loader-pin-origin" r={5.5} style={{ fill: "var(--champagne)" }} />
              <circle r={2} style={{ fill: "#141210" }} />
            </g>

            {/* Traveling vehicle — gold sedan silhouette, shadow travels separately */}
            <ellipse
              className="loader-vehicle-shadow"
              cx={60}
              cy={132}
              rx={17}
              ry={3}
              fill="#000"
              opacity={0}
              style={{ filter: "blur(2px)" }}
            />
            <g className="loader-vehicle-group" transform="translate(60,120)">
              <g transform="translate(-19,-8) scale(0.42)">
                <filter id="loaderHeadlightBlur" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="1.6" />
                </filter>
                <path
                  d="M3,27 C1.5,27 1,25.5 2,24 L5,18.5 C6.5,15.5 9,13.5 12,13 L21,11.5 C24,8 30,5.5 37,5 L58,5 C65,5.2 71,7 75.5,10.5 L84,11 C89,11.3 93.5,13.5 95.5,17.5 L97,21 C97.8,22.6 97,25 95,25.5 L90,26.5 L88,26.5 C88,23 85,20.3 81.3,20.3 C77.6,20.3 74.6,23 74.6,26.5 L28.4,26.5 C28.4,23 25.4,20.3 21.7,20.3 C18,20.3 15,23 15,26.5 L8,26.8 Z"
                  fill="url(#loaderCarBody)"
                  stroke="#3a2c10"
                  strokeWidth={0.9}
                />
                <path d="M21,11.5 L37,5 L58,5 L75.5,10.5 Z" fill="#2a2010" opacity={0.4} />
                <circle cx={21.7} cy={26.5} r={5.4} fill="#0c0a08" stroke="#8a6a2f" strokeWidth={0.6} />
                <circle cx={81.3} cy={26.5} r={5.4} fill="#0c0a08" stroke="#8a6a2f" strokeWidth={0.6} />
                <g clipPath="url(#loaderCarClip)">
                  <rect
                    className="loader-vehicle-sheen"
                    x={-34}
                    y={-6}
                    width={22}
                    height={44}
                    fill="url(#loaderCarSheen)"
                  />
                </g>
                <circle
                  className="loader-vehicle-headlight-glow"
                  cx={95.5}
                  cy={17.5}
                  r={5}
                  fill="#fff8e8"
                  opacity={0.55}
                  filter="url(#loaderHeadlightBlur)"
                />
                <circle cx={95.5} cy={17.5} r={1.6} fill="#fffdf5" />
              </g>
            </g>

            {/* Destination pin — arrival */}
            <g transform="translate(420,120)">
              <circle className="loader-pin-dest-ripple" r={7} fill="none" style={{ stroke: "var(--champagne)" }} strokeWidth={1} />
              <circle className="loader-pin-dest-ripple" r={7} fill="none" style={{ stroke: "var(--champagne)" }} strokeWidth={1} />
              <circle className="loader-pin-dest-flash" r={16} fill="url(#loaderPinGlow)" />
              <circle className="loader-pin-dest-glow" r={14} fill="url(#loaderPinGlow)" />
              <circle className="loader-pin-dest" r={5.5} style={{ fill: "var(--champagne)" }} />
              <circle className="loader-pin-dest" r={2} style={{ fill: "#141210" }} />
            </g>
          </svg>
        </div>
        )}

        {/* STEP 6 — wordmark + tagline (only after arrival) */}
        <div className="loader-wordmark relative mt-2 text-center">
          <div className="loader-logo relative inline-block overflow-hidden">
            <img
              src={LOGO_URL}
              alt={LOGO_ALT}
              className="h-14 w-auto select-none object-contain md:h-20"
              draggable={false}
              decoding="async"
            />
            <span
              className="loader-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, color-mix(in oklab, var(--champagne) 55%, white), transparent)",
                mixBlendMode: "screen",
              }}
            />
          </div>
          <div
            className="loader-line mx-auto mt-4 h-px w-40 origin-left bg-champagne/80 md:w-56"
            style={{ transformOrigin: "left center" }}
          />
          <p className="loader-tagline mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-off-white/80">
            Your Journey.
            <br />
            Our Priority.
          </p>
        </div>

        {/* STEP 7 — loading progress */}
        <div className="loader-progress-track mt-9 h-px w-40 overflow-hidden bg-white/10 md:w-52">
          <div className="loader-progress-fill h-full w-full bg-champagne" />
        </div>
      </div>
    </div>
  );
}
