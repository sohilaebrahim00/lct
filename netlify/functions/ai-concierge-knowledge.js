/**
 * Static knowledge dataset for the AI Concierge Netlify Function.
 *
 * This is a plain-JS, dependency-free copy of the verified facts in
 * `src/lib/site-data.ts` / `src/lib/concierge/knowledge.ts` — NOT an
 * import of either. Netlify Functions bundle in isolation from the Vite
 * frontend, and `site-data.ts` is TypeScript with Vite-specific tooling
 * assumptions, so duplicating the plain data here (rather than reaching
 * across the bundler boundary) is the same manual-sync convention this
 * project already used for the earlier Supabase Edge Function version —
 * see PROJECT_SPEC.md §1c-42. If fleet, rates, service-area, or policy
 * copy in `site-data.ts` changes, this file must be updated to match.
 */

export const COMPANY = {
  name: "LCT Universal",
  legalName: "LCT Universal Executive Transports",
  tagline: "Executive Travel, Elevated.",
  shortDescription:
    "Premium chauffeured transportation designed around comfort, reliability, discretion, and professional service.",
};

export const CONTACT = {
  phoneDisplay: "+1 (888) 615-4065",
  email: "reservations@lctuniversal.com",
  locationLine: "Grapevine, Texas 76051",
  serviceRegion: "Dallas–Fort Worth and Grapevine, Texas",
  dispatchHours: "24 hours a day, 7 days a week",
  managementHours: "9:00 AM – 4:00 PM, Monday–Saturday",
  managementClosed: "Closed Sundays",
};

export const FLEET_VEHICLES = [
  { name: "Executive Sedan", model: "Mercedes-Benz S-Class", pax: "3", bags: "2", priceLabel: "From $95", status: "bookable" },
  { name: "First Class Sedan", model: "Mercedes-Benz S-Class", pax: "2", bags: "2", priceLabel: "$150/hour", status: "bookable" },
  { name: "Executive SUV", model: "Cadillac Escalade", pax: "6", bags: "6", priceLabel: "From $110", status: "bookable" },
  { name: "Luxury SUV", model: "Cadillac Escalade", pax: "6", bags: "6", priceLabel: "From $130", status: "bookable" },
  { name: "Executive Sprinter", model: "Mercedes-Benz Sprinter", pax: "14", bags: "10", priceLabel: "Quote only", status: "quote_only" },
  { name: "Executive Mini Coach", model: "Mini Coach Bus", pax: "Up to 39", bags: null, priceLabel: "Quote only", status: "quote_only" },
  { name: "Executive Coach", model: "Motor Coach", pax: "Up to 56", bags: null, priceLabel: "Quote only", status: "quote_only" },
];

export const RATES = {
  disclaimer:
    "Rates vary by vehicle type, trip distance, and service type. Exact pricing is calculated instantly through our live booking system.",
  pricingCaveat:
    "Final pricing may vary by service type, route, date, duration and vehicle availability. Check the live booking system for your exact rate.",
  airportNote:
    "Airport transfer pricing is calculated by pickup and drop-off location through the live booking system.",
};

export const SERVICE_AREA_GROUPS = [
  {
    title: "Dallas & Surrounding Communities",
    cities: ["Dallas", "Highland Park", "University Park", "Addison", "Farmers Branch", "Garland", "Richardson", "Mesquite", "Balch Springs", "Sunnyvale", "Rowlett", "Sachse", "Seagoville", "Hutchins", "Wilmer", "Lancaster", "DeSoto", "Duncanville", "Cedar Hill", "Red Oak", "Glenn Heights", "Ovilla"],
  },
  {
    title: "Fort Worth & Southwest Metro",
    cities: ["Fort Worth", "Arlington", "Benbrook", "Lake Worth", "River Oaks", "White Settlement", "Westworth Village", "Sansom Park", "Forest Hill", "Everman", "Edgecliff Village", "Kennedale", "Mansfield", "Crowley", "Burleson", "Pantego", "Dalworthington Gardens"],
  },
  {
    title: "Mid-Cities & North DFW",
    cities: ["Grapevine", "Southlake", "Colleyville", "Westlake", "Trophy Club", "Roanoke", "Keller", "Euless", "Bedford", "Hurst", "North Richland Hills", "Richland Hills", "Haltom City", "Watauga", "Saginaw", "Haslet", "Azle", "Blue Mound"],
  },
];

export const AIRPORT_WAIT_POLICY =
  "Airport pickups include 1 hour of complimentary waiting time; pickups outside the airport include 30 minutes.";

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
    "In cases of severe weather or verified emergencies, fees may be waived at the company's discretion.",
};

export function buildKnowledgeSummary() {
  const fleetLines = FLEET_VEHICLES.map(
    (v) =>
      `- ${v.name} (${v.model}): ${v.pax} passengers, ${v.bags ?? "no dedicated"} luggage, ${v.priceLabel}${
        v.status === "quote_only" ? " — quote required, not instantly bookable" : ""
      }`,
  ).join("\n");

  const areaLines = SERVICE_AREA_GROUPS.map((g) => `- ${g.title}: ${g.cities.join(", ")}`).join("\n");

  return `
COMPANY: ${COMPANY.legalName} ("${COMPANY.name}"). Tagline: "${COMPANY.tagline}". ${COMPANY.shortDescription}
Based in ${CONTACT.locationLine}. Dispatch: ${CONTACT.dispatchHours}. Management office hours: ${CONTACT.managementHours}, ${CONTACT.managementClosed}.
Phone: ${CONTACT.phoneDisplay}. Email: ${CONTACT.email}.

FLEET (Sedan and First Class Sedan are distinct classes — never merge them):
${fleetLines}

RATES: ${RATES.disclaimer} ${RATES.pricingCaveat} ${RATES.airportNote}
Published rates above are "From" starting figures for the bookable classes, not guaranteed final quotes. Quote-only classes have no published starting rate.

SERVICE AREAS — Dallas–Fort Worth Metroplex, dispatched from Grapevine:
${areaLines}
If a requested city is not listed, do not claim service there — offer to have dispatch confirm via the Contact page instead of guessing.

AIRPORT WAITING TIME POLICY: ${AIRPORT_WAIT_POLICY}

CANCELLATION POLICY:
- Sedan/SUV trips: ${CANCELLATION_SUMMARY.sedanSuv.join("; ")}.
- Airport transfers: ${CANCELLATION_SUMMARY.airport.join("; ")}.
- Hourly/event bookings: ${CANCELLATION_SUMMARY.hourlyEvents.join("; ")}.
- ${CANCELLATION_SUMMARY.modifications}
- ${CANCELLATION_SUMMARY.exceptions}

BOOKING: All reservations and final pricing go through the live MyLimoBiz system at /book. Never quote a final fare, never confirm a booking, never invent a confirmation number, never claim a driver has been assigned — always direct booking intent to /book.

JOIN OUR TEAM: Three real pathways at /join-our-team, each a Clienity CRM form you do not handle directly: Driver Application, Company Partner, Referral Partner. Direct any driver/partner/referral intent there — never collect application details in chat.
`.trim();
}
