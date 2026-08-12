import { Link, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Menu, Phone, X, ChevronDown } from "lucide-react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { Logo } from "@/components/logo";
import { CONTACT } from "@/lib/site-data";

type NavLeaf = { to: string; label: string };
type NavGroup = { label: string; items: NavLeaf[]; matchPaths: string[] };
type NavEntry = NavLeaf | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

/**
 * Desktop mega-menu / mobile accordion structure — replaces the previous
 * flat 8-item `NAV_LINKS` row. Every `to` here is a real, verified route
 * (cross-checked against the router, not assumed). Group Transportation
 * has no standalone route, so (matching the footer's own already-approved
 * precedent) it points at `/fleet` alongside Fleet's own "Fleet Overview" —
 * an intentional dual entry point, not an accidental duplicate.
 * "Join Our Team" (added 2026-08-11) lives under Company, not as a
 * top-level item — it's a real destination but not a booking-adjacent one,
 * so it shouldn't compete visually with the primary nav row or the
 * "Book Now" CTA per explicit client instruction.
 */
const NAV_ENTRIES: NavEntry[] = [
  { to: "/", label: "Home" },
  {
    label: "Services",
    matchPaths: ["/services", "/airport", "/corporate", "/events"],
    items: [
      { to: "/services", label: "All Services" },
      { to: "/airport", label: "Airport Transfers" },
      { to: "/corporate", label: "Corporate Travel" },
      { to: "/events", label: "Events" },
      { to: "/fleet", label: "Group Transportation" },
    ],
  },
  {
    label: "Fleet",
    matchPaths: ["/fleet", "/rates"],
    items: [
      { to: "/fleet", label: "Fleet Overview" },
      { to: "/rates", label: "Rates & Pricing" },
    ],
  },
  {
    label: "Company",
    matchPaths: ["/about", "/reviews", "/service-areas", "/faq", "/join-our-team", "/blog"],
    items: [
      { to: "/about", label: "About" },
      { to: "/reviews", label: "Reviews" },
      { to: "/service-areas", label: "Service Areas" },
      { to: "/faq", label: "FAQ" },
      { to: "/join-our-team", label: "Join Our Team" },
      { to: "/blog", label: "Insights" },
    ],
  },
  {
    label: "Policies",
    matchPaths: ["/privacy", "/terms", "/cancellation-policy", "/zero-tolerance"],
    items: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms & Conditions" },
      { to: "/cancellation-policy", label: "Cancellation Policy" },
      { to: "/zero-tolerance", label: "Zero Tolerance Policy" },
    ],
  },
  { to: "/contact", label: "Get In Touch" },
];

const navLinkClass =
  "rounded-sm px-3 py-2 text-[0.8125rem] font-medium tracking-wide text-foreground/65 transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const navTriggerClass =
  "group flex items-center gap-1 rounded-sm bg-transparent px-3 py-2 text-[0.8125rem] font-medium tracking-wide text-foreground/65 transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:text-champagne";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    // Trap Tab focus inside the open menu panel — without this, tabbing past
    // the last link falls through to <main> content that's hidden behind the
    // opaque overlay, so keyboard focus visibly "disappears" for the user.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = menuPanelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => firstLinkRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const headerSolid = scrolled || open;

  const isEntryActive = (entry: NavEntry) =>
    isGroup(entry)
      ? entry.matchPaths.includes(pathname)
      : entry.to === "/"
        ? pathname === "/"
        : pathname === entry.to;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          headerSolid
            ? "border-b border-border/80 bg-[color:var(--surface-elevated)]/92 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--container-max)] items-center justify-between gap-4 px-[var(--page-gutter)]">
          <Logo
            priority
            onClick={open ? closeMenu : undefined}
            imgClassName={`w-auto transition-all duration-500 ${
              scrolled ? "h-11 md:h-12" : "h-12 md:h-14 lg:h-16"
            }`}
            className="shrink-0"
          />

          <NavigationMenuPrimitive.Root
            className="relative hidden lg:block"
            delayDuration={120}
            skipDelayDuration={300}
          >
            <NavigationMenuPrimitive.List className="flex items-center gap-1 xl:gap-1.5" aria-label="Primary">
              {NAV_ENTRIES.map((entry) =>
                isGroup(entry) ? (
                  <NavigationMenuPrimitive.Item key={entry.label} className="relative">
                    <NavigationMenuPrimitive.Trigger className={navTriggerClass}>
                      <span className={isEntryActive(entry) ? "text-champagne" : undefined}>
                        {entry.label}
                      </span>
                      <ChevronDown
                        className="h-3 w-3 transition-transform duration-300 group-data-[state=open]:rotate-180"
                        aria-hidden
                      />
                    </NavigationMenuPrimitive.Trigger>
                    <NavigationMenuPrimitive.Content
                      className="absolute left-0 top-full pt-2 data-[state=closed]:pointer-events-none data-[state=closed]:-translate-y-1 data-[state=closed]:opacity-0 data-[state=open]:translate-y-0 data-[state=open]:opacity-100"
                      style={{ transition: "opacity 180ms ease, transform 180ms ease" }}
                    >
                      <ul className="min-w-[15rem] rounded-sm border border-border/60 bg-[color:var(--surface-elevated)]/97 p-2 shadow-[var(--shadow-luxe)] backdrop-blur-xl">
                        {entry.items.map((item) => (
                          <li key={item.to + item.label}>
                            <NavigationMenuPrimitive.Link asChild>
                              <Link
                                to={item.to}
                                data-cursor="explore"
                                className="block rounded-sm px-4 py-2.5 text-sm text-foreground/75 transition-colors hover:bg-champagne/[0.06] hover:text-champagne focus-visible:outline-none focus-visible:bg-champagne/[0.06] focus-visible:text-champagne"
                                activeProps={{ className: "!text-champagne" }}
                              >
                                {item.label}
                              </Link>
                            </NavigationMenuPrimitive.Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuPrimitive.Content>
                  </NavigationMenuPrimitive.Item>
                ) : (
                  <NavigationMenuPrimitive.Item key={entry.to}>
                    <NavigationMenuPrimitive.Link asChild>
                      <Link
                        to={entry.to}
                        data-cursor="explore"
                        className={navLinkClass}
                        activeProps={{ className: "!text-champagne" }}
                        activeOptions={{ exact: entry.to === "/" }}
                      >
                        {entry.label}
                      </Link>
                    </NavigationMenuPrimitive.Link>
                  </NavigationMenuPrimitive.Item>
                ),
              )}
            </NavigationMenuPrimitive.List>
          </NavigationMenuPrimitive.Root>

          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={CONTACT.phoneTel}
              className="flex items-center gap-2 text-sm text-foreground/75 transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Phone className="h-4 w-4" aria-hidden />
              <span>{CONTACT.phoneDisplay}</span>
            </a>
            <Link
              to="/book"
              data-cursor="book"
              className="inline-flex items-center justify-center rounded-sm bg-gold-gradient px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Book Now
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="relative z-[60] rounded-sm p-2 text-foreground transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={menuId}
          >
            {open ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </header>

      <div
        id={menuId}
        ref={menuPanelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        hidden={!open}
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
      >
        {open && (
          <>
            <div className="absolute inset-0 bg-[color:var(--surface-black)]/98 backdrop-blur-2xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(55% 40% at 85% 10%, color-mix(in oklab, var(--champagne) 22%, transparent), transparent 70%), radial-gradient(45% 35% at 10% 90%, color-mix(in oklab, var(--gold-deep) 18%, transparent), transparent 65%)",
              }}
            />
            <div className="relative flex h-full flex-col overflow-y-auto px-8 pt-28 pb-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-6 bg-champagne/60" aria-hidden />
                <span className="eyebrow">Menu</span>
              </div>

              <nav className="flex flex-col" aria-label="Mobile">
                {NAV_ENTRIES.map((entry, i) =>
                  isGroup(entry) ? (
                    <details key={entry.label} className="group border-b border-border/40 py-2">
                      <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-display text-3xl text-foreground transition-colors marker:content-none hover:text-champagne focus-visible:outline-none focus-visible:text-champagne">
                        <span className={isEntryActive(entry) ? "text-champagne" : undefined}>
                          {entry.label}
                        </span>
                        <ChevronDown
                          className="h-5 w-5 shrink-0 text-champagne/60 transition-transform duration-300 group-open:rotate-180"
                          aria-hidden
                        />
                      </summary>
                      <div className="flex flex-col pb-3 pl-1">
                        {entry.items.map((item) => (
                          <Link
                            key={item.to + item.label}
                            to={item.to}
                            onClick={closeMenu}
                            className="py-3 text-lg text-foreground/70 transition-colors hover:text-champagne focus-visible:outline-none focus-visible:text-champagne"
                            activeProps={{ className: "!text-champagne" }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      key={entry.to}
                      ref={i === 0 ? firstLinkRef : undefined}
                      to={entry.to}
                      onClick={closeMenu}
                      className="group flex items-baseline justify-between border-b border-border/40 py-4 font-display text-3xl text-foreground transition-colors hover:text-champagne focus-visible:outline-none focus-visible:text-champagne"
                      activeProps={{ className: "text-champagne" }}
                      activeOptions={{ exact: entry.to === "/" }}
                    >
                      <span>{entry.label}</span>
                    </Link>
                  ),
                )}
              </nav>

              <div
                className="mt-8 h-px w-full bg-linear-to-r from-champagne/50 via-champagne/15 to-transparent"
                aria-hidden
              />

              <div className="mt-8 space-y-4">
                <a
                  href={CONTACT.phoneTel}
                  className="flex items-center gap-3 text-base text-foreground/85 transition hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Phone className="h-4 w-4 text-champagne" aria-hidden />
                  {CONTACT.phoneDisplay}
                </a>
                <a
                  href={CONTACT.emailMailto}
                  className="block text-sm text-foreground/70 transition hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CONTACT.email}
                </a>
                <p className="text-sm text-muted-foreground">{CONTACT.locationLine}</p>
              </div>

              <Link
                to="/book"
                onClick={closeMenu}
                className="mt-10 block rounded-sm bg-gold-gradient px-6 py-4 text-center text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-onyx shadow-[var(--shadow-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Book Now
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
