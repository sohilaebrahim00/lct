import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { LegalArticle, type LegalSectionSpec } from "@/components/legal/legal-article";
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

const SECTIONS: LegalSectionSpec[] = [
  {
    id: "acceptance-age",
    title: "Acceptance & Age",
    content: (
      <p>
        By accessing or using our services, you confirm that you are at least 18 years old and
        consent to these terms.
      </p>
    ),
  },
  {
    id: "reservations",
    title: "Reservations",
    content: (
      <p>All reservations are confirmed by an LCT concierge. Same-day reservations are subject to availability.</p>
    ),
  },
  {
    id: "service-eligibility",
    title: "Service Eligibility & Dallas Transportation-for-Hire Compliance",
    content: (
      <p>
        LCT Universal Executive Transports operates in accordance with the City of Dallas
        Transportation-for-Hire regulations. Private transportation is provided per applicable
        city and state regulation; we retain discretion to deny service for policy violations.
      </p>
    ),
  },
  {
    id: "accessibility",
    title: "Accessibility",
    content: <p>Wheelchair accessibility is available in all our vehicles upon request.</p>,
  },
  {
    id: "drug-free-workplace",
    title: "Drug-Free Workplace",
    content: (
      <p>
        We maintain a strict drug-free workplace. Use, possession, or impairment from drugs or
        alcohol while working is prohibited for all drivers and safety-sensitive personnel — see
        our <a href="/zero-tolerance">Zero Tolerance &amp; Safety Policy</a> for full detail.
      </p>
    ),
  },
  {
    id: "user-responsibilities",
    title: "User Responsibilities",
    content: (
      <p>
        Customers must provide truthful booking information and behave courteously toward drivers
        and other passengers.
      </p>
    ),
  },
  {
    id: "cancellations",
    title: "Cancellations",
    content: (
      <p>
        Cancellations must be made within the timeframe outlined at booking. No-shows or late
        cancellations may be subject to a fee — see our full{" "}
        <a href="/cancellation-policy">Cancellation Policy</a> for exact windows by service type.
      </p>
    ),
  },
  {
    id: "payment",
    title: "Payment",
    content: (
      <p>Corporate accounts are billed monthly. Private clients settle at the conclusion of service or by advance authorization.</p>
    ),
  },
  {
    id: "conduct",
    title: "Conduct",
    content: (
      <p>Damage to a vehicle beyond reasonable use will be assessed at cost. Smoking is not permitted in any LCT vehicle.</p>
    ),
  },
  {
    id: "liability-limitations",
    title: "Liability Limitations",
    content: (
      <p>
        LCT Universal Executive Transports is not responsible for delays due to traffic, weather,
        or unforeseen events, and disclaims liability for lost or damaged personal belongings.
      </p>
    ),
  },
  {
    id: "complaints",
    title: "Complaints",
    content: (
      <p>
        Regulatory complaints regarding transportation-for-hire service may be filed by calling
        3-1-1 (inside the City of Dallas) or (214) 670-3111 (outside the City of Dallas).
      </p>
    ),
  },
];

function Terms() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Last updated August 2026. Age, service, compliance, and conduct terms for reservations with LCT Universal Executive Transports."
      />
      <LegalArticle
        sections={SECTIONS}
        contact={
          <p>
            Reach us via our <a href="/contact">contact form</a> or by phone at{" "}
            <a href="tel:+18886154065">+1 (888) 615-4065</a>.
          </p>
        }
      />
    </SiteLayout>
  );
}
