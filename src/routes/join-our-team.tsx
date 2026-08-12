import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Car, Building2, Users } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { IMAGES, type ImagePlacement } from "@/lib/image-map";
import { pageMeta } from "@/lib/seo";
import { prefersReducedMotion } from "@/lib/motion";
import { ClienityEmbed } from "@/components/applications/clienity-embed";

/**
 * Live production Clienity CRM forms (client-supplied 2026-08-11) — the
 * client's real application/lead pipeline for these three pathways,
 * confirmed embeddable (no X-Frame-Options/CSP frame-ancestors block, no JS
 * frame-busting) and re-verified as fully built, real forms matching the
 * old-site field sets (not placeholder/template forms — see the corporate
 * form note in PROJECT_SPEC.md §1c-34 for the one exception that was held
 * back). Clienity is the submission source of truth here; the local
 * Supabase-backed forms that previously lived in this same `applications/`
 * folder (driver-application-form.tsx etc.) were removed entirely
 * (2026-08-12, see PROJECT_SPEC.md §1c-41) rather than left disconnected —
 * they were never imported by this route or any other, per explicit client
 * instruction not to run two parallel submission pipelines for the same
 * application. Their Supabase migration/tables are untouched (not live,
 * out of scope for a UI-only cleanup).
 */
const CLIENITY_FORMS: Record<PathwayId, { url: string; minHeightMobile: number; minHeightDesktop: number }> = {
  driver: {
    url: "https://link.clienity.com/widget/form/90V5AE3Bv0Zc4R3Fz5Gg",
    minHeightMobile: 4200,
    minHeightDesktop: 3400,
  },
  "company-partner": {
    url: "https://link.clienity.com/widget/form/PgCYKPpNTV9o0Z7imXYl",
    minHeightMobile: 4350,
    minHeightDesktop: 3950,
  },
  "referral-partner": {
    url: "https://link.clienity.com/widget/form/zsxo0GHXuPQaCDAcB0vp",
    minHeightMobile: 3200,
    minHeightDesktop: 3000,
  },
};

export const Route = createFileRoute("/join-our-team")({
  head: () =>
    pageMeta({
      title: "Join Our Team — Chauffeur Careers & Partnerships — LCT Universal",
      description:
        "Chauffeur careers, transportation company partnerships, and referral partnerships with LCT Universal across Dallas–Fort Worth.",
      ogTitle: "Join Our Team — LCT Universal",
      ogDescription: "Chauffeur, partnership, and referral opportunities in Dallas–Fort Worth.",
      path: "/join-our-team",
    }),
  component: JoinOurTeam,
});

type PathwayId = "driver" | "company-partner" | "referral-partner";

const PATHWAYS: Array<{
  id: PathwayId;
  icon: typeof Car;
  title: string;
  blurb: string;
  image: ImagePlacement;
  ctaLabel: string;
}> = [
  {
    id: "driver",
    icon: Car,
    title: "Driver Application",
    blurb: "Apply to drive with LCT Universal as a professional chauffeur.",
    image: IMAGES.joinTeamDriver,
    ctaLabel: "Apply to Drive",
  },
  {
    id: "company-partner",
    icon: Building2,
    title: "Company Partners",
    blurb: "Partner your transportation company's fleet and drivers with ours.",
    image: IMAGES.joinTeamPartner,
    ctaLabel: "Apply as a Partner",
  },
  {
    id: "referral-partner",
    icon: Users,
    title: "Referral Partner",
    blurb: "Earn commissions referring clients to LCT Universal.",
    image: IMAGES.joinTeamReferral,
    ctaLabel: "Apply as a Referral Partner",
  },
];

function JoinOurTeam() {
  const [active, setActive] = useState<PathwayId | null>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const hero = IMAGES.joinTeamDriver;

  useEffect(() => {
    if (!active || !formSectionRef.current) return;
    formSectionRef.current.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, [active]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Careers & Partnerships"
        title="Join Our Team."
        description="Three professional pathways for chauffeurs, transportation partners and referral relationships."
        image={hero.src}
        imagePosition={hero.objectPositionDesktop}
        imagePositionMobile={hero.objectPositionMobile}
      />

      <section className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] py-20 md:py-28">
        <SectionHeading
          align="center"
          eyebrow="Choose a Pathway"
          title={
            <>
              Three ways to <span className="italic text-gold-gradient">work with us.</span>
            </>
          }
          description="Select the pathway that fits — each opens its own application below."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            const isActive = active === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                aria-pressed={isActive}
                className={`group relative overflow-hidden rounded-sm border text-left transition ${
                  isActive ? "border-gold shadow-[var(--shadow-gold)]" : "border-border hover:border-gold/50"
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={p.image.src}
                    alt={p.image.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    style={{ objectPosition: p.image.objectPositionDesktop }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient text-onyx">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <div className="bg-[color:var(--surface-elevated)] p-6">
                  <h3 className="font-display text-xl text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-widest text-gold">
                    {isActive ? "Application open below" : p.ctaLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {active ? (
        <section ref={formSectionRef} id="application-form" className="border-t border-border bg-onyx py-20 md:py-28 scroll-mt-24">
          <div className="mx-auto max-w-4xl px-[var(--page-gutter)]">
            <SectionHeading
              align="center"
              eyebrow={PATHWAYS.find((p) => p.id === active)?.title}
              title={
                active === "driver" ? (
                  <>
                    Apply to <span className="italic text-gold-gradient">drive.</span>
                  </>
                ) : active === "company-partner" ? (
                  <>
                    Apply as a <span className="italic text-gold-gradient">company partner.</span>
                  </>
                ) : (
                  <>
                    Apply as a <span className="italic text-gold-gradient">referral partner.</span>
                  </>
                )
              }
            />
            <div className="mt-12">
              <ClienityEmbed
                key={active}
                url={CLIENITY_FORMS[active].url}
                title={`${PATHWAYS.find((p) => p.id === active)?.title} — LCT Universal`}
                minHeightMobile={CLIENITY_FORMS[active].minHeightMobile}
                minHeightDesktop={CLIENITY_FORMS[active].minHeightDesktop}
              />
            </div>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
