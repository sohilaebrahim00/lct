import { z } from "zod";
import { FORM_TYPES } from "./types";

const CONTROL_CHAR_CODES = [
  ...Array.from({ length: 9 }, (_, i) => i), // 0-8
  11,
  12,
  ...Array.from({ length: 18 }, (_, i) => i + 14), // 14-31
  127,
];
const CONTROL_CHAR_RE = new RegExp(
  `[${CONTROL_CHAR_CODES.map((c) => String.fromCharCode(c)).join("")}]`,
  "g",
);

/**
 * Strips non-printing control characters (keeping tab/newline/carriage
 * return, which are legitimate in textareas) and trims — applied to every
 * free-text field before validation.
 */
export function sanitizeText(value: string | undefined | null): string | undefined {
  if (value == null) return undefined;
  const cleaned = value.replace(CONTROL_CHAR_RE, "").trim();
  return cleaned.length ? cleaned : undefined;
}

const optionalText = (max: number) =>
  z
    .string()
    .transform((v) => sanitizeText(v))
    .refine((v) => v === undefined || v.length <= max, { message: `Must be ${max} characters or fewer` })
    .optional();

const optionalNumericString = (max: number) =>
  z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d+$/.test(v.trim()) && Number(v.trim()) <= max),
      { message: `Must be a number up to ${max}` },
    );

/**
 * The one source of truth for what a valid form submission looks like on
 * the client. The Supabase RLS `WITH CHECK` policy (see the 2026-08-02
 * hardening migration) enforces the same shape of constraints server-side —
 * this schema is the UX layer, not the security boundary; a bypassed
 * client can never write a row the database itself wouldn't also reject.
 */
export const submissionSchema = z.object({
  formType: z.enum(FORM_TYPES),
  clientToken: z.string().min(8).max(100),
  website: z.string().max(0, "Bot detected").optional().or(z.literal("")),
  customerName: z
    .string()
    .transform((v) => sanitizeText(v) ?? "")
    .refine((v) => v.length >= 2 && v.length <= 200, "Please enter your full name"),
  customerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .max(320)
    .email("Please enter a valid email"),
  phone: optionalText(40),
  companyName: optionalText(200),
  pickupAddress: optionalText(500),
  dropoffAddress: optionalText(500),
  additionalStops: optionalText(1000),
  tripType: optionalText(100),
  pickupDateTime: z.string().optional(),
  returnDateTime: z.string().optional(),
  passengers: optionalNumericString(200),
  luggage: optionalNumericString(200),
  vehiclePreference: optionalText(200),
  flightNumber: optionalText(40),
  airline: optionalText(100),
  meetAndGreet: z.boolean().optional(),
  corporateBooking: z.boolean().optional(),
  specialRequests: optionalText(2000),
  sourcePage: optionalText(200),
});

export type ValidatedSubmission = z.infer<typeof submissionSchema>;
