import { useLayoutEffect, useRef } from "react";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealLines, revealStagger } from "@/lib/reveal";

const POINTS = [
  { t: "Always on call", d: "Dispatch and reservations answered day or night." },
  { t: "Airport-ready", d: "Flights tracked, chauffeur staged before you land." },
  { t: "Same-night availability", d: "Late arrivals and last-minute changes, covered." },
];

/**
 * A slim trust band, not a full section — the chauffeur-at-the-wheel photo
 * behind the circular frame is the visual cue ("someone is always ready");
 * the three short points carry the actual "24/7" claim as real,
 * always-present text, same pattern as every other section on the page.
 */
export function ServiceAvailability() {
  const rootRef = useRef<HTMLElement>(null);
  const poster = IMAGES.chauffeurAvailability;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    let split: ReturnType<typeof revealLines> = null;
    const ctx = gsap.context(() => {
      split = revealLines(root.querySelector(".avail-title"), { start: "top 78%" });
      revealStagger(gsap.utils.toArray<HTMLElement>(".avail-point"), {
        from: "left",
        start: "top 78%",
        trigger: root,
      });
    }, root);
    return () => {
      split?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-[color:var(--surface-black)] py-[var(--section-space)]"
    >
      <div className="relative mx-auto grid max-w-[var(--container-max)] items-center gap-12 px-[var(--page-gutter)] lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-full ring-1 ring-champagne/40 shadow-[var(--shadow-luxe)] md:w-52 lg:mx-0">
          <img
            src={poster.src}
            alt={poster.alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: poster.objectPositionDesktop }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        <div>
          <div className="eyebrow text-champagne">Always Available</div>
          <h2 className="avail-title mt-4 max-w-xl font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.05] text-off-white">
            Around the clock,
            <span className="block italic text-champagne">every mile of the way.</span>
          </h2>
          <div className="mt-9 grid gap-6 sm:grid-cols-3">
            {POINTS.map((p) => (
              <div key={p.t} className="avail-point">
                <h3 className="font-display text-base text-off-white">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-off-white/65">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
