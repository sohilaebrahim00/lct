import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { LegalArticle, type LegalSectionSpec } from "@/components/legal/legal-article";
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

const SECTIONS: LegalSectionSpec[] = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <p>
        We collect information you provide when requesting a reservation or quote — including
        name, phone, email, pickup and drop-off details, flight numbers, and any special requests.
      </p>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    content: (
      <p>
        Your information is used solely to coordinate your reservation, communicate trip details,
        and provide the services you have requested.
      </p>
    ),
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    content: (
      <p>
        LCT Universal does not sell your data. Information is shared only with the chauffeur
        assigned to your trip and, where required, with airport authorities.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <p>
        Reservations are handled with strict discretion. Non-disclosure protocols apply to
        corporate and VIP accounts.
      </p>
    ),
  },
];

function Privacy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="Last updated January 2026." />
      <LegalArticle
        sections={SECTIONS}
        contact={
          <p>
            Questions? Reach us through our <a href="/contact">contact form</a> or by phone at{" "}
            <a href="tel:+18886154065">+1 (888) 615-4065</a>.
          </p>
        }
      />
    </SiteLayout>
  );
}
