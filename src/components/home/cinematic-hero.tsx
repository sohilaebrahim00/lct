import { useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { ensureGsap, isDesktopMotion, prefersReducedMotion } from "@/lib/motion";
import { MagneticButton } from "@/components/home/magnetic-button";
import { LoopVideo } from "@/components/media/loop-video";
import heroDrivingVideo from "@/assets/video/hero-driving.mp4";

export function CinematicHero() {
  const rootRef = useRef<HTMLElement>(null);
  const hero = IMAGES.hero;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const reduce = prefersReducedMotion();
    let onMove: ((e: MouseEvent) => void) | null = null;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(
          [".hero-media", ".hero-line", ".hero-word", ".hero-copy", ".hero-cta", ".hero-scroll"],
          { clearProps: "all", autoAlpha: 1 },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      gsap.set(".hero-media", { clipPath: "inset(12% 18% 12% 18%)", scale: 1.12, xPercent: 8 });
      gsap.set(".hero-grad", { autoAlpha: 0 });
      gsap.set(".hero-word", { yPercent: 110, autoAlpha: 0 });
      gsap.set([".hero-copy", ".hero-cta", ".hero-scroll", ".hero-line"], { autoAlpha: 0, y: 24 });

      tl.to(".hero-grad", { autoAlpha: 1, duration: 0.6 }, 0)
        .to(
          ".hero-media",
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            xPercent: 0,
            duration: 1.45,
            ease: "power3.inOut",
          },
          0.15,
        )
        .to(".hero-line", { autoAlpha: 1, y: 0, duration: 0.5 }, 0.85)
        .to(
          ".hero-word",
          { yPercent: 0, autoAlpha: 1, duration: 0.85, stagger: 0.12, ease: "power4.out" },
          0.95,
        )
        .to(".hero-copy", { autoAlpha: 1, y: 0, duration: 0.7 }, 1.55)
        .to(".hero-cta", { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08 }, 1.75)
        .to(".hero-scroll", { autoAlpha: 1, y: 0, duration: 0.5 }, 2.05);

      gsap.to(".hero-media-visual", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-content", {
        yPercent: -8,
        autoAlpha: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Hand off into ValueEditorial: hero's divider line fades and a dark
      // wipe rises as the section scrolls out, dissolving into the next one.
      // (Hero is exactly viewport-height, so these must span from "bottom
      // bottom" — true rest, progress 0 — through "bottom top" — fully
      // scrolled past — not a "bottom X%" that's already satisfied at rest.)
      gsap.to(".hero-line", {
        autoAlpha: 0,
        y: -12,
        ease: "none",
        scrollTrigger: { trigger: root, start: "bottom bottom", end: "bottom 45%", scrub: true },
      });
      // Compressed into the final ~20% of the exit (not the full "bottom
      // bottom" -> "bottom top" range) — matching the HorizontalJourney/
      // VehicleObjectJourney handoffs, which only activate over their last
      // 14-15%. The uncompressed version was darkening the Hero for its
      // entire scroll-out, which then ran straight into ValueEditorial's
      // own near-identical near-black top padding — together reading as
      // one long dead "black gap" with nothing legible on screen.
      gsap.to(".hero-handoff", {
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "bottom 20%", end: "bottom top", scrub: true },
      });

      // Desktop-only pointer-parallax tilt on the hero image, layered on
      // top of the scroll parallax above.
      if (isDesktopMotion()) {
        const media = root.querySelector(".hero-media-visual") as HTMLElement | null;
        if (media) {
          const moveX = gsap.quickTo(media, "x", { duration: 0.9, ease: "power3.out" });
          const tiltY = gsap.quickTo(media, "rotateY", { duration: 0.9, ease: "power3.out" });
          onMove = (e: MouseEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            moveX(nx * 16);
            tiltY(nx * -1.4);
          };
          root.addEventListener("mousemove", onMove);
        }
      }
    }, root);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      if (onMove) root.removeEventListener("mousemove", onMove);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-black"
    >
      <div className="hero-grad absolute inset-0 z-[1]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 72% 42%, color-mix(in oklab, var(--champagne) 16%, transparent), transparent 65%), linear-gradient(115deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.72) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, color-mix(in oklab, var(--champagne) 12%, transparent) 48%, transparent 62%)",
            animation: prefersReducedMotion()
              ? undefined
              : "heroLightSweep 9s ease-in-out infinite",
          }}
        />
      </div>

      <div className="hero-media absolute inset-0" style={{ perspective: "1400px" }}>
        <img
          src={hero.src}
          alt={hero.alt}
          className="hero-media-visual absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: hero.objectPositionDesktop }}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div
        className="hero-handoff pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[45vh] opacity-0"
        style={{ background: "linear-gradient(to bottom, transparent, var(--surface-black))" }}
      />

      <div className="hero-content relative z-[2] mx-auto w-full max-w-[var(--container-max)] px-[var(--page-gutter)] pb-16 pt-36 md:pb-24 lg:pb-28">
        <div className="hero-line mb-6 flex items-center gap-3">
          <span className="h-px w-10 bg-champagne/70" />
          <span className="eyebrow text-champagne">Dallas–Fort Worth · Grapevine</span>
        </div>

        <h1 className="max-w-4xl font-display text-[clamp(2.75rem,7vw,6.25rem)] leading-[0.92] tracking-[-0.03em] text-off-white">
          <span className="block overflow-hidden">
            <span className="hero-word inline-block">
              <span className="sr-only">O</span>
              <span
                aria-hidden
                className="hero-o-slot relative -mb-1 mr-[0.02em] inline-block overflow-hidden rounded-full align-middle ring-1 ring-champagne/70"
                style={{
                  width: "0.62em",
                  height: "0.62em",
                  background:
                    "radial-gradient(circle at 35% 30%, var(--gold-soft), var(--gold-deep) 75%)",
                }}
              >
                <LoopVideo src={heroDrivingVideo} eager className="absolute inset-0 h-full w-full" />
                <span className="absolute inset-0 bg-black/10" />
              </span>
              ne Fleet,
            </span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span className="hero-word inline-block italic text-champagne">
              Every Occasion.
            </span>
          </span>
        </h1>

        <p className="hero-copy mt-7 max-w-xl text-base leading-relaxed text-off-white/75 md:text-lg">
          Executive sedans, SUVs, sprinters, and coach transportation — airport transfers,
          corporate travel, events, and group logistics across {CONTACT.serviceRegion}.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <div className="hero-cta">
            <Link
              to="/book"
              data-cursor="book"
              className="group inline-flex items-center gap-3 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
            >
              Book Your Ride
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
          <div className="hero-cta">
            <MagneticButton
              className="inline-flex items-center gap-2 rounded-sm border border-champagne/35 bg-black/30 px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-off-white backdrop-blur-sm transition hover:border-champagne hover:text-champagne"
              onClick={() =>
                document.getElementById("fleet-journey")?.scrollIntoView({ behavior: "smooth" })
              }
              data-cursor="explore"
            >
              Explore Our Fleet
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MagneticButton>
          </div>
        </div>

        {/* pr-20 keeps this row clear of the fixed WhatsApp/phone FAB stack
            (bottom-right, ~56px + margin) on mobile, where this row and the
            FABs both land near the bottom of the viewport — otherwise the
            phone FAB visually covers the tail end of "Request a Quote". */}
        <div className="hero-scroll mt-16 flex items-center gap-6 pr-20 text-xs uppercase tracking-[0.28em] text-off-white/45 lg:pr-0">
          <a href={CONTACT.phoneTel} className="transition hover:text-champagne">
            {CONTACT.phoneDisplay}
          </a>
          <Link to="/contact" className="transition hover:text-champagne">
            Request a Quote
          </Link>
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="block h-8 w-px bg-champagne/40" />
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
