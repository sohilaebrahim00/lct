import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, useLayoutEffect, useRef, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { CONTACT } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { drawLine } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";
import { Scene3D } from "@/lib/three/Scene3D";

const ServiceAreasMapCanvas = lazy(() => import("@/components/service-areas/map-canvas"));

export const Route = createFileRoute("/service-areas")({
  head: () =>
    pageMeta({
      title: "Service Areas — Dallas–Fort Worth & Grapevine — LCT Universal",
      description: `LCT Universal provides executive transportation across ${CONTACT.serviceRegion}.`,
      ogTitle: "Service Areas — LCT Universal",
      ogDescription: `Serving ${CONTACT.serviceRegion}.`,
      path: "/service-areas",
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

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Coverage"
        title="Where we operate."
        description={`Executive transportation across ${CONTACT.serviceRegion}.`}
        image={hero.src}
      />

      {/* Signature interaction — a stylized DFW diagram with animated route lines, not a literal map */}
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] pb-16">
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
