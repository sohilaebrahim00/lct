import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LogIn, X } from "lucide-react";
import { MyLimoBizLoginButton } from "./mylimobiz-login-button";
import {
  getMyLimoBizAuthenticatedServerSnapshot,
  getMyLimoBizAuthenticatedSnapshot,
  setMyLimoBizAuthenticated,
  subscribeMyLimoBizAuthenticated,
} from "@/lib/mylimobiz-auth-state";

/**
 * Wraps `MyLimoBizLoginButton` in a small trigger + floating panel instead
 * of embedding it directly inline. Necessary because of a real regression
 * found in QA: once `widget-loader.js` converts the anchor, MyLimoBiz's own
 * `iframeResizer` script sizes the resulting iframe to fit its actual login
 * form content (observed ~326–780px wide, height varying with form state)
 * — completely ignoring any CSS applied to the original anchor, since the
 * anchor itself is removed and replaced. Embedded directly in the header's
 * flex row, that blew the row out (phone number wrapped to 4 lines, "Book
 * Now" pushed off-screen); embedded in the footer's narrow grid column, it
 * overflowed into the neighboring column. An `absolute`-positioned panel is
 * removed from normal layout flow, so whatever size the iframe ends up
 * being can never push or break the surrounding header/footer layout.
 *
 * Mobile positioning (2026-08-15): the panel used to stay `absolute`
 * relative to its trigger everywhere, with a `scrollIntoView` nudge to
 * pull it back on screen on mobile (the trigger sits near the bottom of
 * the tall, independently-scrollable mobile nav panel). Testing found
 * that "nudge and hope it fits" was fundamentally marginal — the login
 * iframe's bottom edge landed within a fraction of a pixel of the
 * viewport edge with zero breathing room, fragile against exactly the
 * kind of real-world variance a synthetic headless check can't see (a
 * phone's dynamic browser toolbar shrinking the effective viewport,
 * slightly different iframe content height, etc.). Below `lg`, the panel
 * is now `fixed` and centered on the viewport itself — completely
 * decoupled from the trigger's scroll position, so it is provably fully
 * visible regardless of where in the nav the trigger sits, with a real
 * backdrop instead of a scroll-triggered reveal. Desktop is untouched —
 * the existing `absolute` dropdown already tested clean with real margin
 * to spare across 1920 down to 1024px.
 */
export function MyLimoBizLoginPopover({
  triggerClassName,
  panelAlign = "right",
}: {
  triggerClassName: string;
  panelAlign?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const authenticated = useSyncExternalStore(
    subscribeMyLimoBizAuthenticated,
    getMyLimoBizAuthenticatedSnapshot,
    getMyLimoBizAuthenticatedServerSnapshot,
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = authenticated ? "My Account" : "Client Login";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={triggerClassName}
      >
        <LogIn className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>

      {/* Mobile-only backdrop — gives the fixed, centered panel below a
          real modal presentation instead of floating over page content
          with no separation. Desktop keeps the plain dropdown, no
          backdrop needed there (already fully on-screen, not covering
          meaningful content). */}
      <div
        hidden={!open}
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className="fixed inset-0 z-[45] bg-black/70 backdrop-blur-sm lg:hidden"
      />

      {/*
        Always mounted (never `{open && ...}`), visibility toggled with the
        `hidden` attribute instead — same fix, same reason, as the mobile
        nav panel: `widget-loader.js` does one synchronous DOM scan the
        instant it finishes loading and never re-scans, so the login anchor
        inside `MyLimoBizLoginButton` MUST already exist in the DOM at that
        moment. If this panel (and the anchor inside it) only mounted when
        a visitor first clicked the trigger — which could happen long after
        the script already ran its one scan, e.g. triggered earlier by the
        footer's own always-mounted instance — the anchor would render but
        never get converted into a working iframe.
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Client Login"
        hidden={!open}
        className={`fixed inset-x-4 top-1/2 z-50 max-h-[80vh] -translate-y-1/2 overflow-y-auto rounded-sm border border-gold/30 bg-[color:var(--surface-elevated)] shadow-[var(--shadow-luxe)] lg:absolute lg:inset-x-auto lg:top-full lg:mt-3 lg:w-[min(20rem,90vw)] lg:max-h-[75vh] lg:translate-y-0 ${
          panelAlign === "right" ? "lg:right-0" : "lg:left-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="eyebrow text-gold">{label}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-sm p-1 text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Honest, additive-only enhancement for returning visitors — see
            src/lib/mylimobiz-auth-state.ts for exactly what "authenticated"
            here does and does not mean. MyLimoBiz's own widget-loader.js
            (fetched and read directly, more than once, to confirm) exposes no
            postMessage or API carrying the visitor's name, reservations, or
            profile data to this site — there is no real data source for a
            "Hi, [name]" greeting or a real Dashboard/Reservations/Profile
            menu, and fabricating one would violate the explicit
            no-fake-login-state requirement this was built under. What *is*
            real: the widget below is the same MyLimoBiz portal that holds
            the visitor's actual account, reservations, and profile — this
            note just makes that explicit instead of leaving a returning
            visitor to wonder why "My Account" still shows a login form. */}
        {authenticated ? (
          <div className="border-b border-border/60 bg-black/10 px-4 py-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Welcome back. Continue below to reach your account, reservations, and profile in
              your MyLimoBiz portal.
            </p>
            <button
              type="button"
              onClick={() => {
                setMyLimoBizAuthenticated(false);
                setOpen(false);
              }}
              className="mt-2 text-[0.7rem] font-semibold uppercase tracking-widest text-gold underline-offset-2 transition hover:text-champagne hover:underline"
            >
              Not you? Sign out of this device
            </button>
          </div>
        ) : null}

        {/* MyLimoBiz's own login iframe renders inside here, unstyled by
            us beyond width/scroll constraints on this panel — same
            cross-origin limitation already accepted for the booking
            widget on /book. */}
        <MyLimoBizLoginButton anchorClassName="block px-4 py-4 text-sm text-foreground/80" />
      </div>
    </div>
  );
}
