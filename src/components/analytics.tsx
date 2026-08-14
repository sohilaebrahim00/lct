import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { initTracking, trackPageview, track } from "@/lib/tracking";

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
    // Skip the very first fire — initTracking's own `gtag config` call
    // already accounts for the initial pageview once GA4 is configured;
    // this avoids a double-count on first load.
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

  // Real booking-completion signal — see `track.bookingComplete` for the
  // full story on why this specific message shape is what MyLimoBiz's own
  // script uses to leave the widget after a completed reservation. Fires
  // once per page load; ignores anything not actually from MyLimoBiz.
  useEffect(() => {
    let fired = false;
    const onMessage = (event: MessageEvent) => {
      if (fired) return;
      if (!event.origin.includes("mylimobiz.com")) return;
      if (typeof event.data !== "string" || !event.data.includes("widget-booking-data")) return;
      fired = true;
      track.bookingComplete();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
