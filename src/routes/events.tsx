import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { IMAGES } from "@/lib/image-map";
import { LeadForm } from "@/components/lead-form";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { pageMeta } from "@/lib/seo";

const heroImg = IMAGES.events;

export const Route = createFileRoute("/events")({
  head: () =>
    pageMeta({
      title: "Event & Wedding Transportation — LCT Universal",
      description:
        "Coordinated luxury fleets for weddings, galas, premieres and corporate functions — planned to the minute.",
      ogTitle: "Event Transportation — LCT Universal",
      ogDescription: "Coordinated luxury fleets for weddings, galas and premieres.",
      path: "/events",
    }),
  component: Events,
});

// Each moment uses a source photo not used anywhere else on this page — the
// hero (IMAGES.events, stadium/venue district) is deliberately excluded from
// this pool so it never repeats inside the filmstrip below it.
const MOMENTS = [
  {
    t: "Weddings & Ceremonies",
    d: "Coordinated fleets for wedding parties and guests, managed by one event coordinator.",
    image: IMAGES.chauffeur.src,
    alt: "LCT Universal chauffeur opening the door for a wedding party arrival",
    position: "50% 15%",
  },
  {
    t: "Galas & Premieres",
    d: "Red-carpet arrivals, guest fleets, and staged departures.",
    image: IMAGES.chauffeurPortrait.src,
    alt: "LCT Universal chauffeur with an executive sedan for a red-carpet gala arrival",
    position: "60% 20%",
  },
  {
    t: "Corporate Events",
    d: "Delegation shuttles, off-sites, and multi-vehicle logistics.",
    image: IMAGES.fleetCoach.src,
    alt: "LCT Universal executive coach bus for corporate delegation shuttles",
    position: "20% 50%",
  },
  {
    t: "Multi-Day Programs",
    d: "Retreats, conferences, and multi-city itineraries.",
    image: IMAGES.cockpit.src,
    alt: "Executive vehicle on the highway, en route between multi-city event stops",
    position: "70% 60%",
  },
] as const;

function Events() {
  const stripRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(".event-moment", {
        y: 30,
        scale: 0.94,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: strip, start: "top 82%" },
      });
    }, strip);
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Events & Weddings"
        title="Choreographed to the minute."
        description="Guest shuttles to staged departures — LCT designs the plan around your run of show."
        image={heroImg.src}
        imagePosition={heroImg.objectPositionDesktop}
        imagePositionMobile={heroImg.objectPositionMobile}
      />

      {/* Primary conversion action — a single-vehicle event ride can be
          booked instantly; the coordinated multi-vehicle request form below
          is the secondary path for larger programs. */}
      <div className="relative z-[5] mx-auto -mt-8 flex max-w-[var(--container-max)] justify-center px-6 pb-4 lg:px-10">
        <Link
          to="/book"
          data-cursor="book"
          className="group inline-flex items-center gap-2 rounded-sm bg-gold-gradient px-7 py-3.5 text-xs font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110"
        >
          Book Your Ride
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>

      {/* Signature interaction — a native horizontal filmstrip (drag to browse), not a static card grid */}
      <section className="py-20 md:py-28">
        <div className="mx-auto mb-8 max-w-[var(--container-max)] px-6 lg:px-10">
          <span className="eyebrow">Drag to explore</span>
        </div>
        <div
          ref={stripRef}
          data-cursor="drag"
          className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:px-10"
        >
          {MOMENTS.map((m) => (
            <div
              key={m.t}
              className="event-moment relative aspect-[3/4] w-[78vw] shrink-0 snap-start overflow-hidden rounded-sm sm:w-[46vw] lg:w-[26vw]"
            >
              <img
                src={m.image}
                alt={m.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: m.position }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl text-off-white">{m.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-off-white/75">{m.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-onyx py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <SectionHeading
            align="center"
            eyebrow="Event Request"
            title={
              <>
                Plan your <span className="italic text-gold-gradient">event transportation.</span>
              </>
            }
          />
          <div className="mt-12">
            <LeadForm
              formType="event"
              submitLabel="Request Event Transportation"
              description={
                <>
                  For live pricing and instant confirmation with an exact pickup address, use{" "}
                  <Link to="/book" className="text-gold underline underline-offset-2">
                    Book Now
                  </Link>
                  . This form is for multi-stop or multi-day event programs our team will design
                  with you directly.
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
                { name: "phone", label: "Phone", type: "tel", colSpan: 1 },
                { name: "companyName", label: "Company / Organization", colSpan: 1 },
                {
                  name: "tripType",
                  label: "Event Type",
                  type: "select",
                  colSpan: 2,
                  options: [
                    "Wedding",
                    "Gala / Premiere",
                    "Corporate Event",
                    "Multi-day Program",
                    "Other",
                  ],
                },
                {
                  name: "pickupDateTime",
                  label: "Event Date & Time",
                  type: "datetime-local",
                  colSpan: 2,
                },
                {
                  name: "additionalStops",
                  label: "Venue(s) / Stops",
                  type: "textarea",
                  rows: 3,
                  colSpan: 2,
                  placeholder: "Primary venue plus any additional stops.",
                },
                { name: "passengers", label: "Total Passengers", type: "number", colSpan: 1 },
                {
                  name: "vehiclePreference",
                  label: "Vehicle Preference",
                  type: "select",
                  colSpan: 1,
                  options: [
                    "Executive Sedan",
                    "Executive SUV",
                    "Luxury SUV",
                    "Executive Sprinter",
                    "Mini Coach",
                    "Motor Coach",
                    "Mixed Fleet",
                    "No preference",
                  ],
                },
                {
                  name: "specialRequests",
                  label: "Details of the Program",
                  type: "textarea",
                  rows: 4,
                  colSpan: 2,
                  placeholder: "Run of show, guest counts, staged arrivals…",
                },
              ]}
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
