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

/**
 * Approved content, client-supplied 2026-08-14 — verbatim, not rewritten,
 * summarized, or shortened. The one sentence that appears twice ("All the
 * above categories exclude text messaging originator opt-in data and
 * consent...") is intentional, not an accidental duplicate: it's the
 * standard SMS/TCPA disclaimer pattern of repeating the no-third-party-
 * sharing statement everywhere sharing is discussed (once under "SMS
 * Consent and Mobile Information", once under "Information Sharing") —
 * kept in both places per the explicit instruction to preserve SMS/
 * sharing-restriction language exactly as written.
 */
const SECTIONS: LegalSectionSpec[] = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <>
        <p>Depending on how you interact with us, we may collect information including:</p>
        <ul>
          <li>Name</li>
          <li>Phone number</li>
          <li>Email address</li>
          <li>Billing and payment information</li>
          <li>Pickup and drop-off information</li>
          <li>Reservation and transportation details</li>
          <li>Passenger information necessary to provide transportation services</li>
          <li>Communication preferences</li>
          <li>Information submitted through our website, booking forms, or customer service channels</li>
        </ul>
        <p>
          We may also collect information about your interaction with our website and
          communications for security, operational, and service-improvement purposes.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-your-information",
    title: "How We Use Your Information",
    content: (
      <>
        <p>We may use your information to:</p>
        <ul>
          <li>Process and manage transportation reservations</li>
          <li>Communicate with you regarding your reservations</li>
          <li>Provide customer support</li>
          <li>Send reservation confirmations, updates, reminders, and service-related notifications</li>
          <li>Respond to inquiries and requests</li>
          <li>Process payments</li>
          <li>Improve our services and customer experience</li>
          <li>Maintain business and customer records</li>
          <li>Send promotional communications when you have provided the appropriate consent</li>
          <li>Comply with applicable legal and regulatory requirements</li>
        </ul>
      </>
    ),
  },
  {
    id: "sms-text-messaging",
    title: "SMS / Text Messaging",
    content: (
      <>
        <p>
          If you choose to provide your mobile phone number and opt in to receive text messages
          from LCT Universal, you may receive SMS messages related to your transportation
          services.
        </p>
        <p>These messages may include:</p>
        <ul>
          <li>Reservation confirmations</li>
          <li>Pickup and trip updates</li>
          <li>Driver or vehicle information</li>
          <li>Arrival and scheduling notifications</li>
          <li>Customer service communications</li>
          <li>Appointment or reservation reminders</li>
          <li>Other transportation-related notifications</li>
          <li>Promotional or marketing messages, if you have separately provided the required consent</li>
        </ul>
        <p>
          Message frequency varies depending on your reservations, communications preferences,
          and the type of messaging program you have opted into. Message and data rates may
          apply.
        </p>
        <p>
          You may opt out of SMS communications at any time by replying <strong>STOP</strong> to
          a message. You may also reply <strong>HELP</strong> for assistance or contact LCT
          Universal directly.
        </p>
        <p>
          Opting out of promotional or non-essential text messages will not prevent us from
          providing essential communications related to an active reservation when those
          communications are necessary to provide the requested transportation service, where
          permitted by applicable law.
        </p>
        <p>SMS consent is not a condition of purchasing transportation services.</p>
      </>
    ),
  },
  {
    id: "sms-consent-and-mobile-information",
    title: "SMS Consent and Mobile Information",
    content: (
      <>
        <p>We obtain consent before sending SMS messages where consent is required.</p>
        <p>
          We do not sell, rent, or transfer your mobile phone number or SMS opt-in information
          for marketing purposes.
        </p>
        <p>
          All the above categories exclude text messaging originator opt-in data and consent;
          this information won&rsquo;t be shared with any third parties.
        </p>
        <p>
          Your SMS consent and mobile information are maintained as confidential information and
          are used only for the purposes described in this Privacy Policy and as otherwise
          permitted by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "information-sharing",
    title: "Information Sharing",
    content: (
      <>
        <p>
          We may share information with service providers and business partners when reasonably
          necessary to operate our business and provide requested services, including:
        </p>
        <ul>
          <li>Payment processors</li>
          <li>Reservation and dispatch providers</li>
          <li>Technology and software providers</li>
          <li>Communication and messaging service providers</li>
          <li>Professional service providers</li>
          <li>Government authorities or other parties when required by law</li>
        </ul>
        <p>We do not sell your personal information.</p>
        <p>
          We do not share SMS opt-in information or consent with third parties or affiliates for
          their own marketing or promotional purposes.
        </p>
        <p>
          All the above categories exclude text messaging originator opt-in data and consent;
          this information won&rsquo;t be shared with any third parties.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <>
        <p>
          We use reasonable administrative, technical, and organizational safeguards designed to
          protect personal information against unauthorized access, disclosure, alteration, or
          destruction.
        </p>
        <p>However, no method of electronic storage or transmission can be guaranteed to be completely secure.</p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: (
      <>
        <p>
          We retain personal information for as long as reasonably necessary to provide our
          services, maintain business and financial records, resolve disputes, comply with legal
          obligations, and enforce our agreements.
        </p>
        <p>
          SMS consent and related records may be retained as necessary to demonstrate compliance
          with applicable messaging requirements.
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-website-technologies",
    title: "Cookies and Website Technologies",
    content: (
      <>
        <p>
          Our website may use cookies and similar technologies to improve website functionality,
          understand website usage, maintain security, and improve the customer experience.
        </p>
        <p>You may be able to control cookies through your browser settings.</p>
      </>
    ),
  },
  {
    id: "third-party-websites-and-services",
    title: "Third-Party Websites and Services",
    content: (
      <>
        <p>
          Our website may contain links to third-party websites or services. LCT Universal is not
          responsible for the privacy practices or content of third-party websites.
        </p>
        <p>We encourage you to review the privacy policies of any third-party services you use.</p>
      </>
    ),
  },
  {
    id: "your-privacy-choices",
    title: "Your Privacy Choices",
    content: (
      <>
        <p>Depending on applicable law, you may have rights regarding your personal information, including the ability to:</p>
        <ul>
          <li>Request access to information we maintain about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of information, subject to applicable legal requirements</li>
          <li>Withdraw certain consents</li>
          <li>Opt out of promotional communications</li>
          <li>Opt out of SMS marketing communications by replying STOP</li>
        </ul>
        <p>To make a privacy-related request, please contact us using the information below.</p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content: (
      <p>
        Our services are not directed toward children under the age of 13. We do not knowingly
        collect personal information from children under 13 without appropriate authorization.
      </p>
    ),
  },
  {
    id: "changes-to-this-privacy-policy",
    title: "Changes to This Privacy Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our services,
          technology, legal requirements, or business practices.
        </p>
        <p>When we make changes, we will update the &ldquo;Effective Date&rdquo; at the top of this Privacy Policy.</p>
      </>
    ),
  },
];

function Privacy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="Effective Date: August 14, 2026." />
      <LegalArticle
        intro={
          <>
            <p>
              LCT Universal Executive Transports (&ldquo;LCT Universal,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy and is committed to
              protecting the personal information you provide to us through our website, booking
              services, customer service channels, and text messaging programs.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, protect, and handle personal
              information when you interact with LCT Universal.
            </p>
          </>
        }
        sections={SECTIONS}
        contact={
          <>
            <p>
              If you have questions about this Privacy Policy, your personal information, or our
              SMS messaging program, please contact us:
            </p>
            <p className="!mt-4">
              LCT Universal Executive Transports
              <br />
              Dallas–Fort Worth, Texas
              <br />
              Phone: <a href="tel:+18886154065">(888) 615-4065</a>
              <br />
              Website: <a href="https://lctuniversal.com">https://lctuniversal.com</a>
              <br />
              Email: <a href="mailto:info@lctuniversal.com">info@lctuniversal.com</a>
            </p>
            <p>
              SMS Support: Reply <strong>HELP</strong> to any LCT Universal text message or
              contact us using the information above.
            </p>
          </>
        }
      />
    </SiteLayout>
  );
}
