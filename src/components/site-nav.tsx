import { Link, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { CONTACT, NAV_LINKS } from "@/lib/site-data";

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

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          headerSolid
            ? "border-b border-border/80 bg-[color:var(--surface-elevated)]/92 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--container-max)] items-center justify-between gap-6 px-[var(--page-gutter)]">
          <Logo
            priority
            onClick={open ? closeMenu : undefined}
            imgClassName={`w-auto transition-all duration-500 ${
              scrolled ? "h-11 md:h-12" : "h-12 md:h-14 lg:h-16"
            }`}
            className="shrink-0"
          />

          <nav className="hidden items-center gap-1 xl:gap-2 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                data-cursor="explore"
                className="rounded-sm px-3 py-2 text-[0.8125rem] font-medium tracking-wide text-foreground/65 transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                activeProps={{ className: "text-champagne" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

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
                {NAV_LINKS.map((l, i) => (
                  <Link
                    key={l.to}
                    ref={i === 0 ? firstLinkRef : undefined}
                    to={l.to}
                    onClick={closeMenu}
                    className="group flex items-baseline justify-between border-b border-border/40 py-4 font-display text-3xl text-foreground transition-colors hover:text-champagne focus-visible:outline-none focus-visible:text-champagne"
                    activeProps={{ className: "text-champagne" }}
                    activeOptions={{ exact: l.to === "/" }}
                  >
                    <span>{l.label}</span>
                    <span className="text-[0.65rem] uppercase tracking-[0.28em] text-champagne/35 transition group-hover:text-champagne/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                ))}
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
