import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageMeta({
      title: "Terms & Conditions — LCT Universal Executive Transports",
      description: "Terms of service for LCT Universal Executive Transports reservations.",
      ogTitle: "Terms & Conditions — LCT Universal",
      path: "/terms",
      noindex: true,
    }),
  component: Terms,
});

function Terms() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Terms & Conditions" description="Last updated January 2026." />
      <article className="mx-auto max-w-3xl px-6 pb-24 lg:px-10 prose prose-invert prose-headings:font-display prose-p:text-muted-foreground prose-p:leading-relaxed">
        <h2>Reservations</h2>
        <p>All reservations are confirmed by an LCT concierge. Same-day reservations are subject to availability.</p>
        <h2>Cancellations</h2>
        <p>Cancellation windows depend on the vehicle and service tier. Your reservation confirmation will note the applicable policy.</p>
        <h2>Payment</h2>
        <p>Corporate accounts are billed monthly. Private clients settle at the conclusion of service or by advance authorization.</p>
        <h2>Conduct</h2>
        <p>Damage to a vehicle beyond reasonable use will be assessed at cost. Smoking is not permitted in any LCT vehicle.</p>
        <h2>Contact</h2>
        <p>Reach us via our <a href="/contact" className="text-gold">contact form</a> or by phone at <a href="tel:+18886154065" className="text-gold">+1 (888) 615-4065</a>.</p>
      </article>
    </SiteLayout>
  );
}
