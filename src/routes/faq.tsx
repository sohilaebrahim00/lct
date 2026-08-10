import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site-layout";

import { CONTACT } from "@/lib/site-data";
import { ensureGsap } from "@/lib/motion";
import { revealStagger } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => ({
    ...pageMeta({
      title: "Frequently Asked Questions — LCT Universal",
      description:
        "Answers to common questions about LCT Universal Executive Transports — reservations, airport transfers, corporate accounts, cancellations.",
      ogTitle: "FAQ — LCT Universal",
      path: "/faq",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

type FaqItem = { q: string; a: string };

const CATEGORIES: { category: string; items: FaqItem[] }[] = [
  {
    category: "Reservations",
    items: [
      {
        q: "How do I request a ride?",
        a: `Reserve online through our contact form or call our 24/7 concierge at ${CONTACT.phoneDisplay}. A specialist confirms every reservation within minutes.`,
      },
      {
        q: "How far in advance should I book?",
        a: "We recommend 24 hours notice for guaranteed service. Our 24/7 concierge routinely accommodates same-day reservations subject to availability.",
      },
      {
        q: "Can I select a specific vehicle?",
        a: "Yes. Requests for specific makes or equipment (child seats, privacy partitions) are welcome at reservation time, subject to availability.",
      },
      {
        q: "How is payment handled?",
        a: "We accept major credit and debit cards. The total fare must be authorized before the scheduled pickup time to confirm your reservation.",
      },
    ],
  },
  {
    category: "Airport Transfers",
    items: [
      {
        q: "What happens with airport pickup?",
        a: "We monitor your inbound flight and adjust pickup accordingly. A uniformed chauffeur meets you curbside or at baggage claim, depending on your preference.",
      },
      {
        q: "What if my flight is delayed?",
        a: "We accommodate reasonable delays without additional charge and coordinate with you throughout.",
      },
    ],
  },
  {
    category: "Fleet & Groups",
    items: [
      {
        q: "How much luggage can I bring?",
        a: "Capacity varies by vehicle. Please see our Fleet page for passenger and luggage capacities per vehicle.",
      },
      {
        q: "Do you handle groups?",
        a: "Yes — executive Sprinters and coordinated fleets are available for groups.",
      },
      {
        q: "What about hourly service?",
        a: "Book any vehicle by the hour with as-directed service: same driver, multiple stops, no meter to watch.",
      },
    ],
  },
  {
    category: "Corporate & Policies",
    items: [
      {
        q: "Do you offer corporate accounts?",
        a: "Yes. We provide dedicated account managers, consolidated invoicing and priority dispatch. Request an account on our Corporate page.",
      },
      {
        q: "How do cancellations work?",
        a: "Cancellation windows vary by service type — see our full Cancellation Policy page for exact windows and fees for sedans & SUVs, airport transfers, and hourly & event services.",
      },
      {
        q: "Where do you operate?",
        a: `Our primary service region is ${CONTACT.serviceRegion}. Contact us to confirm availability for your itinerary.`,
      },
    ],
  },
];

const faqs = CATEGORIES.flatMap((c) => c.items);

function Faq() {
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      revealStagger(Array.from(list.children), {
        from: "up",
        amount: 0.05,
        start: "top 85%",
        trigger: list,
      });
    }, list);
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Enquiries"
        title="Frequently asked."
        description="Answers to the questions we hear most often. Anything else — call, email, or WhatsApp our 24/7 concierge."
      />
      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-10">
        <div ref={listRef} className="space-y-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <h2 className="eyebrow mb-2">{cat.category}</h2>
              <div className="divide-y divide-border border-y border-border">
                {cat.items.map((it) => (
                  <details key={it.q} className="group py-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                      <span className="font-display text-xl text-foreground group-hover:text-gold">
                        {it.q}
                      </span>
                      <span className="text-2xl text-gold transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{it.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Quiet closing CTA — calm, text-only, matching the page's restrained tone */}
        <div className="mt-14 flex justify-center border-t border-border/50 pt-10">
          <Link
            to="/book"
            data-cursor="book"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-champagne transition hover:text-gold"
          >
            Reserve your ride
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
