/**
 * Sitewide "has logged in with MyLimoBiz before" flag.
 *
 * Important honesty note: this is NOT a live session check. MyLimoBiz's
 * login widget is a cross-origin iframe (book.mylimobiz.com) — this site
 * has no access to its session cookie and no webhook telling us when that
 * session ends, so a real "is the visitor currently logged in right now"
 * state is not something this frontend can know. What IS verifiable: their
 * own `widget-loader.js` (fetched and read directly, not guessed) does
 * `window.location = event.data` — a real top-level navigation to their
 * dashboard — whenever it receives a `postMessage` containing
 * "la-login-widget-dashboard", which only happens after a successful
 * login. `Analytics` listens for that exact signal (see analytics.tsx) and
 * calls `setMyLimoBizAuthenticated(true)` here, right before that
 * navigation happens.
 *
 * Persisted to localStorage (not sessionStorage) since the point is to
 * recognize a *returning, previously-authenticated* visitor across visits,
 * not just within one tab session. Every trigger of `MyLimoBizLoginPopover`
 * reads this (header, mobile nav, footer — all the same component), so the
 * "Client Login" label switches to "My Account" everywhere at once, not
 * just on /book — but clicking it always opens the same real MyLimoBiz
 * login widget, since we cannot know whether their session is still valid.
 */

const STORAGE_KEY = "lct-mylimobiz-authenticated";

let cached: boolean | null = null;
const listeners = new Set<() => void>();

function read(): boolean {
  if (cached !== null) return cached;
  try {
    cached = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    cached = false;
  }
  return cached;
}

export function setMyLimoBizAuthenticated(value: boolean) {
  if (read() === value) return;
  cached = value;
  try {
    if (value) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore — in-memory cache still updates the UI for this session */
  }
  listeners.forEach((l) => l());
}

export function subscribeMyLimoBizAuthenticated(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMyLimoBizAuthenticatedSnapshot() {
  return read();
}

const getServerSnapshot = () => false;
export { getServerSnapshot as getMyLimoBizAuthenticatedServerSnapshot };
