import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { ArrowRight, Plane, UserCheck, Luggage, DoorOpen } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { LeadForm } from "@/components/lead-form";
import { BOOKING_VEHICLE_OPTIONS, CONTACT } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/airport")({
  head: () => ({
    ...pageMeta({
      title: "DFW Airport Transportation — LCT Universal",
      description: `Meet & greet, flight tracking, and luxury airport transfers across ${CONTACT.serviceRegion}.`,
      ogTitle: "Airport Transfers — LCT Universal",
      ogDescription: "Meet & greet, flight tracking, effortless door-to-door.",
      path: "/airport",
      image: IMAGES.airportGateway.src,
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Airport Transportation",
          provider: { "@type": "LocalBusiness", name: "LCT Universal Executive Transports" },
          areaServed: CONTACT.serviceRegion,
          description: `Meet & greet, flight tracking, and luxury airport transfers across ${CONTACT.serviceRegion}.`,
        }),
      },
    ],
  }),
  component: Airport,
});

const STAGES = [
  { icon: Plane, label: "Arrival", d: "Your flight lands — we track it in real time and adjust the pickup." },
  { icon: UserCheck, label: "Meet", d: "A uniformed chauffeur waits with a signed placard at baggage claim or curbside." },
  { icon: Luggage, label: "Assist", d: "Luggage handled, cabin temperature set, water ready before you sit down." },
  { icon: DoorOpen, label: "Depart", d: "Straight to your destination — no queues, no ride-share app, no waiting." },
] as const;

function Airport() {
  const hero = IMAGES.airportGateway;
  const journeyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = journeyRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.set(".airport-route-line", { scaleX: 0 });
      gsap.to(".airport-route-line", {
        scaleX: 1,
        duration: 1.1,
        ease: "power2.inOut",
        scrollTrigger: { trigger: root, start: "top 75%" },
      });
      gsap.utils.toArray<HTMLElement>(".airport-stage").forEach((stage, i) => {
        gsap.from(stage, {
          autoAlpha: 0,
          y: 24,
          duration: 0.6,
          delay: i * 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 78%" },
        });
        gsap.from(stage.querySelector(".airport-stage-marker"), {
          scale: 0,
          duration: 0.45,
          delay: i * 0.12 + 0.25,
          ease: "back.out(2.2)",
          scrollTrigger: { trigger: root, start: "top 78%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Airport Transfers"
        title="The airport, without the airport."
        description={`Curbside pickup to full meet-and-greet at baggage claim across ${CONTACT.serviceRegionShort}.`}
        image={hero.src}
        imagePosition={hero.objectPositionDesktop}
        imagePositionMobile={hero.objectPositionMobile}
      />

      <div className="relative z-[5] mx-auto -mt-8 flex max-w-[var(--container-max)] justify-center px-[var(--page-gutter)] pb-4">
        <Link
          to="/book"
          data-cursor="book"
          className="group inline-flex items-center gap-2 rounded-sm bg-gold-gradient px-7 py-3.5 text-xs font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110"
        >
          Book Airport Transfer
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>

      {/* Signature interaction — a route-line arrival journey, not a card grid */}
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] py-20 md:py-28">
        <div ref={journeyRef} className="relative">
          <div className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {/* Connector — a plain div pinned exactly to the marker's vertical
                center (half of h-14/56px), avoiding SVG percentage-height math. */}
            <div
              className="airport-route-line pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden h-px origin-left bg-gold-gradient md:block"
              aria-hidden
            />
            {STAGES.map(({ icon: Icon, label, d }) => (
              <div key={label} className="airport-stage relative flex flex-col items-start md:items-center md:text-center">
                <div className="airport-stage-marker relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-background text-gold shadow-[var(--shadow-gold)]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-2xl text-foreground">{label}</h3>
                <p className="mt-2 max-w-[22ch] text-sm leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-onyx py-24">
        <div className="mx-auto max-w-3xl px-[var(--page-gutter)]">
          <SectionHeading
            align="center"
            eyebrow="Flight Details"
            title={
              <>
                Send your <span className="italic text-gold-gradient">flight details.</span>
              </>
            }
          />
          <div className="mt-12">
            <LeadForm
              formType="airport"
              submitLabel="Request Airport Transfer"
              description={
                <>
                  For live pricing and instant confirmation with your exact pickup and drop-off
                  addresses, use{" "}
                  <Link to="/book" className="text-gold underline underline-offset-2">
                    Book Now
                  </Link>
                  . This form is for flight-detail requests our team will confirm by phone or email.
                </>
              }
              fields={[
                { name: "customerName", label: "Full Name", required: true, colSpan: 1 },
                {
                  name: "customerEmail",
                  label: "Email",
                  type: "email",
                  required: true,
                  colSpan: 1,
                },
                { name: "phone", label: "Phone", type: "tel", colSpan: 2 },
                {
                  name: "tripType",
                  label: "Direction",
                  type: "select",
                  colSpan: 2,
                  options: [
                    "Airport Pickup (arrival)",
                    "Airport Drop-off (departure)",
                    "Round Trip",
                  ],
                },
                {
                  name: "flightNumber",
                  label: "Flight Number",
                  colSpan: 1,
                  placeholder: "e.g. AA100",
                },
                { name: "airline", label: "Airline", colSpan: 1 },
                {
                  name: "pickupDateTime",
                  label: "Pickup Date & Time",
                  type: "datetime-local",
                  colSpan: 2,
                },
                { name: "passengers", label: "Passengers", type: "number", colSpan: 1 },
                { name: "luggage", label: "Luggage", type: "number", colSpan: 1 },
                {
                  name: "vehiclePreference",
                  label: "Vehicle Preference",
                  type: "select",
                  colSpan: 2,
                  options: [...BOOKING_VEHICLE_OPTIONS],
                },
                {
                  name: "specialRequests",
                  label: "Notes for the Chauffeur",
                  type: "textarea",
                  rows: 3,
                  colSpan: 2,
                },
              ]}
              toggles={[{ name: "meetAndGreet", label: "Add meet & greet at baggage claim" }]}
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
