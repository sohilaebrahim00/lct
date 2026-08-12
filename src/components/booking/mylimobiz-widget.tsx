import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BOOKING } from "@/lib/site-data";

/**
 * MyLimoBiz / ORES production booking widget.
 *
 * The real `widget-loader.js` (fetched and read directly from
 * book.mylimobiz.com to verify this, not assumed) runs a single synchronous
 * DOM scan the instant it finishes executing: it looks for `<a
 * data-ores-widget>` elements, marks each `data-widget-initialized`, then
 * replaces it with a resize script + `<iframe class="ores4iframe">`. It has
 * no MutationObserver, no re-scan interval, and nothing exported on
 * `window` — so it can never discover an anchor that appears *after* the
 * script has already run once.
 *
 * That makes the naive approach (mount the anchor fresh inside the `/book`
 * route, load the script on mount) break the moment a visitor leaves `/book`
 * and comes back — the second anchor is a brand-new DOM node the already-run
 * script will never see.
 *
 * A first fix attempt kept the anchor as JSX and moved it between containers
 * with `createPortal` (React portals are documented to preserve DOM identity
 * across a changing target). That still broke on navigation, confirmed via
 * testing: the widget reverted to the raw, un-upgraded anchor — no iframe —
 * every time a visitor left `/book` and came back. Root cause: the
 * third-party script replaces the anchor element outside React's knowledge
 * (`anchor.replaceWith(iframeWrapper)`), but React's fiber for that JSX
 * element still references the original (now-detached) anchor object. The
 * instant anything makes React reconcile that subtree again — even just
 * moving an unchanged portal to a new target — React re-inserts *its own*
 * stale node reference into the DOM, silently undoing the third party's
 * mutation.
 *
 * The actual fix: never let React own this subtree at all. The widget
 * container and its anchor are created once with plain DOM APIs and moved
 * between an off-screen host and the `/book` page's slot with imperative
 * `appendChild` calls in an effect — React never re-renders or reconciles
 * these nodes, so it can never revert whatever the third-party script has
 * done to them.
 *
 * Also verified directly from the script: on a visitor's first-ever Safari
 * load (any tab, cookie-gated so it only happens once per browser) it does
 * `window.top.location.href = ".../_safari_fix.html?redirect=<here>"` — a
 * real top-level navigation away and back. That's a real MyLimoBiz behavior,
 * not a bug in this integration; it's why Safari needs its own QA pass.
 */

const SCRIPT_TIMEOUT_MS = 9000;

export type MyLimoBizStatus = "idle" | "loading" | "ready" | "timeout" | "error";

let status: MyLimoBizStatus = "idle";
const listeners = new Set<() => void>();
function setStatus(next: MyLimoBizStatus) {
  status = next;
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getStatus() {
  return status;
}

/** Live status of the widget script (`idle` until first requested on `/book`). */
export function useMyLimoBizStatus() {
  return useSyncExternalStore(subscribe, getStatus);
}

let scriptRequested = false;

/**
 * Exported so other MyLimoBiz widget anchors (e.g. the header/footer
 * "Client Login" button) can trigger the same one-time script load instead
 * of injecting `widget-loader.js` a second time. Safe to call from multiple
 * components — the `scriptRequested` guard below makes every call after the
 * first a no-op.
 */
export function ensureMyLimoBizScript() {
  ensureScriptRequested();
}

function ensureScriptRequested() {
  if (scriptRequested) return;
  scriptRequested = true;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${BOOKING.widgetScriptSrc}"]`,
  );
  if (existing) {
    // Already present (e.g. injected elsewhere) — trust it's loading/loaded,
    // don't inject a second copy.
    setStatus("ready");
    return;
  }

  setStatus("loading");
  const timeoutId = window.setTimeout(() => {
    if (status === "loading") setStatus("timeout");
  }, SCRIPT_TIMEOUT_MS);

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = BOOKING.widgetScriptSrc;
  script.async = true;
  script.addEventListener(
    "load",
    () => {
      window.clearTimeout(timeoutId);
      setStatus("ready");
    },
    { once: true },
  );
  script.addEventListener(
    "error",
    () => {
      window.clearTimeout(timeoutId);
      setStatus("error");
    },
    { once: true },
  );
  document.body.appendChild(script);
}

/** Well-known id the `/book` route renders as the widget's visible landing slot. */
export const MYLIMOBIZ_SLOT_ID = "mylimobiz-slot";

/**
 * Mount once in `__root.tsx`. Renders nothing itself (`return null`) — it
 * owns the persistent widget DOM node (created and moved with plain DOM
 * APIs, never JSX) and relocates it into the `/book` page's slot only while
 * that route is active, otherwise parks it off-screen so the script (and,
 * once loaded, the live iframe) are never torn down or reconciled by React.
 */
export function MyLimoBizWidgetHost() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hiddenHostRef = useRef<HTMLDivElement | null>(null);

  // Created exactly once, during the first render, with plain DOM APIs.
  // React never sees this as JSX, so it never re-renders or "corrects" it.
  if (!containerRef.current) {
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.minHeight = "900px";
    const anchor = document.createElement("a");
    anchor.href = BOOKING.url;
    anchor.setAttribute("data-ores-widget", "website");
    anchor.setAttribute("data-ores-alias", BOOKING.alias);
    anchor.textContent = "Online Reservations";
    container.appendChild(anchor);
    containerRef.current = container;
  }

  useEffect(() => {
    const hiddenHost = document.createElement("div");
    hiddenHost.setAttribute("aria-hidden", "true");
    Object.assign(hiddenHost.style, {
      position: "absolute",
      width: "0",
      height: "0",
      overflow: "hidden",
    });
    document.body.appendChild(hiddenHost);
    hiddenHostRef.current = hiddenHost;
    hiddenHost.appendChild(containerRef.current!);
    return () => {
      hiddenHost.remove();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (pathname !== "/book") {
      hiddenHostRef.current?.appendChild(container);
      return;
    }

    ensureScriptRequested();
    // The slot div commits in the same render pass as this route; querying
    // on the next frame is a cheap, reliable way to avoid a mount-order race
    // without coupling this component to the route's internals.
    const raf = window.requestAnimationFrame(() => {
      document.getElementById(MYLIMOBIZ_SLOT_ID)?.appendChild(container);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
