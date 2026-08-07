import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageMeta({
      title: "Privacy Policy — LCT Universal Executive Transports",
      description: "How LCT Universal collects, uses, and protects your personal information.",
      ogTitle: "Privacy Policy — LCT Universal",
      path: "/privacy",
      noindex: true,
    }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="Last updated January 2026." />
      <article className="mx-auto max-w-3xl px-6 pb-24 lg:px-10 prose prose-invert prose-headings:font-display prose-p:text-muted-foreground prose-p:leading-relaxed">
        <h2>Information We Collect</h2>
        <p>We collect information you provide when requesting a reservation or quote — including name, phone, email, pickup and drop-off details, flight numbers, and any special requests.</p>
        <h2>How We Use Information</h2>
        <p>Your information is used solely to coordinate your reservation, communicate trip details, and provide the services you have requested.</p>
        <h2>Data Sharing</h2>
        <p>LCT Universal does not sell your data. Information is shared only with the chauffeur assigned to your trip and, where required, with airport authorities.</p>
        <h2>Security</h2>
        <p>Reservations are handled with strict discretion. Non-disclosure protocols apply to corporate and VIP accounts.</p>
        <h2>Contact</h2>
        <p>Questions? Reach us through our <a href="/contact" className="text-gold">contact form</a> or by phone at <a href="tel:+18886154065" className="text-gold">+1 (888) 615-4065</a>.</p>
      </article>
    </SiteLayout>
  );
}
