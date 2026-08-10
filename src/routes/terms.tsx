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
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Last updated August 2026. Age, service, compliance, and conduct terms for reservations with LCT Universal Executive Transports."
      />
      <article className="mx-auto max-w-3xl px-6 pb-24 lg:px-10 prose prose-invert prose-headings:font-display prose-p:text-muted-foreground prose-p:leading-relaxed">
        <h2>Acceptance &amp; Age</h2>
        <p>
          By accessing or using our services, you confirm that you are at least 18 years old and
          consent to these terms.
        </p>
        <h2>Reservations</h2>
        <p>All reservations are confirmed by an LCT concierge. Same-day reservations are subject to availability.</p>
        <h2>Service Eligibility &amp; Dallas Transportation-for-Hire Compliance</h2>
        <p>
          LCT Universal Executive Transports operates in accordance with the City of Dallas
          Transportation-for-Hire regulations. Private transportation is provided per applicable
          city and state regulation; we retain discretion to deny service for policy violations.
        </p>
        <h2>Accessibility</h2>
        <p>Wheelchair accessibility is available in all our vehicles upon request.</p>
        <h2>Drug-Free Workplace</h2>
        <p>
          We maintain a strict drug-free workplace. Use, possession, or impairment from drugs or
          alcohol while working is prohibited for all drivers and safety-sensitive personnel — see
          our{" "}
          <a href="/zero-tolerance" className="text-gold">
            Zero Tolerance &amp; Safety Policy
          </a>{" "}
          for full detail.
        </p>
        <h2>User Responsibilities</h2>
        <p>
          Customers must provide truthful booking information and behave courteously toward
          drivers and other passengers.
        </p>
        <h2>Cancellations</h2>
        <p>
          Cancellations must be made within the timeframe outlined at booking. No-shows or late
          cancellations may be subject to a fee — see our full{" "}
          <a href="/cancellation-policy" className="text-gold">
            Cancellation Policy
          </a>{" "}
          for exact windows by service type.
        </p>
        <h2>Payment</h2>
        <p>Corporate accounts are billed monthly. Private clients settle at the conclusion of service or by advance authorization.</p>
        <h2>Conduct</h2>
        <p>Damage to a vehicle beyond reasonable use will be assessed at cost. Smoking is not permitted in any LCT vehicle.</p>
        <h2>Liability Limitations</h2>
        <p>
          LCT Universal Executive Transports is not responsible for delays due to traffic,
          weather, or unforeseen events, and disclaims liability for lost or damaged personal
          belongings.
        </p>
        <h2>Complaints</h2>
        <p>
          Regulatory complaints regarding transportation-for-hire service may be filed by calling
          3-1-1 (inside the City of Dallas) or (214) 670-3111 (outside the City of Dallas).
        </p>
        <h2>Contact</h2>
        <p>Reach us via our <a href="/contact" className="text-gold">contact form</a> or by phone at <a href="tel:+18886154065" className="text-gold">+1 (888) 615-4065</a>.</p>
      </article>
    </SiteLayout>
  );
}
