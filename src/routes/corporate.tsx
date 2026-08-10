import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { ArrowRight, Briefcase, TrendingUp, Users, Building2 } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { pageMeta } from "@/lib/seo";

const chauffeurImg = IMAGES.corporate;

export const Route = createFileRoute("/corporate")({
  head: () => ({
    ...pageMeta({
      title: "Corporate Transportation Dallas — LCT Universal",
      description:
        "Dedicated corporate chauffeur service — executive travel, roadshows, delegations and consolidated billing.",
      ogTitle: "Corporate Transportation — LCT Universal",
      ogDescription: "A silent partner for executive travel.",
      path: "/corporate",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Corporate Transportation",
          provider: { "@type": "LocalBusiness", name: "LCT Universal Executive Transports" },
          areaServed: "Dallas–Fort Worth and Grapevine, Texas",
          description:
            "Dedicated corporate chauffeur service — executive travel, roadshows, delegations and consolidated billing.",
        }),
      },
    ],
  }),
  component: Corporate,
});

const ITINERARY = [
  { time: "7:15 AM", label: "Pickup", d: "Chauffeur waiting curbside, residence or hotel." },
  { time: "8:00 AM", label: "Board Meeting", d: "Direct arrival, no parking, no delay." },
  { time: "12:30 PM", label: "Client Lunch", d: "Same chauffeur, same vehicle, full-day continuity." },
  { time: "3:00 PM", label: "Second Meeting", d: "Waiting on standby — no re-dispatch needed." },
  { time: "6:30 PM", label: "Return", d: "Home or airport, exactly on schedule." },
] as const;

const USE_CASES = [
  { icon: Briefcase, t: "Executive Meetings", d: "Same-driver continuity across a full day." },
  { icon: TrendingUp, t: "Roadshows", d: "Multi-city coordination for IPOs and tours." },
  { icon: Users, t: "Employee Transport", d: "Recurring commutes and off-site logistics." },
  { icon: Building2, t: "Conferences", d: "Full delegation arrivals through returns." },
] as const;

function Corporate() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const useCasesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const timeline = timelineRef.current;
      if (timeline) {
        gsap.set(".corp-timeline-fill", { scaleY: 0, transformOrigin: "top" });
        gsap.to(".corp-timeline-fill", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: timeline, start: "top 65%", end: "bottom 75%", scrub: true },
        });
        gsap.utils.toArray<HTMLElement>(".corp-stop").forEach((stop, i) => {
          gsap.from(stop, {
            autoAlpha: 0,
            x: -16,
            duration: 0.5,
            delay: i * 0.05,
            ease: "power2.out",
            scrollTrigger: { trigger: stop, start: "top 82%" },
          });
        });
      }
      if (useCasesRef.current) {
        gsap.from(Array.from(useCasesRef.current.children), {
          autoAlpha: 0,
          y: 16,
          stagger: 0.06,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: useCasesRef.current, start: "top 88%" },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Corporate"
        title="A silent partner for executive travel."
        description="Dedicated account management, consolidated billing, and priority dispatch."
        image={chauffeurImg.src}
        imagePosition={chauffeurImg.objectPositionDesktop}
        imagePositionMobile={chauffeurImg.objectPositionMobile}
        imageEdge="diagonal"
      />

      {/* Primary conversion action — a single corporate trip can be booked
          instantly; opening a formal account (below) is the separate,
          longer-lead-time path. */}
      <div className="relative z-[5] mx-auto -mt-8 flex max-w-[var(--container-max)] justify-center px-[var(--page-gutter)] pb-4">
        <Link
          to="/book"
          data-cursor="book"
          className="group inline-flex items-center gap-2 rounded-sm bg-gold-gradient px-7 py-3.5 text-xs font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110"
        >
          Book Corporate Transportation
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>

      {/* Signature interaction — an illustrative day's itinerary, a vertical timeline distinct from Airport's horizontal route */}
      <section className="mx-auto max-w-[var(--container-max)] px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="A Day With LCT"
              title={
                <>
                  Designed for <span className="italic text-gold-gradient">how businesses move.</span>
                </>
              }
              description="An illustrative schedule — every itinerary is built around your actual day."
            />
            <div ref={timelineRef} className="relative mt-10 pl-8">
              <div className="absolute left-[3px] top-1 bottom-1 w-px bg-border/60">
                <div className="corp-timeline-fill absolute inset-0 bg-gold-gradient" />
              </div>
              <div className="space-y-8">
                {ITINERARY.map((stop) => (
                  <div key={stop.label} className="corp-stop relative">
                    <span className="absolute -left-8 top-1 h-2 w-2 rounded-full bg-gold" aria-hidden />
                    <div className="eyebrow text-[0.6rem] text-champagne">{stop.time}</div>
                    <h3 className="mt-1 font-display text-xl text-foreground">{stop.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{stop.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={useCasesRef} className="grid gap-3 sm:grid-cols-2 lg:pt-24">
            {USE_CASES.map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-sm border border-border/60 p-5">
                <Icon className="h-6 w-6 text-gold" aria-hidden />
                <h3 className="mt-3 font-display text-lg">{t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-onyx py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <SectionHeading
            align="center"
            eyebrow="Corporate Request"
            title={
              <>
                Open a <span className="italic text-gold-gradient">corporate account.</span>
              </>
            }
            description="Submit a request and a dedicated LCT account manager will contact you to design your program."
          />
          <div className="mt-12">
            <LeadForm
              formType="corporate"
              submitLabel="Request Corporate Account"
              fields={[
                { name: "companyName", label: "Company", required: true, colSpan: 1 },
                { name: "customerName", label: "Full Name", required: true, colSpan: 1 },
                {
                  name: "customerEmail",
                  label: "Business Email",
                  type: "email",
                  required: true,
                  colSpan: 1,
                },
                { name: "phone", label: "Phone", type: "tel", colSpan: 1 },
                {
                  name: "passengers",
                  label: "Estimated Monthly Rides",
                  type: "number",
                  colSpan: 1,
                },
                { name: "pickupAddress", label: "Primary Cities", colSpan: 1 },
                {
                  name: "specialRequests",
                  label: "Notes",
                  type: "textarea",
                  rows: 3,
                  colSpan: 2,
                  placeholder: "Tell us about your travel program and requirements.",
                },
              ]}
              toggles={[
                { name: "corporateBooking", label: "Yes, we operate a formal travel program" },
              ]}
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
