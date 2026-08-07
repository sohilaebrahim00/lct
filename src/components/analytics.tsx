import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { initTracking, trackPageview, track } from "@/lib/tracking";

/**
 * Mounted once in `__root.tsx`. Initializes tracking a single time, fires a
 * `page_view` on every SPA route change (gtag.js has no idea client-side
 * navigation happened otherwise), and delegates click tracking for phone /
 * email / WhatsApp / booking CTAs from one listener instead of instrumenting
 * every individual button — those elements already carry the attributes
 * this reads (`data-cursor="book"` on every "Book Now"-style CTA from the
 * Phase 2 booking pass; `tel:`/`mailto:`/`wa.me` hrefs already used
 * sitewide via the centralized `CONTACT` object).
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
      const target = (e.target as HTMLElement | null)?.closest?.("a,button");
      if (!target) return;

      const bookTrigger = target.closest('[data-cursor="book"]');
      if (bookTrigger) {
        track.bookingCtaClick(window.location.pathname);
        return;
      }

      const href = target.getAttribute("href");
      if (!href) return;
      if (href.startsWith("tel:")) track.phoneClick(window.location.pathname);
      else if (href.startsWith("mailto:")) track.emailClick(window.location.pathname);
      else if (href.includes("wa.me")) track.whatsappClick(window.location.pathname);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
