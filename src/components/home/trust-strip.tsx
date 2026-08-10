import { Fragment, useLayoutEffect, useRef } from "react";
import { TRUST_BADGES } from "@/lib/site-data";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";

const [bbb, gnet, nla] = TRUST_BADGES;

const CREDENTIALS = [
  {
    badge: bbb,
    label: "BBB",
    sub: "Accredited Business",
    // mobile → tablet → desktop: 72px → 76px → 88px (targets: 70–80 / — / 82–92)
    sizeClass: "h-[4.5rem] max-w-[184px] sm:h-[4.75rem] sm:max-w-[200px] md:h-[5.5rem] md:max-w-[236px]",
    // Independent drift per badge — different amplitude/duration/phase so
    // the three never move in visible sync.
    drift: { y: 4, x: 2, duration: 6.4, delay: 0 },
  },
  {
    badge: gnet,
    label: "GNET",
    sub: "Proud Member",
    // 76px → 80px → 96px (targets: 74–84 / — / 88–100)
    sizeClass: "h-[4.75rem] max-w-[104px] sm:h-20 sm:max-w-[108px] md:h-24 md:max-w-[118px]",
    drift: { y: -5, x: 3, duration: 7.2, delay: 0.45 },
  },
  {
    // NLA now uses the same flood-fill transparent derivative as the
    // dark-context BadgeMark (About/footer) — verified clean on the ivory
    // background too (its real art was designed for a light page, so it
    // reads with MORE contrast here than it ever did on black). The white
    // "credential plate" from the prior round is removed entirely per the
    // client's explicit instruction — no box/canvas of any kind now.
    badge: nla,
    label: "NLA",
    sub: "Proud Member",
    sizeClass: "h-[4.75rem] max-w-[92px] sm:h-20 sm:max-w-[96px] md:h-24 md:max-w-[108px]",
    drift: { y: 3, x: -3, duration: 5.6, delay: 0.9 },
  },
] as const;

const CHARCOAL = "oklch(0.14 0.005 60)";
const CHARCOAL_SOFT = "oklch(0.34 0.01 60)";
const IVORY = "#F6F3EA";
const DIVIDER = "oklch(0.55 0.03 80 / 0.28)";

/**
 * Homepage trust strip — premium motion refinement (2026-08-08) of the
 * §1c-23 ivory "credentials band" rewrite. Same light institutional
 * composition, one unified 3-column layout that stacks on mobile and rows
 * up from `sm:` (a single divider element switches orientation via
 * responsive classes rather than duplicating the layout) — this pass makes
 * the three marks larger, fully transparent (NLA's white plate removed —
 * the existing flood-fill derivative already reads cleanly on ivory), and
 * gives each an independent, near-subconscious floating drift instead of
 * sitting perfectly static. Entrance (heading → accent line → staggered
 * logo rise) plays once on scroll-in via a single GSAP timeline; its
 * `onComplete` starts the idle drift so there is no visible seam between
 * "arriving" and "settling." Transform/opacity only throughout — no layout
 * properties animated. Mobile keeps the same entrance and drift, just at a
 * reduced ~±2px amplitude (checked via `matchMedia` at mount).
 */
export function TrustStrip() {
  const rootRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);
  const logoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const driftTweens = useRef<(gsap.core.Tween | null)[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const logos = logoRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;

    const ctx = gsap.context(() => {
      const startIdleDrift = () => {
        logos.forEach((el, i) => {
          const d = CREDENTIALS[i].drift;
          const amp = isDesktop ? 1 : 0.4; // mobile: ~±2px only, per spec
          driftTweens.current[i] = gsap.to(el, {
            y: `+=${d.y * amp}`,
            x: `+=${d.x * amp}`,
            duration: d.duration,
            delay: d.delay,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      };

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 88%", toggleActions: "play none none reverse" },
        onComplete: startIdleDrift,
      });

      tl.from(headingRef.current, { autoAlpha: 0, y: 10, duration: 0.5, ease: "power2.out" })
        .fromTo(accentRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, "-=0.2")
        .from(logos, { autoAlpha: 0, y: 16, duration: 0.55, ease: "power2.out", stagger: 0.12 }, "-=0.15");
    }, root);

    return () => {
      driftTweens.current.forEach((t) => t?.kill());
      ctx.revert();
    };
  }, []);

  const pause = (i: number) => driftTweens.current[i]?.pause();
  const resume = (i: number) => driftTweens.current[i]?.play();

  return (
    <section ref={rootRef} className="relative overflow-hidden py-8 md:py-9" style={{ backgroundColor: IVORY }}>
      {/* Hero (black) → ivory band seam — a solid hairline reads on both sides. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-deep/60" aria-hidden />
      {/* Ivory band → next dark section seam. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gold-deep/45" aria-hidden />

      <div className="relative mx-auto max-w-[1040px] px-[var(--page-gutter)] text-center">
        <div>
          <span
            ref={headingRef}
            className="inline-block text-[0.7rem] font-medium uppercase tracking-[0.3em]"
            style={{ color: CHARCOAL }}
          >
            Trust &amp; Accreditations
          </span>
          <span
            ref={accentRef}
            className="mx-auto mt-2 block h-px w-10 origin-center"
            style={{ backgroundColor: "var(--gold-deep)" }}
            aria-hidden
          />
        </div>

        {/* Stacked on mobile, one row from `sm:` up — a single divider element
            switches orientation via responsive classes. */}
        <div className="mt-6 flex flex-col items-center sm:mt-7 sm:flex-row sm:justify-center sm:gap-8 md:gap-14">
          {CREDENTIALS.map((c, i) => (
            <Fragment key={c.label}>
              {i > 0 && (
                <span
                  className="my-4 h-px w-16 sm:my-0 sm:mr-8 sm:h-12 sm:w-px md:mr-14"
                  style={{ backgroundColor: DIVIDER }}
                  aria-hidden
                />
              )}
              <div
                className="group flex flex-col items-center gap-3"
                onMouseEnter={() => pause(i)}
                onMouseLeave={() => resume(i)}
              >
                <div
                  ref={(el) => {
                    logoRefs.current[i] = el;
                  }}
                  className="relative flex items-center justify-center"
                >
                  <div
                    className="pointer-events-none absolute -inset-4 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle, color-mix(in oklab, var(--gold) 26%, transparent), transparent 72%)",
                    }}
                    aria-hidden
                  />
                  <img
                    src={c.badge.src}
                    alt={c.badge.name}
                    loading="lazy"
                    className={`relative w-auto object-contain transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.035] ${c.sizeClass}`}
                  />
                </div>
                <div className="text-[0.7rem] leading-tight tracking-[0.04em]">
                  <span className="font-semibold" style={{ color: CHARCOAL }}>{c.label}</span>{" "}
                  <span style={{ color: CHARCOAL_SOFT }}>{c.sub}</span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
