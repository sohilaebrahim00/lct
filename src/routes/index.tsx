import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { SiteLayout } from "@/components/site-layout";
import { SmoothScroll } from "@/components/luxury/smooth-scroll";
import { CinematicHero } from "@/components/home/cinematic-hero";
import { ValueEditorial, ChauffeurSection } from "@/components/home/value-chauffeur";
import { ServiceAvailability } from "@/components/home/service-availability";
import { HorizontalJourney } from "@/components/home/horizontal-journey";
import { PinnedStories } from "@/components/home/pinned-stories";
import { VehicleObjectJourney } from "@/components/home/vehicle-object";
import { FinalCta } from "@/components/home/booking-experience";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { ensureGsap, prefersReducedMotion, refreshScrollTriggers } from "@/lib/motion";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => {
    const meta = pageMeta({
      title: "LCT Universal — Executive Transportation in Dallas–Fort Worth",
      description: `Premium chauffeured transportation in ${CONTACT.serviceRegion}. Airport transfers, corporate travel, and VIP service. Available 24/7.`,
      path: "/",
    });
    return {
      ...meta,
      links: [
        ...meta.links,
        { rel: "preload", as: "image", href: IMAGES.hero.src, fetchPriority: "high" as never },
      ],
    };
  },
  component: Home,
});

function Home() {
  useLayoutEffect(() => {
    ensureGsap();
    if (prefersReducedMotion()) return;
    const onLoad = () => refreshScrollTriggers();
    window.addEventListener("load", onLoad);
    const t = window.setTimeout(() => refreshScrollTriggers(), 400);
    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <SiteLayout>
      <SmoothScroll />
      <CinematicHero />
      <ValueEditorial />
      <ServiceAvailability />
      <HorizontalJourney />
      <VehicleObjectJourney />
      <PinnedStories />
      <ChauffeurSection />
      <FinalCta />
    </SiteLayout>
  );
}
