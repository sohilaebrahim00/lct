import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "@/lib/image-map";
import { LeadForm } from "@/components/lead-form";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { pageMeta } from "@/lib/seo";
import { CONTACT } from "@/lib/site-data";

type ServiceChapter = {
  id: string;
  title: string;
  desc: string;
  cta: string;
  to: "/book" | "/contact" | "/fleet" | "/corporate" | "/events";
  image: { src: string; alt: string; position: string };
};

const CHAPTERS: ServiceChapter[] = [
  {
    id: "airport",
    title: "Airport Transportation",
    desc: "Flight-timed pickups across DFW — curbside or full meet-and-greet at baggage claim.",
    cta: "Book Airport Transfer",
    to: "/book",
    image: { src: IMAGES.airport.src, alt: IMAGES.airport.alt, position: "58% 55%" },
  },
  {
    id: "corporate",
    title: "Corporate Transportation",
    desc: "Dedicated account management and priority dispatch for executive travel.",
    cta: "Plan Corporate Transportation",
    to: "/corporate",
    image: { src: IMAGES.chauffeur.src, alt: IMAGES.chauffeur.alt, position: "45% 20%" },
  },
  {
    id: "event",
    title: "Event Transportation",
    desc: "Coordinated arrivals and departures for weddings, galas and premieres.",
    cta: "Plan Event Transportation",
    to: "/events",
    image: { src: IMAGES.events.src, alt: IMAGES.events.alt, position: "30% 45%" },
  },
  {
    id: "group",
    title: "Group Transportation",
    desc: "Sprinters and coaches coordinated for teams, delegations and large parties.",
    cta: "Request Group Transportation",
    to: "/fleet",
    // Client-supplied Group Transportation image (2026-08-08), cropped to
    // exclude a standing chauffeur that distracted from the vehicle —
    // see `groupCoachStoryCropped` in image-map.ts for the crop rationale.
    // Not `fleetCoach`/`fleetCoachJourney` — those are the smaller Mini
    // Coach, and this section is meant to represent the full-size coach.
    image: {
      src: IMAGES.groupCoachStoryCropped.src,
      alt: IMAGES.groupCoachStoryCropped.alt,
      position: "50% 42%",
    },
  },
  {
    id: "private",
    title: "Private Transportation",
    desc: "Point-to-point, hourly, or as-directed — one chauffeur, complete discretion.",
    cta: "Reserve an Executive Vehicle",
    to: "/book",
    image: { src: IMAGES.chauffeurPortrait.src, alt: IMAGES.chauffeurPortrait.alt, position: "35% 25%" },
  },
  {
    id: "family",
    title: "Family Transportation",
    desc: "Child car seats available on request, with room for the whole party.",
    cta: "Request Family Transportation",
    to: "/contact",
    image: { src: IMAGES.fleetSuv.src, alt: IMAGES.fleetSuv.alt, position: "55% 45%" },
  },
];

export const Route = createFileRoute("/services")({
  head: () => ({
    ...pageMeta({
      title: "Services — LCT Universal Executive Transports",
      description:
        "Airport, corporate, event, group, private and family transportation from LCT Universal in Dallas–Fort Worth.",
      ogTitle: "Services — LCT Universal",
      ogDescription: "A private mode of travel for every occasion.",
      path: "/services",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Chauffeured Transportation",
          provider: { "@type": "LocalBusiness", name: "LCT Universal Executive Transports" },
          areaServed: CONTACT.serviceRegion,
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "LCT Universal Services",
            itemListElement: CHAPTERS.map((s, i) => ({
              "@type": "Offer",
              position: i + 1,
              itemOffered: { "@type": "Service", name: s.title, description: s.desc },
            })),
          },
        }),
      },
    ],
  }),
  component: Services,
});

function Services() {
  const rootRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;
    const reduce = prefersReducedMotion();
    const { gsap, ScrollTrigger } = ensureGsap();

    const ctx = gsap.context(() => {
      // Entrance
      gsap.from(".services-intro > *", {
        y: 20,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
      });

      if (reduce) {
        gsap.set(".service-media-layer", { autoAlpha: (i) => (i === 0 ? 1 : 0) });
        return;
      }

      const layers = gsap.utils.toArray<HTMLElement>(".service-media-layer");
      const chapters = gsap.utils.toArray<HTMLElement>(".service-chapter");

      chapters.forEach((chapter, i) => {
        gsap.from(chapter, {
          autoAlpha: 0,
          y: 28,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: chapter, start: "top 80%" },
        });

        const activate = () => {
          layers.forEach((l, li) =>
            gsap.to(l, { autoAlpha: li === i ? 1 : 0, duration: 0.6, ease: "power2.inOut" }),
          );
          chapters.forEach((c, ci) =>
            gsap.to(c.querySelector(".service-chapter-title"), {
              color:
                ci === i
                  ? "var(--champagne)"
                  : "var(--foreground)",
              duration: 0.4,
            }),
          );
        };

        ScrollTrigger.create({
          trigger: chapter,
          start: "top 55%",
          end: "bottom 55%",
          onEnter: activate,
          onEnterBack: activate,
        });
      });

      // Animated gold progress rail — the signature device for this page,
      // deliberately not the large-numeral treatment used in PinnedStories.
      gsap.set(".services-rail-fill", { scaleY: 0, transformOrigin: "top" });
      gsap.to(".services-rail-fill", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: list, start: "top 55%", end: "bottom 55%", scrub: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <section ref={rootRef} className="pt-32 pb-16 md:pt-44">
        <div className="services-intro mx-auto max-w-3xl px-6 text-center lg:px-10">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/60" />
            <span className="eyebrow">Services</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
            One standard, six occasions.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Every LCT vehicle and chauffeur meets the same measure, whichever service brings you
            to us.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-[var(--container-max)] gap-4 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-10">
          <div ref={listRef} className="relative">
            {/* Progress rail — animated fill, the page's signature device */}
            <div className="absolute -left-5 top-2 bottom-2 hidden w-px bg-border/60 lg:block">
              <div className="services-rail-fill absolute inset-0 bg-gold-gradient" />
            </div>

            {CHAPTERS.map((c) => (
              <div
                key={c.id}
                className="service-chapter flex min-h-[62vh] flex-col justify-center border-b border-border/50 py-10 last:border-b-0 lg:min-h-[70vh]"
              >
                <h2 className="service-chapter-title font-display text-3xl leading-tight transition-colors duration-500 md:text-5xl">
                  {c.title}
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                  {c.desc}
                </p>
                <Link
                  to={c.to}
                  data-cursor={c.to === "/book" ? "book" : "explore"}
                  className="group mt-8 inline-flex w-fit items-center gap-2 rounded-sm border border-gold/40 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-foreground transition hover:border-gold hover:text-gold"
                >
                  {c.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* Sticky editorial media — cross-fades between chapters as the index scrolls past */}
          <div className="relative hidden lg:block">
            <div className="sticky top-28 aspect-[4/5] w-full overflow-hidden rounded-sm luxe-card">
              {CHAPTERS.map((c, i) => (
                <img
                  key={c.id}
                  src={c.image.src}
                  alt={c.image.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="service-media-layer absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: c.image.position, opacity: i === 0 ? 1 : 0 }}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Mobile: full-width image per chapter, no sticky/pinning */}
          <div className="grid gap-4 lg:hidden">
            {CHAPTERS.map((c) => (
              <img
                key={c.id}
                src={c.image.src}
                alt={c.image.alt}
                loading="lazy"
                className="aspect-[3/2] w-full rounded-sm object-cover"
                style={{ objectPosition: c.image.position }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-onyx py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <SectionHeading
            align="center"
            eyebrow="Service Inquiry"
            title={
              <>
                Ask about a <span className="italic text-gold-gradient">specific service.</span>
              </>
            }
            description="Not sure which service fits? Send us the details and our concierge will guide you."
          />
          <div className="mt-12">
            <LeadForm
              formType="service_inquiry"
              submitLabel="Send Service Inquiry"
              fields={[
                { name: "customerName", label: "Full Name", required: true, colSpan: 1 },
                { name: "customerEmail", label: "Email", type: "email", required: true, colSpan: 1 },
                { name: "phone", label: "Phone", type: "tel", colSpan: 2 },
                {
                  name: "tripType",
                  label: "Service of Interest",
                  type: "select",
                  colSpan: 2,
                  options: CHAPTERS.map((s) => s.title),
                },
                { name: "pickupDateTime", label: "Preferred Date & Time (if known)", type: "datetime-local", colSpan: 2 },
                { name: "specialRequests", label: "Tell us about your needs", type: "textarea", rows: 4, colSpan: 2 },
              ]}
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
