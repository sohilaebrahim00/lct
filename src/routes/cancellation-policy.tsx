import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { LegalArticle, type LegalSectionSpec } from "@/components/legal/legal-article";
import { CANCELLATION_SUMMARY, CONTACT } from "@/lib/site-data";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/cancellation-policy")({
  head: () =>
    pageMeta({
      title: "Cancellation Policy — LCT Universal Executive Transports",
      description:
        "Cancellation windows and fees for Sedans & SUVs, Airport Transfers, and Hourly & Special Event Services with LCT Universal Executive Transports.",
      ogTitle: "Cancellation Policy — LCT Universal",
      path: "/cancellation-policy",
      noindex: true,
    }),
  component: CancellationPolicy,
});

function PolicyList({ items }: { items: readonly string[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

const SECTIONS: LegalSectionSpec[] = [
  {
    id: "sedans-suvs",
    title: "Sedans & SUVs",
    content: <PolicyList items={CANCELLATION_SUMMARY.sedanSuv} />,
  },
  {
    id: "airport-transfers",
    title: "Airport Transfers",
    content: <PolicyList items={CANCELLATION_SUMMARY.airport} />,
  },
  {
    id: "hourly-special-event",
    title: "Hourly & Special Event Services",
    content: (
      <>
        <p className="!mt-0 text-sm">Weddings, proms, and other special events.</p>
        <PolicyList items={CANCELLATION_SUMMARY.hourlyEvents} />
      </>
    ),
  },
  {
    id: "modifications",
    title: "Modifications",
    content: <p>{CANCELLATION_SUMMARY.modifications}</p>,
  },
  {
    id: "weather-emergency-exceptions",
    title: "Weather & Emergency Exceptions",
    content: <p>{CANCELLATION_SUMMARY.exceptions}</p>,
  },
];

function CancellationPolicy() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title="Cancellation Policy"
        description="At LCT Universal Executive Transports, we understand that plans can change. To provide the highest level of service to all our clients, we have established the following cancellation policy."
      />
      <LegalArticle
        sections={SECTIONS}
        contact={
          <p>
            Questions about a specific reservation? Call{" "}
            <a href={CONTACT.phoneTel}>{CONTACT.phoneDisplay}</a> or email{" "}
            <a href={CONTACT.emailMailto}>{CONTACT.email}</a>.
          </p>
        }
      />
    </SiteLayout>
  );
}
