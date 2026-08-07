import { useLayoutEffect, useRef } from "react";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealLines, revealClipImage, revealStagger } from "@/lib/reveal";

const VALUE_ITEMS = [
  {
    t: "Professional chauffeurs",
    d: "Uniformed, vetted, and discreet — trained for executive presentation.",
  },
  {
    t: "Punctual coordination",
    d: "Itineraries confirmed, monitored, and adjusted around your schedule.",
  },
  {
    t: "Safety & discretion",
    d: "Prepared vehicles, privacy protocols, and calm cabin service.",
  },
  {
    t: "One standard",
    d: "Airport, corporate, events, and groups — the same quiet precision.",
  },
];

export function ValueEditorial() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    let split: ReturnType<typeof revealLines> = null;

    const ctx = gsap.context(() => {
      gsap.from(".value-line", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 70%" },
      });

      split = revealLines(root.querySelector(".value-title"), { start: "top 75%" });

      const items = gsap.utils.toArray<HTMLElement>(".value-item");
      revealStagger(
        items.filter((_, i) => i % 2 === 0),
        { from: "left", start: "top 65%", trigger: root },
      );
      revealStagger(
        items.filter((_, i) => i % 2 === 1),
        { from: "right", start: "top 65%", trigger: root },
      );

      revealClipImage(".value-media", { edge: "diagonal", start: "top 78%" });

      // Oversized background numeral parallaxes slower than the foreground copy.
      gsap.to(".value-numeral", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, root);
    return () => {
      split?.revert();
      ctx.revert();
    };
  }, []);

  const img = IMAGES.valueCabinExperience;

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-[color:var(--surface-black)] py-[var(--section-space)]"
    >
      <div
        className="value-numeral pointer-events-none absolute left-[var(--page-gutter)] top-4 select-none font-display text-[10rem] leading-none text-champagne/[0.06] md:top-8 md:text-[16rem] lg:text-[20rem]"
        aria-hidden
      >
        01
      </div>
      <div className="relative mx-auto grid max-w-[var(--container-max)] gap-14 px-[var(--page-gutter)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="eyebrow text-champagne">The Standard</div>
          <h2 className="value-title mt-4 max-w-xl font-display text-[clamp(2.2rem,4vw,3.75rem)] leading-[1.02] text-off-white">
            Quiet exactness.
            <span className="block italic text-champagne">Every mile.</span>
          </h2>
          <div className="value-line mt-8 h-px w-28 bg-champagne/70" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {VALUE_ITEMS.map((item) => (
              <div key={item.t} className="value-item">
                <h3 className="font-display text-xl text-off-white">{item.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-off-white/65">{item.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="value-media relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: img.objectPositionDesktop }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>
      </div>
    </section>
  );
}

export function ChauffeurSection() {
  const rootRef = useRef<HTMLElement>(null);
  const door = IMAGES.chauffeur;
  const interior = IMAGES.chauffeurInterior;
  const portrait = IMAGES.chauffeurPortrait;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(".chauffeur-main", {
        clipPath: "inset(0 40% 0 0)",
        duration: 1.2,
        ease: "power3.inOut",
        scrollTrigger: { trigger: root, start: "top 60%" },
      });
      gsap.from(".chauffeur-float", {
        y: 60,
        autoAlpha: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".chauffeur-stack", start: "top 70%" },
      });
      gsap.to(".chauffeur-parallax", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      });
      // Each floating card drifts at its own rate for layered depth.
      gsap.to(".chauffeur-float-1", {
        yPercent: -16,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(".chauffeur-float-2", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="chauffeur"
      className="relative overflow-hidden bg-onyx py-[var(--section-space)]"
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-2 hidden select-none font-display text-[6rem] uppercase leading-none text-off-white/[0.04] lg:right-6 lg:block lg:text-[8rem]"
        style={{ writingMode: "vertical-rl", letterSpacing: "0.08em" }}
        aria-hidden
      >
        Chauffeur
      </div>
      <div className="relative mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="chauffeur-stack relative lg:col-span-7">
            <div className="chauffeur-main relative aspect-[16/11] overflow-hidden">
              <img
                src={portrait.src}
                alt={portrait.alt}
                loading="lazy"
                className="chauffeur-parallax absolute inset-0 h-[115%] w-full object-cover"
                style={{ objectPosition: portrait.objectPositionDesktop }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            </div>

            {/* Floating cards overlap the main image's corners on desktop;
                stay contained within it on narrower screens to avoid overflow. */}
            <div className="chauffeur-float chauffeur-float-1 absolute bottom-3 left-3 w-24 overflow-hidden border border-champagne/40 shadow-[var(--shadow-luxe)] sm:w-32 lg:-bottom-10 lg:-left-10 lg:w-52">
              <img
                src={door.src}
                alt={door.alt}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover"
                style={{ objectPosition: door.objectPositionDesktop }}
              />
            </div>
            <div className="chauffeur-float chauffeur-float-2 absolute right-3 top-3 w-20 overflow-hidden border border-champagne/40 shadow-[var(--shadow-luxe)] sm:w-28 lg:-right-4 lg:-top-8 lg:w-36">
              <img
                src={interior.src}
                alt={interior.alt}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover"
                style={{ objectPosition: interior.objectPositionDesktop }}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center pt-8 lg:col-span-5 lg:pt-0">
            <div className="eyebrow text-champagne">Chauffeur Experience</div>
            <h2 className="mt-4 font-display text-4xl leading-tight text-off-white md:text-5xl">
              Presence without noise.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-off-white/70 md:text-base">
              Formal presentation, white-glove door service, and a cabin prepared before you
              arrive. The details stay invisible — the arrival does not.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
