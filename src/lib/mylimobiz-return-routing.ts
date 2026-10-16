/**
 * Forwards MyLimoBiz "return" URLs to /book, where the reservation widget is
 * actually visible.
 *
 * Root cause of "Create Account doesn't work" (found 2026-10-16 by driving
 * the live login widget in headless Chromium): the links inside MyLimoBiz's
 * login iframe do a top-level navigation back to this site with a marker in
 * the query string —
 *   Register Now      → window.top.location.href = "https://lctuniversal.com/?la-login-widget-register="
 *   Forgot Password?  → "...?la-login-widget-forget-password..."
 *   successful login  → postMessage → window.location = "...la-login-widget-dashboard...&Sid=..."
 * and `widget-loader.js` (fetched and read directly) reacts to that marker by
 * pointing the *reservation* widget (`data-ores-widget="website"`) at
 * /Account/Registration, /Account/ForgotPassword or /Dashboard/Index. That
 * widget is only shown on /book — on every other route `MyLimoBizWidgetHost`
 * parks it in a 0×0 off-screen host. So "Register Now" landed the visitor on
 * the homepage with the registration form rendered invisibly: from their
 * side, the button did nothing.
 *
 * This must run before the router renders and before `widget-loader.js`
 * loads, because the loader reads `window.location.href` exactly once when it
 * scans the page.
 */

const RETURN_MARKERS = [
  "la-login-widget-register",
  "la-login-widget-forget-password",
  "la-login-widget-dashboard",
  "widget-booking-data",
] as const;

/** Returns the /book URL to forward to, or null when no forwarding is needed. */
export function myLimoBizReturnTarget(
  pathname: string,
  search: string,
  hash: string,
): string | null {
  if (pathname === "/book") return null;
  if (!RETURN_MARKERS.some((m) => search.includes(m))) return null;
  return `/book${search}${hash}`;
}

export function forwardMyLimoBizReturnToBook() {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  const target = myLimoBizReturnTarget(pathname, search, hash);
  // replaceState, not a reload: nothing has rendered yet, and Back should
  // not land the visitor on the invisible-form URL again.
  if (target) window.history.replaceState(window.history.state, "", target);
}
