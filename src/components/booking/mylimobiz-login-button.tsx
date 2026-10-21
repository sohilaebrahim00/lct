import { useEffect, useRef } from "react";
import { BOOKING } from "@/lib/site-data";

/**
 * MyLimoBiz "Client Login" widget button — same `data-ores-widget` pattern
 * as the booking widget in `mylimobiz-widget.tsx`, and the same real
 * constraint applies: `widget-loader.js` does one synchronous DOM scan the
 * instant it finishes loading (no MutationObserver, no re-scan), converting
 * every `<a data-ores-widget>` it finds into an iframe/trigger *in place*.
 * If React ever reconciles that anchor after the script has mutated it
 * (e.g. because a parent like `SiteNav` re-renders on scroll), React's
 * stale fiber silently reverts the third-party change — a bug already
 * documented and fixed for the booking widget. Unlike that widget, this
 * button never needs to move between routes, but it's still always
 * mounted inside frequently re-rendering parents (`SiteNav`, `SiteFooter`),
 * so the same escape hatch applies: the anchor is created with plain DOM
 * APIs and appended into a host `<div>` that JSX never describes children
 * for, so React has nothing of its own to reconcile there.
 *
 * The anchor is created on mount, but this component no longer loads
 * `widget-loader.js` itself: `MyLimoBizLoginPopover` loads it when a visitor
 * reaches for "Client Login" (and `/book` loads it for the booking widget).
 * Loading it on mount converted every anchor on every page — three login
 * iframes plus the hidden booking iframe — which pulled ~3.4 MB and 118
 * requests (MyLimoBiz, Google Maps, Stripe, Facebook, LogRocket, Square) into
 * every page view, held the load event for 5–19 s, and ran MyLimoBiz's
 * first-visit Safari redirect to book.mylimobiz.com on whatever page a
 * Safari visitor opened first (measured 2026-10-21).
 */

const LOGIN_URL = `${BOOKING.url}/widget/login`;

export function MyLimoBizLoginButton({ anchorClassName }: { anchorClassName: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.childElementCount > 0) return; // guard React 19 StrictMode double-invoke

    const anchor = document.createElement("a");
    anchor.href = LOGIN_URL;
    anchor.setAttribute("data-ores-widget", "login");
    anchor.setAttribute("data-ores-alias", BOOKING.alias);
    // Send the visitor back to the exact page they logged in from, on this
    // site — not a hardcoded page — matching the supplied widget snippet's
    // `{redirect_url}` placeholder with a real value.
    anchor.setAttribute("data-redirect-url", window.location.href);
    anchor.textContent = "Client Login";
    anchor.className = anchorClassName;
    host.appendChild(anchor);
  }, [anchorClassName]);

  // `className="contents"` keeps this wrapper out of flex/flow layout math
  // entirely (no extra box), so the anchor sizes and positions exactly as
  // if it were the direct JSX child — required since React must own this
  // div, but must never own what's inside it.
  return <div ref={hostRef} className="contents" />;
}
