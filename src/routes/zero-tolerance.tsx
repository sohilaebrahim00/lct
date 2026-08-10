import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { CONTACT } from "@/lib/site-data";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/zero-tolerance")({
  head: () =>
    pageMeta({
      title: "Zero Tolerance & Safety Policy — LCT Universal Executive Transports",
      description:
        "LCT Universal Executive Transports' zero tolerance policy for intoxicating substances, in compliance with City of Dallas Transportation-for-Hire regulations.",
      ogTitle: "Zero Tolerance & Safety Policy — LCT Universal",
      path: "/zero-tolerance",
      noindex: true,
    }),
  component: ZeroTolerance,
});

function ZeroTolerance() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title="Zero Tolerance & Safety Policy"
        description="Effective April 28, 2025. Preserved from our prior policy during this site's migration — verify with counsel before any future revision."
      />
      <article className="mx-auto max-w-3xl px-6 pb-24 lg:px-10 prose prose-invert prose-headings:font-display prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
        <p>
          LCT Universal Executive Transports is fully committed to passenger safety and complies
          with the{" "}
          <strong className="text-foreground">City of Dallas Ordinance SEC. 47A-2.1.6</strong>{" "}
          regarding substance use by transportation-for-hire operators.
        </p>

        <h2>Zero Tolerance Policy</h2>
        <p>
          We maintain a strict zero tolerance policy for intoxicating substances. Drivers and
          safety-sensitive personnel are strictly prohibited from using or being under the
          influence of:
        </p>
        <ul>
          <li>Alcohol</li>
          <li>Illegal drugs</li>
          <li>Any impairing medications, unless prescribed and non-impairing</li>
        </ul>

        <h2>Testing &amp; Enforcement</h2>
        <p>We may conduct:</p>
        <ul>
          <li>Random drug/alcohol testing</li>
          <li>Post-incident or suspicion-based testing</li>
          <li>Immediate suspension or termination for violations</li>
        </ul>

        <h2>Reporting Violations</h2>
        <p>Suspected violations may be reported to:</p>
        <ul>
          <li>The Dallas 311 Hotline</li>
          <li>
            LCT Universal Executive Transports Compliance Office:{" "}
            <a href={CONTACT.phoneTel} className="text-gold">
              {CONTACT.phoneDisplay}
            </a>
          </li>
        </ul>

        <h2>Related Policies</h2>
        <p>
          This policy works alongside our{" "}
          <a href="/terms" className="text-gold">
            Terms &amp; Conditions
          </a>{" "}
          and{" "}
          <a href="/cancellation-policy" className="text-gold">
            Cancellation Policy
          </a>
          .
        </p>
      </article>
    </SiteLayout>
  );
}
