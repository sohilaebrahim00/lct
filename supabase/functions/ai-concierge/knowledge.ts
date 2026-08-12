/**
 * Deno-compatible copy of src/lib/concierge/knowledge.ts, kept in sync
 * manually (Edge Functions run in Deno and cannot import from the Vite
 * frontend's src/ tree). If the fleet, service areas, rates, or policy
 * copy in src/lib/site-data.ts changes, this file must be updated too —
 * flagged in PROJECT_SPEC.md as a manual-sync point.
 *
 * NOT DEPLOYED — no Supabase CLI authentication is available in this
 * environment (same standing blocker as the earlier Join Our Team
 * migration). This function is written and ready but inert until deployed
 * by someone with dashboard/CLI access via `supabase functions deploy
 * ai-concierge`.
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
  sedanSuv: "More than 12 hours before pickup: full refund. Within 12 hours: 50% of the fare. Within 2 hours or no-show: full charge.",
  airport: "Notify at least 6 hours before pickup to avoid charges. Less than 6 hours: 50% of the fare. Airport no-show without notice: 100% of the fare.",
  hourlyEvents: "At least 48 hours in advance: full refund. Within 48 hours: 50% of the fare. Same-day cancellation or no-show: full charge.",
};

export function buildKnowledgeSummary(): string {
  const fleetLines = FLEET_VEHICLES.map(
    (v) => `- ${v.name} (${v.model}): ${v.pax} passengers, ${v.bags ?? "no dedicated"} luggage, ${v.priceLabel}${v.status === "quote_only" ? " — quote required, not instantly bookable" : ""}`,
  ).join("\n");
  const areaLines = SERVICE_AREA_GROUPS.map((g) => `- ${g.title}: ${g.cities.join(", ")}`).join("\n");

  return `
COMPANY: ${COMPANY.legalName} ("${COMPANY.name}"). Tagline: "${COMPANY.tagline}". ${COMPANY.shortDescription}
Based in ${CONTACT.locationLine}. Dispatch: ${CONTACT.dispatchHours}. Management office hours: ${CONTACT.managementHours}, ${CONTACT.managementClosed}.
Phone: ${CONTACT.phoneDisplay}. Email: ${CONTACT.email}.

FLEET (Sedan and First Class Sedan are distinct classes — never merge them):
${fleetLines}

RATES: Rates vary by vehicle type, trip distance, and service type. Final pricing may vary by service type, route, date, duration and vehicle availability — always calculated instantly through the live booking system at /book. Airport transfer pricing is calculated by pickup and drop-off location. Quote-only classes have no published starting rate.

SERVICE AREAS — Dallas–Fort Worth Metroplex, dispatched from Grapevine:
${areaLines}
If a requested city is not listed, do not claim service there — suggest contacting dispatch to confirm instead of guessing.

AIRPORT WAITING TIME POLICY: ${AIRPORT_WAIT_POLICY}

CANCELLATION POLICY:
- Sedan/SUV trips: ${CANCELLATION_SUMMARY.sedanSuv}
- Airport transfers: ${CANCELLATION_SUMMARY.airport}
- Hourly/event bookings: ${CANCELLATION_SUMMARY.hourlyEvents}

BOOKING: All reservations and final pricing go through the live MyLimoBiz system at /book. Never quote a final fare, never confirm a booking, never invent a confirmation number, never claim a driver has been assigned — always direct booking intent to /book.

JOIN OUR TEAM: Three real pathways at /join-our-team, each a Clienity CRM form you do not handle directly: Driver Application, Company Partner, Referral Partner. Direct any driver/partner/referral intent there — never collect application details in chat.
`.trim();
}
