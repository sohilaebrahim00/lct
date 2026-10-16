import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { SubmissionInput, SubmissionResult } from "./types";
import { submissionSchema, sanitizeText } from "./schema";

const clean = (value?: string) => value?.trim() || null;

const RATE_LIMIT_KEY = "lct-last-submission-at";
const RATE_LIMIT_WINDOW_MS = 15_000; // client-side UX guard only — the real enforcement is the DB trigger

/** SHA-256 of the fields that make two submissions "the same request", hex-encoded. */
async function computeSubmissionHash(data: SubmissionInput): Promise<string | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  const basis = [
    data.formType,
    data.customerEmail.trim().toLowerCase(),
    data.customerName.trim().toLowerCase(),
    data.pickupAddress?.trim().toLowerCase() ?? "",
    data.dropoffAddress?.trim().toLowerCase() ?? "",
    data.pickupDateTime ?? "",
  ].join("|");
  const bytes = new TextEncoder().encode(basis);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function checkClientRateLimit(): boolean {
  try {
    const last = Number(localStorage.getItem(RATE_LIMIT_KEY) ?? 0);
    return Date.now() - last < RATE_LIMIT_WINDOW_MS;
  } catch {
    return false; // private mode / storage unavailable — don't block submission over it
  }
}

function markClientRateLimit() {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export async function submitFormClient(data: SubmissionInput): Promise<SubmissionResult> {
  if (data.website) return { ok: true, id: "spam", status: "received" };

  if (checkClientRateLimit()) {
    return { ok: false, error: "rate_limited" };
  }

  const parsed = submissionSchema.safeParse(data);
  if (!parsed.success) {
    // Surface which fields failed so the form can actually highlight them
    // (e.g. passengers "-1" passes the browser's number input but not the digits-only rule).
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "validation_failed", fieldErrors };
  }
  const v = parsed.data;

  const submissionHash = await computeSubmissionHash(data);

  // Generated client-side (see the insert below for why the DB can't hand it back).
  const id = newSubmissionId();

  const row = {
    ...(id ? { id } : {}),
    form_type: v.formType,
    customer_name: v.customerName,
    customer_email: v.customerEmail,
    phone: clean(v.phone),
    company_name: clean(v.companyName),
    pickup_address: clean(v.pickupAddress),
    dropoff_address: clean(v.dropoffAddress),
    additional_stops: clean(v.additionalStops),
    trip_type: clean(v.tripType),
    pickup_datetime: clean(v.pickupDateTime) ? new Date(v.pickupDateTime!).toISOString() : null,
    return_datetime: clean(v.returnDateTime) ? new Date(v.returnDateTime!).toISOString() : null,
    passengers: clean(v.passengers) ? Number(v.passengers) || null : null,
    luggage: clean(v.luggage) ? Number(v.luggage) || null : null,
    vehicle_preference: clean(v.vehiclePreference),
    flight_number: clean(v.flightNumber),
    airline: clean(v.airline),
    meet_and_greet: !!v.meetAndGreet,
    corporate_booking: !!v.corporateBooking,
    special_requests: clean(v.specialRequests),
    source_page: sanitizeText(data.sourcePage) ?? null,
    submission_hash: submissionHash,
    status: "received",
    raw_payload: JSON.parse(JSON.stringify(data)) as Json,
  };

  // No `.select("id")` read-back: anon only has an INSERT policy on this
  // table (deliberately no SELECT policy — submissions hold customer PII),
  // and PostgreSQL applies SELECT policies to INSERT ... RETURNING, so
  // asking for the new row back made every insert fail with "new row
  // violates row-level security policy" (42501). The id is generated here
  // instead and sent with the row, so the caller still gets a real id.
  const { error } = await supabase.from("form_submissions").insert(row);

  if (error) {
    if (import.meta.env.DEV) {
      // Dev-only — never log submission errors (which can include email/name) in production.
      console.warn("[form] submission failed:", error.code, error.message);
    }
    if (error.code === "23505") {
      return { ok: false, error: "duplicate_submission" };
    }
    if (error.message?.includes("rate_limit_exceeded")) {
      return { ok: false, error: "rate_limited" };
    }
    return { ok: false, error: "storage_failed" };
  }

  markClientRateLimit();
  if (id) requestLeadNotification(id);
  return { ok: true, id: id ?? undefined, status: "received" };
}

/**
 * Asks the `lead-notify` Netlify Function to email the company inbox about
 * the lead just stored. Fire-and-forget: the lead is already safely saved, the
 * visitor's success message never waits on email, and if this request is lost
 * (tab closed, offline, function cold/erroring) the scheduled
 * `lead-notify-sweep` sends the notification within ~5 minutes. Only the id
 * is sent — the function reads the stored row from Supabase server-side.
 */
function requestLeadNotification(id: string) {
  try {
    void fetch("/.netlify/functions/lead-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* the scheduled sweep covers it */
  }
}

function newSubmissionId(): string | null {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : null;
}
