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
    priceFrom: "$100/hour",
    priceLabel: "From $100/hour",
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
    id: "suv",
    name: "Executive SUV",
    model: "Cadillac Escalade",
    pax: "6",
    bags: "6",
    priceFrom: "$120/hour",
    priceLabel: "From $120/hour",
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
    id: "sprinter",
    name: "Executive Sprinter",
    model: "Mercedes-Benz Sprinter",
    pax: "12–14",
    bags: "12+",
    priceFrom: "$200/hour",
    priceLabel: "From $200/hour",
    // Reclassified quote_only 2026-08-02 per explicit client direction (Fleet
    // conversion-flow pass): route through the quote/inquiry flow rather than
    // direct MyLimoBiz booking. Verified rate kept displayed — only the
    // booking mechanism changed, not the underlying pricing data.
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
    id: "coach",
    name: "Executive Coach",
    model: "Luxury Coach Bus",
    pax: "37–50",
    bags: null,
    priceFrom: null,
    priceLabel: "Quote only",
    status: "quote_only",
    imageKey: "fleetCoach",
    features: [
      "Ideal for weddings, conferences, and large events",
      "Premium seating and storage",
      "Professional chauffeur service",
    ],
  },
] as const;

/** Vehicles offered in booking / quote selects — verified bookable options only */
export const BOOKING_VEHICLE_OPTIONS = [
  "Executive Sedan — Mercedes-Benz S-Class",
  "Executive SUV — Cadillac Escalade",
  "Executive Sprinter — Mercedes-Benz Sprinter",
  "Executive Coach — Quote only",
  "No preference",
] as const;

export type BookingVehicleOption = (typeof BOOKING_VEHICLE_OPTIONS)[number];

/** Documented for review — not published as active fleet cards */
export const FLEET_REVIEW_ITEMS = [
  { name: "First Class", note: "Old site rate from $200/hour — vehicle definition unverified" },
  {
    name: "Mercedes-Benz V-Class",
    note: "Appeared in prior booking options — not on verified fleet page",
  },
  { name: "Limousine", note: "Mentioned in old FAQ — no model, rate, or capacity verified" },
  {
    name: "Additional coach variants",
    note: "Coach capacity 37–50 verified; luggage and rates pending",
  },
] as const;

export const RATES = {
  sedanHourlyFrom: "$100/hour",
  suvHourlyFrom: "$120/hour",
  sprinterHourlyFrom: "$200/hour",
  airportTransferFrom: "$120",
  airportTransferNote: "Starting from $120 depending on pickup and drop-off location",
  firstClassHourlyFrom: "$200/hour",
  firstClassNote: "Documented for review — not published as a fleet category until defined",
  disclaimer:
    "Rates vary by vehicle type, trip distance, and time. Minimum service duration may apply. Final pricing is confirmed through our booking process.",
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
