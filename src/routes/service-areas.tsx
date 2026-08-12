import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, useLayoutEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { CONTACT, SERVICE_AREA_GROUPS } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { drawLine } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";
import { Scene3D } from "@/lib/three/Scene3D";

const ServiceAreasMapCanvas = lazy(() => import("@/components/service-areas/map-canvas"));

const ALL_CITIES = SERVICE_AREA_GROUPS.flatMap((g) => g.cities);

export const Route = createFileRoute("/service-areas")({
  head: () => ({
    ...pageMeta({
      title: "Service Areas — Dallas–Fort Worth Metroplex — LCT Universal",
      description: `LCT Universal provides executive chauffeur and group transportation across the Dallas–Fort Worth Metroplex — Dallas, Fort Worth, Grapevine, the Mid-Cities, and ${ALL_CITIES.length - 3} surrounding communities.`,
      ogTitle: "Service Areas — LCT Universal",
      ogDescription: "Executive transportation across the full Dallas–Fort Worth Metroplex.",
      path: "/service-areas",
    }),
    scripts: [
      {
        type: "application/ld+json",
        // A `Service` record with `areaServed` — the schema.org-correct way
        // to state geographic coverage without implying a physical branch
        // office in each city. LCT's one real location remains whatever the
        // sitewide LocalBusiness record in __root.tsx already states; this
        // does not add or imply any new address.
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Executive Chauffeur & Group Transportation",
          provider: { "@type": "LocalBusiness", name: "LCT Universal Executive Transports" },
          areaServed: ALL_CITIES.map((name) => ({ "@type": "City", name, containedInPlace: "Dallas–Fort Worth Metroplex" })),
          description: `Executive chauffeur and group transportation across ${ALL_CITIES.length} Dallas–Fort Worth Metroplex communities.`,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${CONTACT.siteUrl}/` },
            { "@type": "ListItem", position: 2, name: "Service Areas", item: `${CONTACT.siteUrl}/service-areas` },
          ],
        }),
      },
    ],
  }),
  component: ServiceAreas,
});

// Verified locations only (CONTACT.serviceRegion) — abstract diagram, not a
// literal geographic map, so relative positions are stylized, not surveyed.
const AREAS = [
  { name: "Dallas", x: 320, y: 90, note: "Downtown & business district" },
  { name: "Fort Worth", x: 60, y: 130, note: "Cultural district & downtown" },
  { name: "DFW Airport", x: 190, y: 60, note: "Terminal pickup & meet-and-greet" },
  { name: "Grapevine", x: 210, y: 30, note: "Home base — dispatch & management" },
] as const;

const ROUTES: [number, number][] = [
  [1, 2],
  [2, 3],
  [2, 0],
  [3, 0],
];

/** The exact 2D diagram used before the 3D upgrade — doubles as the `Scene3D` fallback. */
function ServiceAreasMapFallback({ activeIndex }: { activeIndex: number | null }) {
  return (
    <svg viewBox="0 0 380 170" className="w-full overflow-visible" aria-hidden>
      {ROUTES.map(([a, b], i) => (
        <line
          key={i}
          x1={AREAS[a].x}
          y1={AREAS[a].y}
          x2={AREAS[b].x}
          y2={AREAS[b].y}
          className="area-route-path"
          style={{ stroke: "var(--champagne)" }}
          strokeWidth={1.25}
          strokeLinecap="round"
          opacity={0.55}
        />
      ))}
      {AREAS.map((a, i) => (
        <g
          key={a.name}
          className="area-pin"
          transform={`translate(${a.x},${a.y}) scale(${activeIndex === i ? 1.25 : 1})`}
          style={{ transition: "transform 0.2s ease" }}
        >
          <circle r={12} fill="none" style={{ stroke: "var(--champagne)" }} strokeOpacity={0.3} strokeWidth={1} />
          <circle r={4.5} style={{ fill: "var(--champagne)" }} />
          <circle r={1.6} fill="#141210" />
          <text
            x={0}
            y={-18}
            textAnchor="middle"
            className="font-display"
            style={{ fill: "var(--foreground)", fontSize: 11 }}
          >
            {a.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ServiceAreas() {
  const hero = IMAGES.rearview;
  const mapRef = useRef<HTMLDivElement>(null);
  const groupsRef = useRef<HTMLDivElement>(null);
  const [hoveredArea, setHoveredArea] = useState<number | null>(null);

  useLayoutEffect(() => {
    const root = mapRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      drawLine(".area-route-path", { start: "top 75%", duration: 1.4 });
      gsap.from(".area-pin", {
        scale: 0,
        transformOrigin: "50% 100%",
        duration: 0.5,
        stagger: 0.12,
        delay: 0.3,
        ease: "back.out(2.4)",
        scrollTrigger: { trigger: root, start: "top 75%" },
      });
      gsap.from(".area-index-item", {
        autoAlpha: 0,
        x: -12,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const root = groupsRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".area-group").forEach((group, i) => {
        gsap.from(group, {
          autoAlpha: 0,
          y: 28,
          duration: 0.7,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 82%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Coverage"
        title="Executive Transportation Across Dallas–Fort Worth."
        description="LCT Universal provides professional chauffeur and group transportation throughout the Dallas–Fort Worth Metroplex, including Dallas, Fort Worth, the Mid-Cities and surrounding communities."
        image={hero.src}
        imagePosition={hero.objectPositionDesktop}
        imagePositionMobile={hero.objectPositionMobile}
      />

      {/* Signature interaction — a stylized DFW diagram with animated route lines, not a literal map */}
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] pb-16 pt-4">
        <div ref={mapRef} className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
          <div className="luxe-card rounded-sm p-6 md:p-10">
            <Scene3D
              className="aspect-[380/170] w-full"
              fallback={<ServiceAreasMapFallback activeIndex={hoveredArea} />}
            >
              <ServiceAreasMapCanvas onHoverArea={setHoveredArea} />
            </Scene3D>
          </div>

          <div className="space-y-5">
            {AREAS.map((a, i) => (
              <div
                key={a.name}
                className={`area-index-item border-b border-border/50 pb-4 transition-colors last:border-b-0 ${hoveredArea === i ? "text-champagne" : ""}`}
              >
                <h3 className="font-display text-xl text-foreground">{a.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Metroplex coverage — three editorial regional groups, real
          city names for both visitors and search engines, no card-per-city
          spam and no keyword-stuffed prose. */}
      <section className="border-t border-border bg-onyx py-20 md:py-28">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
          <SectionHeading
            align="center"
            eyebrow="Full Metroplex Coverage"
            title={
              <>
                We cover the whole <span className="italic text-gold-gradient">DFW Metroplex.</span>
              </>
            }
            description="From downtown Dallas and downtown Fort Worth to the Mid-Cities corridor between them, LCT Universal dispatches executive vehicles across every community below."
          />

          <div ref={groupsRef} className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
            {SERVICE_AREA_GROUPS.map((group) => (
              <div key={group.id} className="area-group">
                <h3 className="font-display text-2xl text-off-white">{group.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-off-white/60">{group.blurb}</p>
                <ul className="mt-6 columns-2 gap-x-6 text-sm leading-8 text-off-white/80 sm:columns-2">
                  {group.cities.map((city) => (
                    <li key={city} className="flex items-start gap-1.5 break-inside-avoid">
                      <MapPin className="mt-1 h-3 w-3 shrink-0 text-champagne/60" aria-hidden />
                      <span>{city}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-14 text-center text-xs leading-relaxed text-off-white/45">
            LCT Universal is based in Grapevine, Texas and dispatches to the communities listed above —
            we do not operate branch offices in every city served.
          </p>
        </div>
      </section>

      {/* What we bring to every one of those communities — concise, varied
          copy (not the same sentence repeated with a different city name),
          with genuine internal links rather than links forced onto city
          names. */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
          <SectionHeading
            eyebrow="Every Trip, Every Community"
            title={
              <>
                One standard, <span className="italic text-gold-gradient">the full Metroplex.</span>
              </>
            }
          />
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="font-display text-xl text-foreground">Airport transfers</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Flight-timed pickups at DFW International and Dallas Love Field, with meet-and-greet
                available at either terminal.{" "}
                <Link to="/airport" className="text-gold underline underline-offset-2">
                  See airport service
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Corporate transportation</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Dedicated account management and priority dispatch for executive travel across Dallas,
                Fort Worth, and every business district between them.{" "}
                <Link to="/corporate" className="text-gold underline underline-offset-2">
                  Corporate accounts
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Sedans &amp; SUVs</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                First Class Sedan and Luxury SUV service for point-to-point travel, wherever your day
                starts in the Metroplex.{" "}
                <Link to="/fleet" className="text-gold underline underline-offset-2">
                  View the fleet
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Group transportation</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Sprinters, Mini Coaches, and full-size Motor Coaches coordinated for weddings,
                conventions, and corporate groups anywhere in the Metroplex.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Grapevine &amp; the Mid-Cities</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Home to our dispatch and management team, with the shortest response times to DFW
                International and the Mid-Cities corridor.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Know your exact rate</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every fare is calculated by pickup, drop-off, and vehicle through our live booking
                system.{" "}
                <Link to="/rates" className="text-gold underline underline-offset-2">
                  Rates &amp; pricing
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-onyx py-20">
        <div className="mx-auto max-w-3xl px-[var(--page-gutter)] text-center">
          <SectionHeading
            align="center"
            eyebrow="Confirm Your Trip"
            title={
              <>
                Ask us about <span className="italic text-metallic">your itinerary.</span>
              </>
            }
            description="Availability is confirmed on a per-trip basis. Send us your pickup, drop-off, and timing."
          />
          <Link
            to="/book"
            data-cursor="book"
            className="mt-8 inline-flex rounded-sm bg-gold-gradient px-8 py-4 text-sm font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)]"
          >
            Book Your Ride
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
