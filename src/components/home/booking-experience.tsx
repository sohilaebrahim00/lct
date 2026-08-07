import { useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { CONTACT } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealLines, drawLine } from "@/lib/reveal";

/**
 * The homepage's `BookingExperience` quote wizard (Pickup/Drop-off/Vehicle/
 * Contact) was removed 2026-08-08 — its Pickup/Drop-off fields were plain
 * text inputs with no real address autocomplete (confirmed by actually
 * typing into them: zero network requests, zero suggestion UI), duplicating
 * — worse — the real MyLimoBiz booking flow on `/book`, which already
 * provides genuine Google Places autocomplete inside its iframe. Per
 * explicit instruction: do not leave non-functional location fields in
 * production, and do not run two competing booking systems. `FinalCta`
 * below (unchanged) already links its own "Book Now" straight to `/book`,
 * so the homepage's closing CTA was never dependent on the removed section.
 */

export function FinalCta() {
  const rootRef = useRef<HTMLElement>(null);
  const img = IMAGES.rearview;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    let split: ReturnType<typeof revealLines> = null;
    const ctx = gsap.context(() => {
      gsap.from(".final-cta-copy > *:not(.final-cta-title)", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 70%" },
      });
      split = revealLines(root.querySelector(".final-cta-title"), { start: "top 70%" });
      drawLine(".final-cta-line", { start: "top 70%", duration: 0.7 });
      gsap.to(".final-cta-img", {
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, root);
    return () => {
      split?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="relative min-h-[70svh] overflow-hidden">
      <img
        src={img.src}
        alt={img.alt}
        loading="lazy"
        className="final-cta-img absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: img.objectPositionDesktop }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
      <div className="final-cta-copy relative z-10 mx-auto flex min-h-[70svh] max-w-[var(--container-max)] flex-col items-start justify-end px-[var(--page-gutter)] pb-20 pt-32">
        <div className="eyebrow text-champagne">Ready when you are</div>
        <h2 className="final-cta-title mt-4 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.98] text-off-white">
          Arrive with intention.
        </h2>
        <p className="mt-5 max-w-lg text-base text-off-white/70">
          Reserve executive transportation across {CONTACT.serviceRegion}.
        </p>

        {/* Closing gold line — echoes the loader's route-line and the hero's opening divider. */}
        <svg width="112" height="2" viewBox="0 0 112 2" className="mt-8" aria-hidden>
          <line
            x1="0"
            y1="1"
            x2="112"
            y2="1"
            className="final-cta-line"
            style={{ stroke: "var(--champagne)" }}
            strokeWidth={1}
          />
        </svg>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/book"
            data-cursor="book"
            className="inline-flex rounded-sm bg-gold-gradient px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-onyx"
          >
            Book Now
          </Link>
          <a
            href={CONTACT.phoneTel}
            className="inline-flex rounded-sm border border-champagne/40 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-off-white"
          >
            {CONTACT.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
