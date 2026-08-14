import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LogIn, X } from "lucide-react";
import { MyLimoBizLoginButton } from "./mylimobiz-login-button";
import {
  getMyLimoBizAuthenticatedServerSnapshot,
  getMyLimoBizAuthenticatedSnapshot,
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

  // Confirmed via testing: on mobile, this popover's trigger sits near the
  // bottom of the (already tall, independently-scrollable) mobile nav
  // panel, so the panel opened mostly below the visible viewport — fully
  // reachable by scrolling, but with nothing on screen hinting that, which
  // read as "the widget doesn't appear". Scroll it into view automatically
  // instead of leaving that to chance.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

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
        {authenticated ? "My Account" : "Client Login"}
      </button>

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
        className={`absolute top-full z-50 mt-3 w-[min(20rem,90vw)] max-h-[75vh] overflow-y-auto rounded-sm border border-gold/30 bg-[color:var(--surface-elevated)] shadow-[var(--shadow-luxe)] ${
          panelAlign === "right" ? "right-0" : "left-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="eyebrow text-gold">{authenticated ? "My Account" : "Client Login"}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-sm p-1 text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {/* MyLimoBiz's own login iframe renders inside here, unstyled by
            us beyond width/scroll constraints on this panel — same
            cross-origin limitation already accepted for the booking
            widget on /book. */}
        <MyLimoBizLoginButton anchorClassName="block px-4 py-4 text-sm text-foreground/80" />
      </div>
    </div>
  );
}
