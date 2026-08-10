import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
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

function CancellationPolicy() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title="Cancellation Policy"
        description="At LCT Universal Executive Transports, we understand that plans can change. To provide the highest level of service to all our clients, we have established the following cancellation policy."
      />
      <article className="mx-auto max-w-3xl px-6 pb-24 lg:px-10 prose prose-invert prose-headings:font-display prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
        <h2>Sedans &amp; SUVs</h2>
        <PolicyList items={CANCELLATION_SUMMARY.sedanSuv} />

        <h2>Airport Transfers</h2>
        <PolicyList items={CANCELLATION_SUMMARY.airport} />

        <h2>Hourly &amp; Special Event Services</h2>
        <p className="!mb-2 !mt-0 text-sm">Weddings, proms, and other special events.</p>
        <PolicyList items={CANCELLATION_SUMMARY.hourlyEvents} />

        <h2>Modifications</h2>
        <p>{CANCELLATION_SUMMARY.modifications}</p>

        <h2>Weather &amp; Emergency Exceptions</h2>
        <p>{CANCELLATION_SUMMARY.exceptions}</p>

        <h2>Contact</h2>
        <p>
          Questions about a specific reservation? Call{" "}
          <a href={CONTACT.phoneTel} className="text-gold">
            {CONTACT.phoneDisplay}
          </a>{" "}
          or email{" "}
          <a href={CONTACT.emailMailto} className="text-gold">
            {CONTACT.email}
          </a>
          .
        </p>
      </article>
    </SiteLayout>
  );
}
