import { useLayoutEffect, useRef } from "react";
import { FLEET_VEHICLES } from "@/lib/site-data";
import { IMAGES, type ImageKey } from "@/lib/image-map";
import {
  ensureGsap,
  isDesktopMotion,
  prefersReducedMotion,
  refreshScrollTriggers,
} from "@/lib/motion";

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  meta: string;
  imageKey: ImageKey;
  tone: string;
};

const SLIDES: Slide[] = [
  {
    id: "sedan",
    eyebrow: "01 — Fleet",
    title: "Executive Sedan",
    desc: "Mercedes-Benz S-Class for discreet business travel and private arrivals.",
    meta: `${FLEET_VEHICLES[0].pax} passengers · ${FLEET_VEHICLES[0].bags} luggage · ${FLEET_VEHICLES[0].priceLabel}`,
    imageKey: "fleetSedan",
    tone: "radial-gradient(80% 60% at 70% 40%, oklch(0.22 0.02 70 / 0.55), transparent 70%), #0a0908",
  },
  {
    id: "suv",
    eyebrow: "02 — Fleet",
    title: "Executive SUV",
    desc: "Cadillac Escalade with captain seating, extended legroom, and room for luggage.",
    meta: `${FLEET_VEHICLES[1].pax} passengers · ${FLEET_VEHICLES[1].bags} luggage · ${FLEET_VEHICLES[1].priceLabel}`,
    imageKey: "fleetSuv",
    tone: "radial-gradient(80% 60% at 30% 50%, oklch(0.24 0.03 55 / 0.5), transparent 70%), #0b0a09",
  },
  {
    id: "sprinter",
    eyebrow: "03 — Fleet",
    title: "Executive Sprinter",
    desc: "Mercedes-Benz Sprinter for corporate groups, delegations, and VIP parties.",
    meta: `${FLEET_VEHICLES[2].pax} passengers · ${FLEET_VEHICLES[2].bags} luggage · ${FLEET_VEHICLES[2].priceLabel}`,
    imageKey: "fleetSprinter",
    tone: "radial-gradient(70% 55% at 60% 35%, oklch(0.2 0.025 85 / 0.45), transparent 68%), #090908",
  },
  {
    id: "coach",
    eyebrow: "04 — Fleet",
    title: "Executive Coach",
    desc: "Large-group transportation for weddings, conferences, and signature events. Quote only.",
    meta: `${FLEET_VEHICLES[3].pax} passengers · ${FLEET_VEHICLES[3].priceLabel}`,
    imageKey: "fleetCoachJourney",
    tone: "radial-gradient(75% 55% at 40% 45%, oklch(0.2 0.02 100 / 0.4), transparent 70%), #080807",
  },
];

export function HorizontalJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    const reduce = prefersReducedMotion();
    const desktop = isDesktopMotion();

    const ctx = gsap.context(() => {
      if (!desktop || reduce) {
        gsap.set(track, { clearProps: "transform" });
        return;
      }

      const getScroll = () => Math.max(0, track.scrollWidth - window.innerWidth);

      let lastVelocityTime = 0;

      const tween = gsap.to(track, {
        x: () => -getScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 0.85,
          start: "top top",
          end: () => `+=${getScroll() + window.innerHeight * 0.2}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const idx = Math.min(SLIDES.length - 1, Math.floor(progress * SLIDES.length));
            section.style.setProperty("--journey-tone", SLIDES[idx].tone);
            section.querySelectorAll("[data-slide-index]").forEach((el) => {
              const i = Number((el as HTMLElement).dataset.slideIndex);
              el.classList.toggle("is-active", i === idx);
            });

            // Capped scroll-velocity blur on the track for a motion-blur illusion.
            const now = performance.now();
            if (now - lastVelocityTime > 40) {
              lastVelocityTime = now;
              const v = Math.abs(self.getVelocity()) / 2200;
              const blur = gsap.utils.clamp(0, 3, v);
              track.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : "";
            }

            // Hand off into VehicleObjectJourney: dark wipe rises over the
            // final ~6% of the pin. Fade-IN only here — this half is
            // unchanged from the original, always-correct pattern.
            if (progress >= 1) return;
            const handoff = gsap.utils.clamp(0, 1, (progress - 0.94) / 0.06);
            gsap.set(".journey-handoff", { autoAlpha: handoff });
          },
        },
      });

      // Fades `.journey-handoff` back out across the natural post-pin
      // approach into VehicleObjectJourney. Three earlier approaches were
      // tried and reverted after live testing, each confirmed broken by
      // direct debug instrumentation, not assumption: (1) letting the pin's
      // own onUpdate handle fade-out too, past progress===1 — it does keep
      // firing for a while after `end`, but not reliably all the way to
      // where the fade should finish, leaving `.journey-handoff` frozen
      // partway; (2) a second ScrollTrigger with `start: "top top+=N"` — a
      // custom pixel offset that GSAP resolves incorrectly for a trigger
      // sharing the pin's own target element (thousands of px too early);
      // (3) a second ScrollTrigger with `start: "bottom bottom"` — this
      // string is itself ambiguous for an element that gets pinned later:
      // it resolves to where the section *first* approaches from below
      // (long before the pin even starts), not "after the pin ends", since
      // both are geometrically valid "bottom = viewport bottom" moments and
      // GSAP picks the earlier one. This version sidesteps all of that by
      // reading the pin ScrollTrigger's own already-correct, fully-resolved
      // `.end` pixel value directly off the trigger instance (`tween.
      // scrollTrigger`) and building an independent trigger from that exact
      // number — no relative-position string involved anywhere.
      const journeyPinST = tween.scrollTrigger!;
      gsap.fromTo(
        ".journey-handoff",
        { autoAlpha: 1 },
        {
          autoAlpha: 0,
          ease: "none",
          // Without this, `gsap.fromTo`'s default `immediateRender:true`
          // snaps `.journey-handoff` to autoAlpha:1 the instant this line
          // runs (page load) — harmless while the section is off-screen,
          // but incorrect and worth being explicit about rather than
          // relying on that coincidence.
          immediateRender: false,
          scrollTrigger: {
            start: () => journeyPinST.end,
            end: () => journeyPinST.end + window.innerHeight * 0.55,
            scrub: true,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(".journey-slide-media").forEach((media) => {
        gsap.fromTo(
          media,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: media.parentElement,
              containerAnimation: tween,
              start: "left 80%",
              end: "left 20%",
              scrub: true,
            },
          },
        );
      });

      // Oversized background numeral parallaxes counter to the copy as each
      // slide crosses the screen.
      gsap.utils.toArray<HTMLElement>(".journey-numeral").forEach((numeral) => {
        gsap.fromTo(
          numeral,
          { xPercent: 12 },
          {
            xPercent: -12,
            ease: "none",
            scrollTrigger: {
              trigger: numeral.closest(".journey-slide") as HTMLElement,
              containerAnimation: tween,
              start: "left right",
              end: "left left",
              scrub: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".journey-copy").forEach((copy) => {
        gsap.from(copy.children, {
          y: 36,
          autoAlpha: 0,
          stagger: 0.06,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: copy,
            containerAnimation: tween,
            start: "left 70%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, section);

    const imgs = section.querySelectorAll("img");
    let pending = imgs.length;
    const done = () => {
      pending -= 1;
      if (pending <= 0) refreshScrollTriggers();
    };
    imgs.forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="fleet-journey"
      className="relative overflow-hidden bg-[color:var(--surface-black)]"
      style={{ ["--journey-tone" as string]: SLIDES[0].tone }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{ background: "var(--journey-tone)" }}
      />

      {/* Desktop horizontal track */}
      <div className="relative hidden lg:block" data-cursor="drag">
        <div ref={trackRef} className="flex w-max will-change-transform">
          {SLIDES.map((slide, i) => {
            const img = IMAGES[slide.imageKey];
            return (
              <article
                key={slide.id}
                data-slide-index={i}
                className="journey-slide relative flex h-[100svh] w-screen items-end px-[var(--page-gutter)] pb-20 pt-28"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="journey-slide-media absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: img.objectPositionDesktop }}
                  />
                  {/* Localized: darkened only where the copy column sits
                      (left edge), photo stays visible across the rest of
                      the frame; a light bottom fade instead of a full black
                      wash keeps the vehicle itself legible. */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                </div>

                <div
                  className="journey-numeral pointer-events-none absolute bottom-0 right-[var(--page-gutter)] select-none font-display text-[9rem] leading-none text-off-white/[0.05] md:text-[13rem]"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="journey-copy relative z-10 max-w-2xl">
                  <div className="eyebrow text-champagne">{slide.eyebrow}</div>
                  <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.75rem)] leading-[0.95] text-off-white">
                    {slide.title}
                  </h2>
                  <p className="mt-6 max-w-lg text-base leading-relaxed text-off-white/72 md:text-lg">
                    {slide.desc}
                  </p>
                  <div className="mt-8 h-px w-24 bg-champagne/60" />
                  <p className="mt-5 text-xs uppercase tracking-[0.24em] text-champagne/80">
                    {slide.meta}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
        <div
          className="journey-handoff pointer-events-none absolute inset-0 z-20 bg-[color:var(--surface-black)] opacity-0"
          aria-hidden
        />
      </div>

      {/* Mobile / reduced-motion: vertical cinematic stack + optional snap */}
      <div className="lg:hidden">
        {SLIDES.map((slide, i) => {
          const img = IMAGES[slide.imageKey];
          return (
            <article
              key={slide.id}
              className="relative flex min-h-[88svh] snap-start items-end overflow-hidden px-[var(--page-gutter)] pb-16 pt-24"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: img.objectPositionMobile }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="relative z-10 max-w-xl">
                <div className="eyebrow text-champagne">{slide.eyebrow}</div>
                <h2 className="mt-3 font-display text-4xl leading-tight text-off-white">
                  {slide.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-off-white/75">{slide.desc}</p>
                <p className="mt-5 text-[0.65rem] uppercase tracking-[0.22em] text-champagne/75">
                  {slide.meta}
                </p>
                <p className="mt-8 text-[0.65rem] uppercase tracking-[0.28em] text-off-white/35">
                  {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
