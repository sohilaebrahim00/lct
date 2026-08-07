import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { Icon3D } from "@/components/icon3d/Icon3D";
import { IMAGES } from "@/lib/image-map";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/reviews")({
  head: () =>
    pageMeta({
      title: "Client Reviews — LCT Universal Executive Transports",
      description:
        "Verified reviews from clients of LCT Universal Executive Transports will be published here as they are collected.",
      ogTitle: "Client Reviews — LCT Universal",
      ogDescription: "Verified reviews from LCT Universal clients.",
      path: "/reviews",
    }),
  component: Reviews,
});

function Reviews() {
  const hero = IMAGES.cockpit;
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Testimonials"
        title="Our clients speak, quietly."
        description="LCT Universal only publishes verified reviews from our own clients. As we collect and verify them, they will appear on this page."
        image={hero.src}
        imagePosition={hero.objectPositionDesktop}
      />
      <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-10">
        <div className="luxe-card rounded-lg p-10 text-center">
          <div className="mx-auto flex justify-center"><Icon3D name="star" size={72} /></div>
          <SectionHeading
            align="center"
            eyebrow="Coming Soon"
            title={<>Verified reviews, <span className="italic text-gold-gradient">only.</span></>}
            description="We are in the process of collecting and verifying client testimonials from real journeys. Rather than publish placeholder quotes, we choose to leave this page honest."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="rounded-full bg-gold-gradient px-6 py-3 text-xs font-semibold uppercase tracking-widest text-onyx">Share Your Experience</Link>
            <Link to="/services" className="rounded-full border border-gold/40 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-foreground hover:border-gold hover:text-gold">Explore Services</Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-xl text-center">
          <h2 className="eyebrow mb-3">What to expect</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Uniformed chauffeurs, vehicles inspected before every dispatch, and a 24/7 concierge
            confirming each reservation directly — the same standard whether it's your first ride
            or your fiftieth.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
