/**
 * Single controlled tracking architecture — one gtag.js load serves both
 * Google Ads and GA4 (Google's own recommended pattern: one script tag,
 * multiple `gtag('config', ...)` calls), StatCounter loads once alongside
 * it. Nothing here fires more than once per page load; nothing duplicates
 * what index.html would otherwise load, because index.html loads nothing —
 * this module is the only place any tracking script is injected.
 *
 * GOOGLE_ADS_ID and STATCOUNTER are the verified production identifiers
 * supplied for this project. GA4_MEASUREMENT_ID is intentionally sourced
 * from an env var that is not currently set — no real GA4 property ID has
 * been provided, and fabricating one would silently misreport analytics
 * data forever. GA4 activates automatically the moment
 * `VITE_GA4_MEASUREMENT_ID` is set; until then `initTracking()` simply
 * skips it.
 */

const GOOGLE_ADS_ID = "AW-18237817494";
const STATCOUNTER_PROJECT = 13222021;
const STATCOUNTER_SECURITY = "abf8a3d5";
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    sc_project?: number;
    sc_security?: string;
  }
}

let initialized = false;

function loadScriptOnce(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

/** Call once, as early as convenient (mounted from `__root.tsx`). */
export function initTracking() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // --- Google gtag.js (Ads +, once available, GA4) ---
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
  if (GA4_MEASUREMENT_ID) {
    window.gtag("config", GA4_MEASUREMENT_ID, { send_page_view: false }); // SPA: we send page_view ourselves on route change
  }
  loadScriptOnce(`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`);

  // --- StatCounter ---
  window.sc_project = STATCOUNTER_PROJECT;
  window.sc_security = STATCOUNTER_SECURITY;
  loadScriptOnce("https://www.statcounter.com/counter/counter.js");
}

/** SPA route change — gtag.js does not know about client-side navigation on its own. */
export function trackPageview(path: string, title: string) {
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

/**
 * Generic event helper. Every call site below fires only after a verified
 * user action — never speculatively, never on mere page load of a
 * conversion-adjacent page (e.g. reaching /book is tracked as
 * `reach_booking_page`, a neutral engagement signal).
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.("event", name, params);
}

function pageLocation(): string {
  return typeof window !== "undefined" ? window.location.href : "";
}

/** Clean engagement-event shape shared by phone/WhatsApp/CTA events, per spec. */
function engagementParams(label: string, extra?: Record<string, unknown>) {
  return { event_category: "engagement", event_label: label, page_location: pageLocation(), ...extra };
}

export const track = {
  bookingCtaClick: (source: string) => trackEvent("book_cta_click", { source }),
  reachBookingPage: () => trackEvent("reach_booking_page"),
  /** Fires only after `submitFormClient` resolves `res.ok` in LeadForm — never on click alone. */
  leadSubmitSuccess: (formType: string) =>
    trackEvent("generate_lead", { form_name: formType, form_type: formType, page_location: pageLocation() }),
  phoneClick: (label: string) => trackEvent("phone_call", engagementParams(label)),
  emailClick: (source: string) => trackEvent("email_click", { source }),
  whatsappClick: (label: string) => trackEvent("whatsapp_click", engagementParams(label)),
  /** Generic important-CTA tracker (Book Now, Reserve, Request a Quote, Get Started, ...). */
  ctaClick: (buttonName: string) => trackEvent("cta_click", engagementParams(buttonName, { button_name: buttonName })),
  fleetVehicleBookClick: (vehicle: string) => trackEvent("fleet_vehicle_book_click", { vehicle }),
  fleetVehicleQuoteClick: (vehicle: string) => trackEvent("fleet_vehicle_quote_click", { vehicle }),
  fleetCallDispatchClick: () => trackEvent("fleet_call_dispatch_click"),
  // AI Concierge — high-level engagement only, never message content (no
  // user input or assistant reply text is ever passed to analytics).
  aiConciergeOpen: (source: string) => trackEvent("ai_concierge_open", { source }),
  aiActionBookClicked: () => trackEvent("ai_action_book_clicked"),
  aiActionContactClicked: () => trackEvent("ai_action_contact_clicked"),
  /**
   * Booking conversion — fires only on a real signal from the MyLimoBiz
   * booking iframe, not on a button click. MyLimoBiz's own `widget-loader.js`
   * (fetched and read directly from book.mylimobiz.com to confirm this, not
   * assumed) does `window.location = event.data` whenever it receives a
   * `postMessage` whose data contains "widget-booking-data" — the mechanism
   * it uses to leave the widget after a completed reservation. `Analytics`
   * listens for that same signal (origin-checked, fires once) and calls this
   * before that navigation happens. `transport_type: 'beacon'` maximizes the
   * chance the hit is actually sent given a page navigation follows almost
   * immediately. This could not be exercised against a real completed
   * booking in this environment — verify it in Google Ads' conversion
   * diagnostics after a real test reservation.
   */
  bookingComplete: () =>
    trackEvent("conversion", {
      event_category: "conversion",
      event_label: "booking_complete",
      page_location: pageLocation(),
      transport_type: "beacon",
    }),
  /** Ready for a real per-action Ads conversion label the moment one is provided — not called anywhere yet. */
  adsConversion: (conversionLabel: string, value?: number) =>
    trackEvent("conversion", { send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`, value }),
};
