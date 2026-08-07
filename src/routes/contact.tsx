import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, useLayoutEffect, useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { Icon3D } from "@/components/icon3d/Icon3D";
import type { Icon3DName } from "@/components/icon3d/registry";
import { LeadForm } from "@/components/lead-form";
import { Logo } from "@/components/logo";
import { CONTACT } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap } from "@/lib/motion";
import { revealStagger } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";
import { Scene3D } from "@/lib/three/Scene3D";
import { ContactMapBackdrop } from "@/components/contact/map-backdrop";
import { SocialLinks } from "@/components/social-links";

const ContactPinCanvas = lazy(() => import("@/components/contact/pin-canvas"));

/**
 * The pin itself for the fallback (non-3D) path — centered, sitting on the
 * same map backdrop the 3D version uses, at the same "Grapevine
 * intersection" point. Route/roads/labels all live in `ContactMapBackdrop`
 * now, shared by both paths, so this is just the pin shape.
 */
function ContactPinFallback() {
  return (
    <svg viewBox="0 0 34 44" className="h-[72px] w-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]" aria-hidden>
      <defs>
        <linearGradient id="contactPinMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--gold-soft)" }} />
          <stop offset="45%" style={{ stopColor: "var(--champagne)" }} />
          <stop offset="100%" style={{ stopColor: "var(--gold-deep)" }} />
        </linearGradient>
        <radialGradient id="contactPinCore" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2a2620" />
          <stop offset="100%" stopColor="#070605" />
        </radialGradient>
      </defs>
      <path
        d="M17 2C9.82 2 4 7.82 4 15c0 5.6 3.4 11.86 6.66 16.66C13.9 36.4 17 40 17 40s3.1-3.6 6.34-8.34C26.6 26.86 30 20.6 30 15c0-7.18-5.82-13-13-13z"
        fill="url(#contactPinMetal)"
        style={{ stroke: "var(--gold-deep)" }}
        strokeWidth={0.6}
      />
      <circle cx="17" cy="14.5" r="5.1" fill="url(#contactPinCore)" style={{ stroke: "var(--champagne)" }} strokeOpacity={0.75} strokeWidth={0.7} />
      <circle cx="14.6" cy="12" r="1" fill="#fff8e8" opacity={0.85} />
    </svg>
  );
}

export const Route = createFileRoute("/contact")({
  head: () =>
    pageMeta({
      title: "Contact & Reserve — LCT Universal Executive Transports",
      description: `Reserve with LCT Universal in ${CONTACT.serviceRegion}. Call ${CONTACT.phoneDisplay}, email ${CONTACT.email}, or send a request online.`,
      ogTitle: "Contact LCT Universal",
      ogDescription: "Reserve your chauffeur or reach our 24/7 concierge.",
      path: "/contact",
    }),
  component: Contact,
});

function Contact() {
  const hero = IMAGES.bookingCta;
  const formWrapRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      if (formWrapRef.current) {
        gsap.from(formWrapRef.current, {
          autoAlpha: 0,
          x: -24,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: formWrapRef.current, start: "top 78%" },
        });
      }
      if (cardsRef.current) {
        revealStagger(Array.from(cardsRef.current.children), {
          from: "right",
          amount: 0.08,
          start: "top 78%",
          trigger: cardsRef.current,
        });
      }
      gsap.from(".contact-map-frame", {
        autoAlpha: 0,
        y: 16,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: ".contact-signature", start: "top 80%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Reserve"
        title="Speak with our concierge."
        description="A live specialist is available 24 hours a day, seven days a week. Reach us by phone, WhatsApp, email — or complete the form below."
        image={hero.src}
      />

      {/* Primary conversion action — instant online booking via MyLimoBiz.
          The form below is the secondary path (a message/inquiry the team
          follows up on), so this page needs an explicit route to /book too. */}
      <div className="relative z-[5] mx-auto -mt-8 flex max-w-[var(--container-max)] justify-center px-[var(--page-gutter)] pb-4">
        <Link
          to="/book"
          data-cursor="book"
          className="group inline-flex items-center gap-2 rounded-sm bg-gold-gradient px-7 py-3.5 text-xs font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110"
        >
          Book Your Ride
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>

      {/* Signature interaction — a stylized Grapevine/DFW map with the
          premium gold pin marking the location. The map is decorative
          (SVG/CSS, no map SDK, no screenshot, no implied live navigation);
          the address text below and the CTA above are the real, always-
          present content. */}
      <section className="contact-signature py-12 md:py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <div className="contact-map-frame relative mx-auto h-[240px] w-full overflow-hidden rounded-sm border border-border/60 md:h-[300px]">
            <ContactMapBackdrop />
            <div className="relative z-[1] flex h-full items-center justify-center">
              <Scene3D className="flex h-full w-full items-center justify-center" fallback={<ContactPinFallback />}>
                <ContactPinCanvas />
              </Scene3D>
            </div>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {CONTACT.locationLine}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] pb-24">
        {/* Reduced ~42% from the previous h-24/h-28/h-32 treatment — this
            was reading as a second hero subject rather than a brand
            signature. Extra vertical margin gives it room to feel
            intentional at the smaller size rather than cramped. */}
        <div className="mb-16 flex justify-center">
          <Logo linked={false} imgClassName="h-14 w-auto md:h-16 lg:h-20" />
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div ref={formWrapRef}>
            <LeadForm
              formType="contact"
              title="Send us a message"
              description="A member of our reservation team will contact you shortly. For instant confirmation, use Book Your Ride above."
              submitLabel="Send Message"
              fields={[
                { name: "customerName", label: "Full Name", required: true, colSpan: 1 },
                { name: "customerEmail", label: "Email", type: "email", required: true, colSpan: 1 },
                { name: "phone", label: "Phone", type: "tel", colSpan: 1 },
                { name: "companyName", label: "Company (optional)", colSpan: 1 },
                {
                  name: "pickupDateTime",
                  label: "Preferred Date & Time",
                  type: "datetime-local",
                  colSpan: 2,
                },
                {
                  name: "specialRequests",
                  label: "Message / Special Requests",
                  type: "textarea",
                  rows: 4,
                  colSpan: 2,
                  placeholder: "Passenger count, luggage, vehicle preference, occasion…",
                },
              ]}
            />
          </div>

          <div ref={cardsRef} className="space-y-5 overflow-x-hidden">
            <InfoCard
              icon="phone"
              title="Call The Concierge"
              line1={CONTACT.phoneDisplay}
              line2="Reservation and dispatch 24/7"
              href={CONTACT.phoneTel}
            />
            <InfoCard
              icon="whatsapp"
              title="WhatsApp"
              line1={CONTACT.phoneDisplay}
              line2="Message anytime"
              href={CONTACT.whatsappUrl}
            />
            <InfoCard
              icon="envelope"
              title="Email"
              line1={CONTACT.email}
              line2="Reservations and trip coordination"
              href={CONTACT.emailMailto}
            />
            <InfoCard
              icon="location"
              title="Location"
              line1={CONTACT.locationLine}
              line2={CONTACT.serviceRegion}
            />
            <InfoCard
              icon="clock"
              title="Hours"
              line1="Dispatch 24 hours · 7 days"
              line2={`Management ${CONTACT.managementHours}`}
            />
            <div className="glass rounded-sm p-6">
              <div className="eyebrow text-[0.6rem]">Follow Us</div>
              <SocialLinks className="mt-4 flex gap-3" />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function InfoCard({
  icon,
  title,
  line1,
  line2,
  href,
  children,
}: {
  icon: Icon3DName;
  title: string;
  line1: string;
  line2: string;
  href?: string;
  children?: ReactNode;
}) {
  const inner = (
    <div>
      <div className="flex items-start gap-4">
        <Icon3D name={icon} size={56} label={title} />
        <div>
          <div className="eyebrow text-[0.6rem]">{title}</div>
          <div className="mt-1 font-display text-lg">{line1}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{line2}</div>
        </div>
      </div>
      {children}
    </div>
  );
  if (href) {
    return (
      <a href={href} className="glass block rounded-sm p-6 transition hover:border-champagne">
        {inner}
      </a>
    );
  }
  return <div className="glass block rounded-sm p-6">{inner}</div>;
}
