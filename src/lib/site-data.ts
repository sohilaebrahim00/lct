/**
 * Centralized business data for LCT Universal.
 * Source of truth: PROJECT_SPEC.md (old site + client decisions).
 * Do not invent rates, capacities, service areas, or brands.
 */

export const COMPANY = {
  name: "LCT Universal",
  legalName: "LCT Universal Executive Transports",
  foundedYear: 2025,
  tagline: "Executive Travel, Elevated.",
  shortDescription:
    "Premium chauffeured transportation designed around comfort, reliability, discretion, and professional service.",
} as const;

export const CONTACT = {
  phoneDisplay: "+1 (888) 615-4065",
  phoneTel: "tel:+18886154065",
  whatsappNumber: "18886154065",
  whatsappUrl: "https://wa.me/18886154065",
  email: "reservations@lctuniversal.com",
  emailMailto: "mailto:reservations@lctuniversal.com",
  locationLine: "Grapevine, Texas 76051",
  city: "Grapevine",
  state: "Texas",
  zip: "76051",
  /** Primary verified service region — do not expand without verified source */
  serviceRegion: "Dallas–Fort Worth and Grapevine, Texas",
  serviceRegionShort: "Dallas–Fort Worth",
  dispatchHours: "24 hours a day, 7 days a week",
  managementHours: "9:00 AM – 4:00 PM, Monday–Saturday",
  managementClosed: "Closed Sundays",
  /** Client-supplied official profile (2026-08-07) — supersedes the previous profile.php?id= link. */
  facebookUrl: "https://www.facebook.com/share/1ahFndK39X/?mibextid=wwXlfr",
  /** Live domain — used for absolute canonical/OG URLs and JSON-LD. Update if the production domain changes. */
  siteUrl: "https://lctuniversal.com",
  /** Client-supplied official profile (2026-08-07) — the earlier withheld/unverified handle is superseded by this confirmed one. */
  instagramUrl: "https://www.instagram.com/lctuniversal?igsh=b3NsOTJoYm4xbjNk" as string | null,
  /** Client-supplied official profile (2026-08-07). */
  tiktokUrl: "https://www.tiktok.com/@lctuniversal?_r=1&_t=ZT98ZvU1WQjU6" as string | null,
  /** Client-supplied official profile (2026-08-07). */
  youtubeUrl: "https://youtube.com/@lctuniversallimoservices?si=nDXFJsd1PagOz6TI" as string | null,
  linkedinUrl: null as string | null,
} as const;

/**
 * Live MyLimoBiz / ORES production reservation system — the operational
 * booking source of truth. Do not rebuild dispatch/reservation logic locally;
 * this is the one place the alias/URLs are defined.
 */
export const BOOKING = {
  alias: "luxlanetransports",
  widgetScriptSrc: "https://book.mylimobiz.com/v4/widgets/widget-loader.js",
  url: "https://book.mylimobiz.com/v4/luxlanetransports",
} as const;

/** Legacy / non-active contact data retained for documentation only — never render */
export const LEGACY_CONTACT = {
  whatsappNumber: "16823441891",
  whatsappUrl: "https://wa.me/16823441891",
  note: "Removed from active UI per Phase 2 client decision. Prefer 18886154065.",
} as const;

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/fleet", label: "Fleet" },
  { to: "/corporate", label: "Corporate" },
  { to: "/airport", label: "Airport" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

import type { ImageKey } from "./image-map";

export type FleetVehicleStatus = "bookable" | "quote_only";

export type FleetVehicle = {
  id: string;
  name: string;
  model: string;
  pax: string;
  bags: string | null;
  priceFrom: string | null;
  priceLabel: string;
  status: FleetVehicleStatus;
  features: readonly string[];
  imageKey: ImageKey;
};

export const FLEET_VEHICLES: readonly FleetVehicle[] = [
  {
    id: "sedan",
    name: "Executive Sedan",
    model: "Mercedes-Benz S-Class",
    pax: "3",
    bags: "2",
    // Verified live 2026-08-08 directly from the MyLimoBiz booking system's
    // displayed rate. Shown as a "From" figure, not "/hour" — the live
    // system did not confirm this is an hourly base rate, only a current
    // per-trip display value, so no hourly semantics are invented.
    priceFrom: "95",
    priceLabel: "From $95",
    status: "bookable",
    imageKey: "fleetSedan",
    features: [
      "Premium leather interior",
      "Complimentary Wi-Fi when available",
      "Bottled water & amenities",
      "Privacy tinted windows",
    ],
  },
  {
    id: "firstClassSedan",
    name: "First Class Sedan",
    model: "Mercedes-Benz S-Class",
    pax: "2",
    bags: "2",
    // CORRECTED 2026-08-08 — direct client correction, highest-priority
    // source per the pricing hierarchy (client-confirmed > live booking
    // system > project docs > old site). Supersedes the earlier $140 figure
    // (a real but non-submitted ~6-mile point-to-point quote, which the
    // client has now clarified isn't the right number for this class) and
    // is explicitly confirmed hourly this time, unlike the earlier figure —
    // "$150/hour" is used verbatim rather than "From $150" since the client
    // stated the hourly rate directly, not a generic display figure.
    priceFrom: "150",
    priceLabel: "$150/hour",
    status: "bookable",
    imageKey: "fleetFirstClassSedan",
    features: [
      "Premium leather interior",
      "White-glove chauffeur service",
      "Bottled water & amenities",
      "Privacy tinted windows",
    ],
  },
  {
    id: "suv",
    name: "Executive SUV",
    model: "Cadillac Escalade",
    pax: "6",
    bags: "6",
    priceFrom: "110",
    priceLabel: "From $110",
    status: "bookable",
    imageKey: "fleetSuv",
    features: [
      "Captain's chairs",
      "Extended legroom",
      "Extra luggage capacity",
      "Ideal for VIPs and families",
    ],
  },
  {
    id: "luxurySuv",
    name: "Luxury SUV",
    model: "Cadillac Escalade",
    pax: "6",
    bags: "6",
    priceFrom: "130",
    priceLabel: "From $130",
    status: "bookable",
    imageKey: "fleetLuxurySuv",
    features: [
      "Captain's chairs",
      "Extended legroom",
      "Extra luggage capacity",
      "Premium-tier service level",
    ],
  },
  {
    id: "sprinter",
    name: "Executive Sprinter",
    model: "Mercedes-Benz Sprinter",
    // Corrected 2026-08-08 — this project's own earlier "12–14"/"12+" figures
    // disagreed with the verified live MyLimoBiz capacity (14 / 10); the
    // verified figure wins per explicit client instruction.
    pax: "14",
    bags: "10",
    priceFrom: null,
    // The old site's "$200/hour" figure and this project's own earlier
    // "From $200/hour" were both never verified against the live booking
    // system and are dropped per explicit 2026-08-08 client correction
    // ("do not keep incorrect labels/prices just because they existed
    // previously"). Live MyLimoBiz check (2026-08-08, real quote, DFW
    // Terminal D → Grapevine Mills Mall) confirmed Executive Sprinter is
    // quote-routed there too (no fixed fare shown, "Request Quote"), so
    // "Quote only" is the verified-accurate label, not a guess.
    priceLabel: "Quote only",
    // Reclassified quote_only 2026-08-02 per explicit client direction (Fleet
    // conversion-flow pass): route through the quote/inquiry flow rather than
    // direct MyLimoBiz booking.
    status: "quote_only",
    imageKey: "fleetSprinter",
    features: [
      "Conference seating",
      "USB & power outlets",
      "High headroom",
      "Perfect for corporate groups",
    ],
  },
  {
    id: "coachMini",
    name: "Executive Mini Coach",
    // Corrected 2026-08-08 per explicit client instruction: the vehicle in
    // `fleetCoach`/`fleetCoachJourney` (coach-airport-arrival.jpg,
    // coach-sideprofile-day.jpg) is a single-rear-axle, cutaway-chassis
    // shuttle bus — visually confirmed via direct image inspection, NOT a
    // full-size motorcoach — so it was mislabeled "Executive Coach" /
    // "37–50 passengers" before. Live MyLimoBiz check (2026-08-08) confirmed
    // a real "Mini Coach" class at 39 passengers, matching this vehicle's
    // real scale and the client's suggested 25–39 range almost exactly —
    // used the verified live number (39) rather than the suggested range.
    model: "Mini Coach Bus",
    pax: "Up to 39",
    bags: null,
    priceFrom: null,
    priceLabel: "Quote only",
    status: "quote_only",
    imageKey: "fleetCoach",
    features: [
      "Ideal for smaller groups, wedding parties, and corporate shuttles",
      "Premium seating and storage",
      "Professional chauffeur service",
    ],
  },
  {
    id: "coachLarge",
    name: "Executive Coach",
    // New 2026-08-08 per explicit client instruction — added only because a
    // genuinely distinct full-size motorcoach photo actually exists:
    // `groupCoachStory` (group-coach-bus.jpg) was visually confirmed to show
    // a different vehicle from the Mini Coach — tandem rear axle, full coach
    // fascia, multiple luggage bay doors — not a reused/relabeled crop of
    // the same bus. Live MyLimoBiz check (2026-08-08) confirmed a real
    // "Motor Coach" class at 56 passengers, exactly matching the client's
    // stated "Up to 56 passengers." Public-facing name follows the client's
    // explicit instruction ("Executive Coach"); MyLimoBiz's own internal
    // class name ("Motor Coach") is noted here for reference only.
    model: "Motor Coach",
    pax: "Up to 56",
    bags: null,
    priceFrom: null,
    priceLabel: "Quote only",
    status: "quote_only",
    imageKey: "groupCoachStory",
    features: [
      "Ideal for large weddings, conventions, and large-scale group logistics",
      "Professional chauffeur service",
      "Coordinated multi-vehicle logistics available on request",
    ],
  },
] as const;

/**
 * Vehicles offered in booking / quote selects — single source of truth for
 * every vehicle-preference `<select>` sitewide (currently: /airport). Built
 * directly from `FLEET_VEHICLES` so this list can never drift out of sync
 * with the published fleet names again — updated 2026-08-08 to cover all 7
 * live classes instead of the previous 5.
 */
export const BOOKING_VEHICLE_OPTIONS = [
  ...FLEET_VEHICLES.map((v) => `${v.name} — ${v.model}`),
  "No preference",
] as const;

export type BookingVehicleOption = (typeof BOOKING_VEHICLE_OPTIONS)[number];

/**
 * Verified live 2026-08-08 directly from the MyLimoBiz booking system (a
 * real, non-submitted point-to-point quote: DFW Airport Terminal D →
 * Grapevine Mills Mall, 1 passenger) — the actual bookable vehicle class
 * names, capacities, and displayed rates the live system currently offers,
 * in the order/grouping it showed them. All 7 are now published as their
 * own `FLEET_VEHICLES` cards too (Luxury SUV and First Class Sedan added
 * 2026-08-08) — this remains the raw verified source list for the Rates &
 * Pricing page specifically.
 */
export const VERIFIED_LIVE_VEHICLE_CLASSES = [
  { name: "Sedan", pax: 3, bags: 2, priceLabel: "From $95" },
  { name: "SUV", pax: 6, bags: 6, priceLabel: "From $110" },
  { name: "Luxury SUV", pax: 6, bags: 6, priceLabel: "From $130" },
  { name: "First Class Sedan", pax: 2, bags: 2, priceLabel: "$150/hour" },
  { name: "Executive Sprinter", pax: 14, bags: 10, priceLabel: "Request Quote" },
  { name: "Mini Coach", pax: 39, bags: null, priceLabel: "Request Quote" },
  { name: "Motor Coach", pax: 56, bags: null, priceLabel: "Request Quote" },
] as const;

/** Documented for review — not published as active fleet cards */
export const FLEET_REVIEW_ITEMS = [
  {
    name: "Mercedes-Benz V-Class",
    note: "Appeared in prior booking options — not on verified fleet page, and did not appear as a class in the 2026-08-08 live MyLimoBiz check",
  },
  { name: "Limousine", note: "Mentioned in old FAQ — no model, rate, or capacity verified" },
] as const;

export const RATES = {
  disclaimer:
    "Rates vary by vehicle type, trip distance, and service type. Exact pricing is calculated instantly through our live booking system.",
  // Verified 2026-08-08 live displayed rates — client-approved conservative
  // "From $X" framing, since the live system did not confirm these are
  // hourly base rates (see FLEET_VEHICLES priceLabel comments).
  pricingCaveat:
    "Final pricing may vary by service type, route, date, duration and vehicle availability. Check the live booking system for your exact rate.",
  airportNote:
    "Airport transfer pricing is calculated by pickup and drop-off location through the live booking system.",
  /** Verified live 2026-08-08 — see VERIFIED_LIVE_VEHICLE_CLASSES for the full source list. */
  verifiedClassNames: [
    "Sedan",
    "SUV",
    "Luxury SUV",
    "First Class Sedan",
    "Executive Sprinter",
    "Mini Coach",
    "Motor Coach",
  ],
} as const;

export const SERVICES_VERIFIED = [
  {
    id: "private",
    title: "Private Transportation",
    desc: "Premium door-to-door transport in luxury vehicles, operated by professional chauffeurs who prioritize comfort, safety, and privacy.",
  },
  {
    id: "airport",
    title: "Airport Transfers",
    desc: "Smooth airport pickups and drop-offs with punctual arrivals, luggage assistance, flight monitoring, and meet-and-greet options.",
  },
  {
    id: "group",
    title: "Large Group Transfers",
    desc: "Modern coaches and spacious vans for corporate groups, weddings, conferences, and special outings.",
  },
  {
    id: "city-tours",
    title: "City Tours and Travel",
    desc: "Personalized transportation in luxury vehicles with experienced chauffeurs for flexible, refined city travel.",
  },
  {
    id: "corporate",
    title: "Corporate Transportation",
    desc: "Reliable executive transportation for meetings and VIP guests — punctuality, privacy, and smooth business travel.",
  },
  {
    id: "family",
    title: "Family Travel & Child Safety",
    desc: "Child car seats available upon request. Safe, comfortable travel for every member of the family.",
  },
] as const;

/** Extended marketing services from current project — keep until Phase 4 storytelling refine */
export const SERVICES_EXTENDED = [
  {
    id: "chauffeur",
    title: "Executive Chauffeur",
    desc: "Professional, discreet chauffeurs with formal presentation.",
  },
  {
    id: "hourly",
    title: "Hourly Chauffeur",
    desc: "As-directed service by the hour with multiple stops and waiting time.",
  },
  {
    id: "point-to-point",
    title: "Point to Point",
    desc: "Direct chauffeured transfers between any two locations.",
  },
  {
    id: "hotel",
    title: "Hotel Transfers",
    desc: "Property-to-property arrivals for visiting executives and guests.",
  },
  {
    id: "meetings",
    title: "Business Meetings",
    desc: "On-time arrivals to boardrooms, client dinners, and closings.",
  },
  {
    id: "vip",
    title: "VIP Transportation",
    desc: "Private clients with discretion protocols and coordinated service.",
  },
  {
    id: "long-distance",
    title: "Long Distance",
    desc: "Intercity travel in comfort with single-chauffeur continuity.",
  },
  {
    id: "events",
    title: "Weddings & Private Occasions",
    desc: "Coordinated luxury fleets for ceremonies and formal receptions.",
  },
] as const;

export const CANCELLATION_SUMMARY = {
  sedanSuv: [
    "More than 12 hours before pickup — full refund",
    "Within 12 hours — 50% of the fare",
    "Within 2 hours or no-show — full charge",
  ],
  airport: [
    "Notify at least 6 hours before pickup to avoid charges",
    "Less than 6 hours — 50% of the fare",
    "Airport no-show without notice — 100% of the fare",
  ],
  hourlyEvents: [
    "At least 48 hours in advance — full refund",
    "Within 48 hours — 50% of the fare",
    "Same-day cancellation or no-show — full charge",
  ],
  modifications:
    "Modifications made less than 6 hours before pickup may be subject to availability and additional fees.",
  exceptions:
    "In cases of severe weather or verified emergencies, fees may be waived at the company’s discretion.",
} as const;

/**
 * Real client-supplied affiliation/trust badges (2026-08-08). Original files
 * copied verbatim (unmodified pixels, renamed only) from the client's
 * supplied logo1.png/logo2.png/logo3.png into public/assets/official/ as
 * badge-gnet.png / badge-nla.png / badge-bbb.png — mapping confirmed by
 * direct visual inspection of each file, not by filename: logo1 → GNET
 * ("Proud GNET Member" hexagon badge), logo2 → NLA (National Limousine
 * Association, "40th Anniversary — Proud Member 2025" badge), logo3 → BBB
 * (Better Business Bureau "Accredited Business" seal).
 *
 * `src` below points at *display* derivatives, not always the raw original:
 * badge-gnet.png already had a genuinely transparent background (verified
 * by sampling raw pixel alpha at its corners — 0,0,0,0) so it's used as-is.
 * badge-nla.png and badge-bbb.png both had a fully opaque white background
 * baked into the source pixels (no usable alpha, or alpha present but the
 * background itself opaque white) — `badge-nla-transparent.png` /
 * `badge-bbb-transparent.png` are flood-fill-cleaned derivatives (only
 * background pixels connected to the image border were made transparent —
 * not a global color threshold, which was tried first and confirmed via
 * visual inspection to incorrectly erode NLA's own light anti-aliased ring
 * strokes) that keep every real design pixel — including BBB's intentional
 * white torch/lettering panel, which the flood-fill correctly left alone
 * since it's enclosed by the badge's own border, not connected to the outer
 * background. The untouched originals remain on disk for reference.
 */
// Not linked to an external URL — this project has no verified,
// business-specific profile page for any of the three organizations, and
// linking to just their generic homepages would assert a specificity the
// badges themselves don't establish. Plain images, same as the physical
// badge artwork itself.
export const TRUST_BADGES = [
  { name: "BBB Accredited Business", src: "/assets/official/badge-bbb-transparent.png" },
  { name: "GNET Member", src: "/assets/official/badge-gnet.png" },
  { name: "NLA Member", src: "/assets/official/badge-nla-transparent.png" },
] as const;
