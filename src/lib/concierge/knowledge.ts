/**
 * Structured knowledge layer for the AI Concierge. Built entirely from
 * verified project data (site-data.ts) — no invented facts. This is the
 * "compact structured knowledge dataset" fed to the system prompt on each
 * request (not the entire website, and not a vector database — the site is
 * small enough that a structured summary is sufficient, per explicit
 * instruction to prefer simple retrieval over unnecessary complexity).
 *
 * Shared between the (not-yet-deployed) Supabase Edge Function and any
 * future server context — kept framework-agnostic (no React/DOM imports) so
 * it can be copied into `supabase/functions/ai-concierge/` verbatim.
 */
import { COMPANY, CONTACT, FLEET_VEHICLES, RATES, SERVICE_AREA_GROUPS, CANCELLATION_SUMMARY } from "../site-data";

export const ALL_SERVICE_AREA_CITIES = SERVICE_AREA_GROUPS.flatMap((g) => g.cities);

/**
 * Airport waiting-time policy — direct client-confirmed information (per
 * this task's own source-of-truth hierarchy, direct client statements rank
 * above existing site copy). Not previously documented elsewhere in
 * site-data.ts; recorded here as the single source of truth for this fact
 * so it isn't duplicated inline in the Edge Function or system prompt.
 */
export const AIRPORT_WAIT_POLICY = {
  airportPickupMinutes: 60,
  outsidePickupMinutes: 30,
  note: "Airport pickups include 1 hour of complimentary waiting time; pickups outside the airport include 30 minutes.",
} as const;

export function buildKnowledgeSummary(): string {
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
Phone: ${CONTACT.phoneDisplay}. Email: ${CONTACT.email}. WhatsApp available.

FLEET (do not merge Sedan and First Class Sedan — they are distinct classes):
${fleetLines}

RATES: ${RATES.disclaimer} ${RATES.pricingCaveat} ${RATES.airportNote}
Published rates above are "From" starting figures for the bookable classes, not guaranteed final quotes. Quote-only classes (Executive Sprinter, Mini Coach, Executive Coach) have no published rate — always direct these to /book.

SERVICE AREAS — Dallas–Fort Worth Metroplex, dispatched from Grapevine:
${areaLines}
If a requested city is not in this list, do not claim service there — offer to have dispatch confirm via the Contact page instead of guessing.

AIRPORT WAITING TIME POLICY: ${AIRPORT_WAIT_POLICY.note}

CANCELLATION POLICY:
- Sedan/SUV trips: ${CANCELLATION_SUMMARY.sedanSuv.join("; ")}.
- Airport transfers: ${CANCELLATION_SUMMARY.airport.join("; ")}.
- Hourly/event bookings: ${CANCELLATION_SUMMARY.hourlyEvents.join("; ")}.
- ${CANCELLATION_SUMMARY.modifications}
- ${CANCELLATION_SUMMARY.exceptions}

BOOKING: All reservations and final pricing go through the live MyLimoBiz booking system at /book. The concierge must never quote a final fare, confirm a booking, invent a confirmation number, or claim a driver has been assigned — always direct booking intent to /book.

JOIN OUR TEAM: Three pathways at /join-our-team, each a real Clienity CRM form (not handled by this concierge): Driver Application (for chauffeurs wanting to drive for LCT Universal), Company Partner (for transportation companies wanting to partner their fleet), Referral Partner (for people who want to refer clients for a commission). Direct any driver/partner/referral intent to /join-our-team — do not attempt to collect application details in chat.
`.trim();
}

export type ConciergeIntent =
  | "fleet_recommendation"
  | "pricing_question"
  | "service_area"
  | "airport"
  | "corporate"
  | "join_our_team"
  | "booking"
  | "policy"
  | "escalate"
  | "general";

/** Lightweight, deterministic first-pass intent hints — not a replacement for the model's own judgment, just cheap keyword routing used to decide which knowledge slice to emphasize in the prompt and to short-circuit obvious escalation/injection attempts before they reach the model. */
export function classifyIntentHint(message: string): ConciergeIntent {
  const m = message.toLowerCase();
  if (/reservation|existing booking|change my booking|lost item|complaint|accessib|wheelchair|urgent|emergency/.test(m)) return "escalate";
  if (/drive for you|become a driver|driver application|partner (my|our) (fleet|company)|refer (a )?client|referral partner|join.*team|work with (you|lct)/.test(m)) return "join_our_team";
  if (/airport|dfw|love field|flight|terminal|meet.?and.?greet/.test(m)) return "airport";
  if (/corporate|business account|client visit|executive travel/.test(m)) return "corporate";
  if (/service area|do you (serve|cover|go to)|pick.?up in|available in/.test(m)) return "service_area";
  if (/book|reserve|schedule a ride|tonight|tomorrow/.test(m)) return "booking";
  if (/how much|price|cost|rate|\$/.test(m)) return "pricing_question";
  if (/cancel|refund|policy|wait(ing)? time/.test(m)) return "policy";
  if (/how many (passengers|people|bags|luggage)|which (vehicle|car)|sedan|suv|sprinter|coach/.test(m)) return "fleet_recommendation";
  return "general";
}
