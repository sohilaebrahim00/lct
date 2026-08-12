import { supabase } from "@/integrations/supabase/client";
import { sanitizeText } from "@/lib/forms/schema";
import {
  driverApplicationSchema,
  companyPartnerApplicationSchema,
  referralPartnerApplicationSchema,
} from "./schema";
import type {
  ApplicationResult,
  DriverApplicationInput,
  CompanyPartnerApplicationInput,
  ReferralPartnerApplicationInput,
} from "./types";

const clean = (value?: string) => sanitizeText(value) ?? null;

const RATE_LIMIT_KEY = "lct-last-application-at";
const RATE_LIMIT_WINDOW_MS = 15_000; // UX guard only — real enforcement is the DB trigger

function checkClientRateLimit(): boolean {
  try {
    const last = Number(localStorage.getItem(RATE_LIMIT_KEY) ?? 0);
    return Date.now() - last < RATE_LIMIT_WINDOW_MS;
  } catch {
    return false;
  }
}

function markClientRateLimit() {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function sourcePage(): string | undefined {
  return typeof window !== "undefined" ? window.location.pathname : undefined;
}

export async function submitDriverApplication(
  data: DriverApplicationInput,
  clientToken: string,
  honeypot: string,
): Promise<ApplicationResult> {
  if (honeypot) return { ok: true, id: "spam" };
  if (checkClientRateLimit()) return { ok: false, error: "rate_limited" };

  const parsed = driverApplicationSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "validation_failed" };
  const v = parsed.data;

  const row = {
    full_name: v.fullName,
    email: v.email,
    phone: v.phone,
    street_address: clean(v.streetAddress),
    city: clean(v.city),
    state: clean(v.state),
    country: clean(v.country),
    postal_code: clean(v.postalCode),
    felony_conviction: v.felonyConviction,
    dui_past_5_years: v.duiPast5Years,
    chauffeur_experience: v.chauffeurExperience,
    headshot_path: v.headshotPath,
    license_front_path: v.licenseFrontPath,
    license_back_path: v.licenseBackPath,
    transportation_license_path: clean(v.transportationLicensePath),
    certification_consent: v.certificationConsent,
    background_check_consent: v.backgroundCheckConsent,
    screening_notice_ack: v.screeningNoticeAck,
    data_consent: v.dataConsent,
    employment_terms_ack: v.employmentTermsAck,
    source_page: clean(sourcePage()),
    client_token: clientToken,
    status: "received",
    raw_payload: JSON.parse(JSON.stringify(data)),
  };

  const { data: inserted, error } = await supabase
    .from("driver_applications")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    if (import.meta.env.DEV) console.warn("[application] driver submission failed:", error.code, error.message);
    if (error.code === "23505") return { ok: false, error: "duplicate_submission" };
    if (error.message?.includes("rate_limit_exceeded")) return { ok: false, error: "rate_limited" };
    return { ok: false, error: "storage_failed" };
  }

  markClientRateLimit();
  return { ok: true, id: inserted?.id };
}

export async function submitCompanyPartnerApplication(
  data: CompanyPartnerApplicationInput,
  clientToken: string,
  honeypot: string,
): Promise<ApplicationResult> {
  if (honeypot) return { ok: true, id: "spam" };
  if (checkClientRateLimit()) return { ok: false, error: "rate_limited" };

  const parsed = companyPartnerApplicationSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "validation_failed" };
  const v = parsed.data;

  const row = {
    full_name: v.fullName,
    email: v.email,
    phone: v.phone,
    job_title: clean(v.jobTitle),
    company_name: clean(v.companyName),
    company_email: clean(v.companyEmail),
    company_phone: clean(v.companyPhone),
    website: clean(v.website),
    street_address: clean(v.streetAddress),
    city: clean(v.city),
    state: clean(v.state),
    country: clean(v.country),
    postal_code: clean(v.postalCode),
    years_operating: v.yearsOperating || null,
    active_drivers: clean(v.activeDrivers),
    fleet_vehicle_count: clean(v.fleetVehicleCount),
    fleet_description: clean(v.fleetDescription),
    suit_requirement: v.suitRequirement || null,
    business_license_path: clean(v.businessLicensePath),
    operating_permit_path: clean(v.operatingPermitPath),
    ein_letter_path: clean(v.einLetterPath),
    insurance_cert_path: clean(v.insuranceCertPath),
    certification_ack: v.certificationAck,
    no_partnership_disclaimer_ack: v.noPartnershipDisclaimerAck,
    contact_consent_ack: v.contactConsentAck,
    source_page: clean(sourcePage()),
    client_token: clientToken,
    status: "received",
    raw_payload: JSON.parse(JSON.stringify(data)),
  };

  const { data: inserted, error } = await supabase
    .from("company_partner_applications")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    if (import.meta.env.DEV) console.warn("[application] company partner submission failed:", error.code, error.message);
    if (error.code === "23505") return { ok: false, error: "duplicate_submission" };
    if (error.message?.includes("rate_limit_exceeded")) return { ok: false, error: "rate_limited" };
    return { ok: false, error: "storage_failed" };
  }

  markClientRateLimit();
  return { ok: true, id: inserted?.id };
}

export async function submitReferralPartnerApplication(
  data: ReferralPartnerApplicationInput,
  clientToken: string,
  honeypot: string,
): Promise<ApplicationResult> {
  if (honeypot) return { ok: true, id: "spam" };
  if (checkClientRateLimit()) return { ok: false, error: "rate_limited" };

  const parsed = referralPartnerApplicationSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "validation_failed" };
  const v = parsed.data;

  const row = {
    full_name: v.fullName,
    email: v.email,
    phone: v.phone,
    country: v.country,
    city: v.city,
    applicant_type: v.applicantType,
    company_brand_name: clean(v.companyBrandName),
    website: clean(v.website),
    instagram: clean(v.instagram),
    facebook: clean(v.facebook),
    linkedin: clean(v.linkedin),
    other_platform: clean(v.otherPlatform),
    referral_method: v.referralMethod,
    estimated_referrals: v.estimatedReferrals,
    preferred_payment: v.preferredPayment || null,
    agreement_ack_1: v.agreementAck1,
    agreement_ack_2: v.agreementAck2,
    source_page: clean(sourcePage()),
    client_token: clientToken,
    status: "received",
    raw_payload: JSON.parse(JSON.stringify(data)),
  };

  const { data: inserted, error } = await supabase
    .from("referral_partner_applications")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    if (import.meta.env.DEV) console.warn("[application] referral partner submission failed:", error.code, error.message);
    if (error.code === "23505") return { ok: false, error: "duplicate_submission" };
    if (error.message?.includes("rate_limit_exceeded")) return { ok: false, error: "rate_limited" };
    return { ok: false, error: "storage_failed" };
  }

  markClientRateLimit();
  return { ok: true, id: inserted?.id };
}
