import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { ArrowRight, ShieldCheck, BadgeCheck, HandHeart, Compass } from "lucide-react";
import { COMPANY, CONTACT } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealClipImage, revealLines } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageMeta({
      title: "About Us — LCT Universal Executive Transports",
      description: `LCT Universal Executive Transports — premium chauffeured transportation in ${CONTACT.serviceRegion}, founded ${COMPANY.foundedYear}.`,
      ogTitle: "About LCT Universal",
      ogDescription: `Premium chauffeured transportation in ${CONTACT.serviceRegion}.`,
      path: "/about",
    }),
  component: About,
});

const VALUES = [
  { Icon: ShieldCheck, t: "Discretion", d: "What happens in our vehicles stays there." },
  { Icon: BadgeCheck, t: "Excellence", d: "Every detail, every time." },
  { Icon: HandHeart, t: "Service", d: "A concierge mindset in every interaction." },
  { Icon: Compass, t: "Craft", d: "Doing one thing extraordinarily well." },
] as const;

function About() {
  const hero = IMAGES.about;
  const portrait = IMAGES.aboutPortrait;
  const portraitRef = useRef<HTMLImageElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { gsap } = ensureGsap();
    const reduce = prefersReducedMotion();
    let split: ReturnType<typeof revealLines> = null;
    const ctx = gsap.context(() => {
      // Editorial portrait + typography handoff — the page's signature interaction.
      revealClipImage(portraitRef.current, { edge: "up", start: "top 75%", duration: 1.2 });
      split = revealLines(missionRef.current?.querySelector(".about-mission-title") ?? null, {
        start: "top 72%",
      });
      gsap.from(".about-mission-desc", {
        autoAlpha: 0,
        y: 16,
        duration: 0.7,
        delay: 0.2,
        ease: "power2.out",
        scrollTrigger: { trigger: missionRef.current, start: "top 72%" },
      });

      if (!reduce && valuesRef.current) {
        gsap.from(Array.from(valuesRef.current.children), {
          autoAlpha: 0,
          y: 12,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: valuesRef.current, start: "top 88%" },
        });
      }
    });
    return () => {
      split?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our Story"
        title="A quiet standard, kept."
        description={`Founded ${COMPANY.foundedYear} to elevate luxury ground transportation across ${CONTACT.serviceRegion}.`}
        image={hero.src}
      />

      <section className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] py-24">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <img
            ref={portraitRef}
            src={portrait.src}
            alt={portrait.alt}
            loading="lazy"
            className="rounded-sm shadow-luxe"
            style={{ objectPosition: portrait.objectPositionDesktop }}
          />
          <div ref={missionRef}>
            <div className="eyebrow">Mission</div>
            <h2 className="about-mission-title mt-4 font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
              The private mode of travel.
            </h2>
            <p className="about-mission-desc mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              From boardrooms to weddings, LCT Universal operates as a silent partner — solving
              the transportation question so completely you forget it was ever asked.
            </p>
          </div>
        </div>
      </section>

      {/* Values — an inline typographic sequence, deliberately not another Mission/Vision/Values card grid */}
      <section className="border-t border-border bg-onyx py-20">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
          <div
            ref={valuesRef}
            className="flex flex-col divide-y divide-border/50 lg:flex-row lg:divide-x lg:divide-y-0"
          >
            {VALUES.map(({ Icon, t, d }) => (
              <div key={t} className="flex flex-1 items-start gap-4 py-6 lg:flex-col lg:gap-3 lg:px-8 lg:py-0 first:lg:pl-0">
                <Icon className="h-6 w-6 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
                <div>
                  <h3 className="font-display text-xl text-foreground">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Quiet closing CTA — About has no conversion path otherwise; kept
              understated (text link, not a gold button) to match the page's
              restrained editorial tone. */}
          <div className="mt-14 flex justify-center border-t border-border/50 pt-10">
            <Link
              to="/book"
              data-cursor="book"
              className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-champagne transition hover:text-gold"
            >
              Reserve your ride
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
