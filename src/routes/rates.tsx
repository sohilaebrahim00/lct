import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { ArrowRight, Users, Briefcase } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { RATES, VERIFIED_LIVE_VEHICLE_CLASSES, CONTACT } from "@/lib/site-data";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealStagger } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/rates")({
  head: () =>
    pageMeta({
      title: "Rates & Pricing — LCT Universal Executive Transports",
      description:
        "Vehicle classes and how pricing works at LCT Universal — exact rates are calculated instantly through our live booking system by vehicle, distance, and service type.",
      ogTitle: "Rates & Pricing — LCT Universal",
      ogDescription: "See vehicle classes. Get your exact rate through live booking.",
      path: "/rates",
    }),
  component: Rates,
});

function Rates() {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      revealStagger(Array.from(grid.children), { from: "up", amount: 0.06, start: "top 85%", trigger: grid });
    }, grid);
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Rates & Pricing"
        title="Priced at the moment you book."
        description="Every fare reflects the real vehicle, distance, and service type of your trip — calculated instantly through our live booking system, not a generic hourly guess."
      />

      <section className="mx-auto max-w-[var(--container-max)] px-6 pb-8 lg:px-10">
        <SectionHeading
          eyebrow="Vehicle Classes"
          title={
            <>
              Verified classes, <span className="italic text-gold-gradient">live availability.</span>
            </>
          }
          description="Every class below is confirmed directly from our live reservation system — not an estimate. Passenger capacity and current live rate are shown; your exact fare depends on the specifics of your trip."
        />

        <div ref={gridRef} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERIFIED_LIVE_VEHICLE_CLASSES.map((v) => (
            <div
              key={v.name}
              className="rounded-sm border border-border/60 bg-[color:var(--surface-elevated)]/40 p-6"
            >
              <div className="font-display text-xl text-foreground">{v.name}</div>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-champagne" aria-hidden />
                  {v.pax} passengers
                </span>
                {v.bags != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-champagne" aria-hidden />
                    {v.bags} bags
                  </span>
                )}
              </div>
              <div className="mt-4 font-display text-lg text-gold-gradient">{v.priceLabel}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{RATES.pricingCaveat}</p>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-6 py-16 lg:px-10">
        <div className="grid gap-10 border-y border-border py-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl text-foreground">How pricing works</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {RATES.disclaimer}
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-foreground">Airport transfers</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{RATES.airportNote}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-onyx py-24">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
          <h2 className="font-display text-3xl leading-tight text-off-white md:text-5xl">
            Get your exact rate.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-off-white/70 md:text-base">
            Enter your pickup, drop-off, and vehicle preference — our live booking system returns
            a confirmed fare in seconds.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/book"
              data-cursor="book"
              className="group inline-flex items-center gap-3 rounded-full bg-gold-gradient px-8 py-4 text-sm font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:scale-[1.02] hover:brightness-110"
            >
              Check Live Rates
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden />
            </Link>
            <a
              href={CONTACT.phoneTel}
              className="inline-flex items-center gap-2 rounded-sm border border-champagne/40 px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-off-white transition hover:border-champagne hover:text-champagne"
            >
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
