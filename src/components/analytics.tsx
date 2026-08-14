import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { initTracking, trackPageview, track } from "@/lib/tracking";
import { setMyLimoBizAuthenticated } from "@/lib/mylimobiz-auth-state";

// Supplementary to `data-cursor="book"` (already applied sitewide to every
// booking CTA) — catches lead-gen CTAs that route to /contact or similar
// rather than /book, e.g. "Reserve Your Ride" / "Request a Quote" /
// "Get Started", so `cta_click` covers both without re-tagging every button.
const CTA_TEXT_PATTERNS = [/^reserve\b/i, /^request a?\s*quote/i, /^get started/i];

function isCtaElement(el: HTMLElement): boolean {
  if (el.getAttribute("data-cursor") === "book") return true;
  const text = (el.textContent || "").trim();
  return CTA_TEXT_PATTERNS.some((re) => re.test(text));
}

/** Explicit label first, then accessible name, then visible text, then the page — always something meaningful for reporting. */
function labelFor(el: HTMLElement): string {
  return (
    el.getAttribute("data-track-label") ||
    el.getAttribute("aria-label") ||
    el.textContent?.trim() ||
    window.location.pathname
  );
}

/**
 * Mounted once in `__root.tsx`. Initializes tracking a single time, fires a
 * `page_view` on every SPA route change (gtag.js has no idea client-side
 * navigation happened otherwise), and delegates click tracking for phone /
 * email / WhatsApp / booking / CTA buttons from one listener instead of
 * instrumenting every individual button — those elements already carry the
 * attributes this reads (`data-cursor="book"` on every "Book Now"-style CTA
 * from the Phase 2 booking pass; `tel:`/`mailto:`/`wa.me` hrefs already used
 * sitewide via the centralized `CONTACT` object). Also listens for the one
 * verified signal MyLimoBiz's booking widget actually sends on a completed
 * reservation, to fire a real `conversion` event — see `track.bookingComplete`.
 */
export function Analytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firstRun = useRef(true);

  useEffect(() => {
    initTracking();
  }, []);

  useEffect(() => {
    // Skip the very first fire — the static `gtag('config', 'AW-...')`
    // call in index.html <head> already accounts for the initial
    // pageview; this avoids a double-count on first load.
    if (firstRun.current) {
      firstRun.current = false;
      if (pathname === "/book") track.reachBookingPage();
      return;
    }
    trackPageview(pathname, document.title);
    if (pathname === "/book") track.reachBookingPage();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.("a,button") as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-cursor="book"]')) {
        track.bookingCtaClick(window.location.pathname);
      }
      if (isCtaElement(target)) {
        track.ctaClick(labelFor(target));
      }

      const href = target.getAttribute("href");
      if (!href) return;
      if (href.startsWith("tel:")) track.phoneClick(labelFor(target));
      else if (href.startsWith("mailto:")) track.emailClick(window.location.pathname);
      else if (href.includes("wa.me")) track.whatsappClick(labelFor(target));
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // Real signals from MyLimoBiz's widget-loader.js (fetched and read
  // directly from book.mylimobiz.com, not guessed) — it does
  // `window.location = event.data` on a `postMessage` whose data contains
  // either "widget-booking-data" (completed reservation) or
  // "la-login-widget-dashboard" (successful login), the mechanism it uses
  // to leave the widget for its own hosted dashboard/confirmation page.
  // Both fire once per page load; both ignore anything not actually from
  // MyLimoBiz. See `track.bookingComplete` and
  // `src/lib/mylimobiz-auth-state.ts` for what each does with the signal.
  useEffect(() => {
    let bookingFired = false;
    let loginFired = false;
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes("mylimobiz.com")) return;
      if (typeof event.data !== "string") return;
      if (!bookingFired && event.data.includes("widget-booking-data")) {
        bookingFired = true;
        track.bookingComplete();
      }
      if (!loginFired && event.data.includes("la-login-widget-dashboard")) {
        loginFired = true;
        setMyLimoBizAuthenticated(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
