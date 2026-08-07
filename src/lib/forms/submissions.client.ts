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
    return { ok: false, error: "validation_failed" };
  }
  const v = parsed.data;

  const submissionHash = await computeSubmissionHash(data);

  const row = {
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

  const { data: inserted, error } = await supabase
    .from("form_submissions")
    .insert(row)
    .select("id")
    .single();

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
  return { ok: true, id: inserted?.id, status: "received" };
}
