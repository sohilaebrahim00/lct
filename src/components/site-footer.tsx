import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { COMPANY, CONTACT } from "@/lib/site-data";
import { SocialLinks } from "@/components/social-links";

type FooterLink = { to: string; label: string; external?: boolean };

const EXPLORE_LINKS: FooterLink[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/fleet", label: "Fleet" },
  { to: "/reviews", label: "Reviews" },
  { to: "/service-areas", label: "Service Areas" },
  { to: "/faq", label: "FAQ" },
];

const SERVICES_LINKS: FooterLink[] = [
  { to: "/services", label: "Services" },
  { to: "/airport", label: "Airport Transfers" },
  { to: "/corporate", label: "Corporate Travel" },
  { to: "/events", label: "Events" },
  // Group Transportation has no standalone route — its home is the Fleet
  // page (the same destination its own Services-page CTA already points
  // to), not a fabricated anchor link.
  { to: "/fleet", label: "Group Transportation" },
  { to: "/rates", label: "Rates & Pricing" },
];

const POLICY_LINKS: FooterLink[] = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/cancellation-policy", label: "Cancellation Policy" },
  { to: "/zero-tolerance", label: "Zero Tolerance Policy" },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <div className="eyebrow mb-5">{title}</div>
      <ul className="space-y-3 text-sm text-foreground/70">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link to={l.to} className="transition hover:text-champagne">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-onyx">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-gradient opacity-50" />

      {/* Conversion banner — the footer must still sell, not just index
          pages. Restrained (no gradient background wash), matching the
          site's existing closing-CTA language elsewhere. */}
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col items-center justify-between gap-6 px-[var(--page-gutter)] py-12 text-center md:flex-row md:text-left">
          <div>
            <div className="font-display text-2xl text-off-white md:text-3xl">
              Ready when you are.
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Reserve executive transportation across {CONTACT.serviceRegion}.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/book"
              data-cursor="book"
              className="group inline-flex items-center gap-3 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:scale-[1.02] hover:brightness-110"
            >
              Book Your Ride
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden />
            </Link>
            <a
              href={CONTACT.phoneTel}
              className="inline-flex items-center gap-2 rounded-full border border-champagne/40 px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-off-white transition hover:border-champagne hover:text-champagne"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call Dispatch
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] py-20">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo linked={false} imgClassName="h-16 md:h-20 w-auto" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {COMPANY.legalName} provides premium chauffeured transportation across{" "}
              {CONTACT.serviceRegion}. Discretion, punctuality, and professional service.
            </p>
            <SocialLinks className="mt-8 flex gap-3" />
          </div>

          {/* 2-column on mobile (per explicit instruction — a single stacked
              wall of links reads poorly on small screens), 4 across on
              desktop alongside the brand block. */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 lg:col-span-4">
            <FooterColumn title="Explore" links={EXPLORE_LINKS} />
            <FooterColumn title="Services" links={SERVICES_LINKS} />
            <div>
              <div className="eyebrow mb-5">Book & Contact</div>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li>
                  <Link to="/book" className="transition hover:text-champagne">
                    Book Your Ride
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition hover:text-champagne">
                    Contact
                  </Link>
                </li>
                <li>
                  <a href={CONTACT.phoneTel} className="transition hover:text-champagne">
                    Call Dispatch
                  </a>
                </li>
                <li>
                  <a href={CONTACT.emailMailto} className="break-all transition hover:text-champagne">
                    {CONTACT.email}
                  </a>
                </li>
              </ul>
            </div>
            <FooterColumn title="Company" links={POLICY_LINKS} />
          </div>
        </div>

        {/* Verified contact details — a dedicated, generously-spaced panel
            (not crammed into a link column) so phone/hours stay easy to
            read on every breakpoint. */}
        <div className="mt-16 grid gap-8 border-t border-border/60 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="eyebrow text-[0.6rem]">Phone</div>
            <a href={CONTACT.phoneTel} className="mt-2 block text-base text-foreground transition hover:text-champagne">
              {CONTACT.phoneDisplay}
            </a>
          </div>
          <div>
            <div className="eyebrow text-[0.6rem]">Email</div>
            <a
              href={CONTACT.emailMailto}
              className="mt-2 block break-all text-base text-foreground transition hover:text-champagne"
            >
              {CONTACT.email}
            </a>
          </div>
          <div>
            <div className="eyebrow text-[0.6rem]">Location</div>
            <div className="mt-2 text-base text-foreground">{CONTACT.locationLine}</div>
          </div>
          <div>
            <div className="eyebrow text-[0.6rem]">Hours</div>
            <div className="mt-2 text-base text-foreground">Dispatch {CONTACT.dispatchHours}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Management {CONTACT.managementHours} · {CONTACT.managementClosed}
            </div>
          </div>
        </div>

        {/* pb-24: on narrow mobile widths the copyright line wraps wide
            enough to sit directly under the fixed WhatsApp/phone FABs at the
            true bottom of the page (measured overlap, not assumed) — this
            clears it without touching the FAB stack itself. */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pb-24 pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:pb-0">
          <div>
            © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
