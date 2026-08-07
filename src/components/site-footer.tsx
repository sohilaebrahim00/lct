import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { COMPANY, CONTACT, NAV_LINKS } from "@/lib/site-data";
import { SocialLinks } from "@/components/social-links";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-onyx">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-gradient opacity-50" />
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo linked={false} imgClassName="h-16 md:h-20 w-auto" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {COMPANY.legalName} provides premium chauffeured transportation across{" "}
              {CONTACT.serviceRegion}. Discretion, punctuality, and professional service.
            </p>
            <SocialLinks className="mt-8 flex gap-3" />
          </div>

          <div>
            <div className="eyebrow mb-5">Explore</div>
            <ul className="space-y-3 text-sm text-foreground/70">
              {NAV_LINKS.filter((l) => l.to !== "/").map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition hover:text-champagne">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow mb-5">Services</div>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li>
                <Link to="/airport" className="transition hover:text-champagne">
                  Airport Transfers
                </Link>
              </li>
              <li>
                <Link to="/corporate" className="transition hover:text-champagne">
                  Corporate Travel
                </Link>
              </li>
              <li>
                <Link to="/events" className="transition hover:text-champagne">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/fleet" className="transition hover:text-champagne">
                  Fleet
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="eyebrow mb-5">Contact</div>
            <ul className="space-y-3 text-sm text-foreground/75">
              <li>
                <a href={CONTACT.phoneTel} className="transition hover:text-champagne">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={CONTACT.emailMailto} className="transition hover:text-champagne">
                  {CONTACT.email}
                </a>
              </li>
              <li>{CONTACT.locationLine}</li>
              <li className="text-muted-foreground">Dispatch {CONTACT.dispatchHours}</li>
              <li className="text-muted-foreground">Management {CONTACT.managementHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>
            © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition hover:text-champagne">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition hover:text-champagne">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
