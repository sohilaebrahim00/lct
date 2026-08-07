import { useLayoutEffect, useRef } from "react";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, isDesktopMotion, prefersReducedMotion } from "@/lib/motion";

/**
 * Scroll-linked 2D vehicle object — Escalade travels right → left through a pinned stage.
 * Grounded with shadow + reflection; no floating / cartoon motion.
 */
export function VehicleObjectJourney() {
  const rootRef = useRef<HTMLElement>(null);
  const vehicle = IMAGES.fleetSuv;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { gsap } = ensureGsap();
    const desktop = isDesktopMotion();
    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (!desktop || reduce) {
        gsap.set(".vehicle-rig", { xPercent: 0, clearProps: "transform" });
        return;
      }

      gsap.set(".vehicle-rig", { xPercent: 55, scale: 0.92 });
      gsap.set(".vehicle-reflect", { autoAlpha: 0.35, scaleY: -1 });
      gsap.set(".vehicle-glow", { autoAlpha: 0, scale: 0.7, transformOrigin: "50% 50%" });
      gsap.set(".vehicle-streak", { autoAlpha: 0, xPercent: -140 });

      // `.vehicle-copy`/`.vehicle-copy-b` were previously only ever animated
      // by the pinned timeline below, entirely gated behind this section's
      // own "top top" pin trigger. Bringing them to full opacity/position
      // during the natural approach (well before the pin engages) means
      // they're already settled and ready the moment the section's own
      // `overflow-hidden` box scrolls far enough to expose them, instead of
      // waiting for the pin's onUpdate to reach 15% progress on top of that.
      gsap.fromTo(
        [".vehicle-copy", ".vehicle-copy-b"],
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top 90%", end: "top 55%", scrub: true },
        },
      );

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=180%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        })
        .to(".vehicle-rig", { xPercent: -5, scale: 1, duration: 1, ease: "none" }, 0)
        .to(".vehicle-sweep", { xPercent: 160, duration: 1, ease: "none" }, 0)
        // Light streaks sweep past at slightly staggered speeds, selling motion.
        .to(".vehicle-streak-1", { xPercent: 140, autoAlpha: 0.7, duration: 0.55, ease: "power1.in" }, 0.05)
        .to(".vehicle-streak-1", { autoAlpha: 0, duration: 0.2 }, 0.55)
        .to(".vehicle-streak-2", { xPercent: 140, autoAlpha: 0.5, duration: 0.7, ease: "power1.in" }, 0.15)
        .to(".vehicle-streak-2", { autoAlpha: 0, duration: 0.2 }, 0.75)
        // Tail-light glow pulses once as the vehicle settles through center.
        .to(".vehicle-glow", { autoAlpha: 0.85, scale: 1.3, duration: 0.3, ease: "power2.out" }, 0.85)
        .to(".vehicle-glow", { autoAlpha: 0, scale: 0.9, duration: 0.35, ease: "power2.in" }, 1.15)
        .to(".vehicle-rig", { xPercent: -48, scale: 0.96, duration: 1, ease: "none" }, 1)
        .set(".vehicle-streak-2", { xPercent: -140 }, 1.3)
        .to(".vehicle-streak-2", { xPercent: 140, autoAlpha: 0.45, duration: 0.6, ease: "power1.in" }, 1.35)
        .to(".vehicle-streak-2", { autoAlpha: 0, duration: 0.2 }, 1.85);

      // `.vehicle-handoff` previously had two separate systems writing its
      // opacity: the pin's own onUpdate (fading it in during the final 14%
      // of pin progress) and a second, independent ScrollTrigger meant to
      // fade it back out afterward. Confirmed live via debug instrumentation
      // that this was a genuine conflict, not just the earlier endTrigger
      // selector-scoping bug (also real, and fixed below): the second
      // ScrollTrigger's own progress correctly reached 1.0 (autoAlpha
      // correctly tweened to 0 in GSAP's bookkeeping), yet the computed
      // style stayed at opacity 1 the entire time — the pin's onUpdate,
      // which keeps running on every scroll tick even after its own
      // progress has clamped to 1 post-`end`, was re-asserting autoAlpha:1
      // on top of it every frame. Consolidated into ONE timeline (fade in ->
      // hold -> fade out) so there's a single writer for this property,
      // spanning from 86% into the pin's own progress through the natural
      // post-pin approach into PinnedStories. `endTrigger` must be a real
      // element reference, not selector text — `gsap.context()` scopes
      // selector-text lookups (including ScrollTrigger's trigger/endTrigger
      // strings) to this effect's own `root`, so "#stories" (a sibling, not
      // a descendant) would otherwise silently fail to resolve.
      const storiesEl = document.getElementById("stories");
      gsap.set(".vehicle-handoff", { autoAlpha: 0 });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: () => `top top+=${window.innerHeight * 1.8 * 0.86}`,
            endTrigger: storiesEl || root,
            end: "top 80%",
            scrub: true,
          },
        })
        .to(".vehicle-handoff", { autoAlpha: 1, duration: 0.15 })
        .to(".vehicle-handoff", { autoAlpha: 1, duration: 0.7 })
        .to(".vehicle-handoff", { autoAlpha: 0, duration: 0.15 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="vehicle-motion"
      className="relative overflow-hidden bg-[color:var(--surface-black)]"
    >
      {/* `items-start` + top padding, not `items-center` — the section's
          content sits inside a full `min-h-[100svh]` box, and while that box
          is still scrolling up into view (before its own pin engages),
          vertical centering meant the content column sat ~415px below the
          box's own top edge, so nothing was visible on screen for most of
          the ordinary approach scroll. Anchoring near the top (the same
          pattern already used by HorizontalJourney's own slides, `items-end`
          + `pt-28`) means the content is visible almost as soon as the
          section starts entering the viewport, eliminating the dead
          approach stretch at its source instead of animating around it. The
          pinned "at rest" composition is unchanged in every other respect —
          only its vertical position shifted higher, verified via screenshot
          to still read as a deliberately composed stage, not cramped. */}
      <div className="relative flex min-h-[100svh] items-start overflow-hidden pt-32 lg:pt-40">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 45% at 50% 70%, oklch(0.2 0.02 70 / 0.35), transparent 70%), linear-gradient(180deg, #080807 0%, #0d0c0a 55%, #080807 100%)",
          }}
        />

        <span
          className="vehicle-streak vehicle-streak-1 pointer-events-none absolute inset-y-[30%] left-0 z-[5] h-px w-1/3 opacity-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--champagne) 60%, white), transparent)",
          }}
          aria-hidden
        />
        <span
          className="vehicle-streak vehicle-streak-2 pointer-events-none absolute inset-y-[62%] left-0 z-[5] h-px w-1/4 opacity-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--champagne) 45%, white), transparent)",
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto grid w-full max-w-[var(--container-max)] gap-10 px-[var(--page-gutter)] lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="max-w-md">
            <div className="eyebrow text-champagne">Object in Motion</div>
            <h2 className="vehicle-copy mt-4 font-display text-4xl leading-tight text-off-white md:text-5xl lg:translate-y-6 lg:opacity-0">
              The Escalade, on your schedule.
            </h2>
            <p className="vehicle-copy-b mt-5 text-sm leading-relaxed text-off-white/70 md:text-base lg:translate-y-6 lg:opacity-0">
              Scroll-linked movement keeps the vehicle grounded — entering from the right, settling,
              then continuing toward the fleet story. No float. No spin. Just direction and
              presence.
            </p>
            <div className="mt-8 h-px w-20 bg-champagne/50" />
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-champagne/75">
              Executive SUV · 6 passengers · From $120/hour
            </p>
          </div>

          <div className="vehicle-rig relative mx-auto w-full max-w-3xl will-change-transform">
            <div
              className="absolute -bottom-2 left-[8%] right-[10%] h-8 rounded-[100%]"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.65), transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            <div
              className="vehicle-glow pointer-events-none absolute bottom-[20%] right-[9%] z-[3] h-9 w-9 rounded-full opacity-0"
              style={{
                background: "radial-gradient(circle, oklch(0.7 0.16 45 / 0.9), transparent 72%)",
                filter: "blur(3px)",
              }}
              aria-hidden
            />
            <div className="relative overflow-hidden">
              <img
                src={vehicle.src}
                alt={vehicle.alt}
                className="relative z-[1] w-full object-contain"
                style={{ objectPosition: vehicle.objectPositionDesktop }}
                loading="lazy"
              />
              <span
                className="vehicle-sweep pointer-events-none absolute inset-y-[15%] left-0 z-[2] w-1/4 -translate-x-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, color-mix(in oklab, var(--champagne) 28%, transparent), transparent)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
            <img
              src={vehicle.src}
              alt=""
              aria-hidden
              className="vehicle-reflect pointer-events-none mt-1 w-full object-contain opacity-30"
              style={{
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 70%)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 70%)",
                transform: "scaleY(-1)",
              }}
              loading="lazy"
            />
          </div>
        </div>
        <div
          className="vehicle-handoff pointer-events-none absolute inset-0 z-20 bg-[color:var(--surface-black)] opacity-0"
          aria-hidden
        />
      </div>
    </section>
  );
}
