export const FORM_TYPES = [
  "contact",
  "quote",
  "booking",
  "corporate",
  "airport",
  "event",
  "fleet",
  "service_inquiry",
] as const;

export type FormType = (typeof FORM_TYPES)[number];

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  contact: "Contact Request",
  quote: "Quote Request",
  booking: "Booking Request",
  corporate: "Corporate Account Request",
  airport: "Airport Transfer Request",
  event: "Event Transportation Request",
  fleet: "Fleet Inquiry",
  service_inquiry: "Service Inquiry",
};

export interface SubmissionInput {
  formType: FormType;
  customerName: string;
  customerEmail: string;
  phone?: string;
  companyName?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  additionalStops?: string;
  tripType?: string;
  pickupDateTime?: string;
  returnDateTime?: string;
  passengers?: string;
  luggage?: string;
  vehiclePreference?: string;
  flightNumber?: string;
  airline?: string;
  meetAndGreet?: boolean;
  corporateBooking?: boolean;
  specialRequests?: string;
  sourcePage?: string;
  clientToken: string; // random UUID per submission (dedupe)
  website?: string; // honeypot — MUST be empty
  captchaToken?: string; // reserved for future CAPTCHA
}

export interface SubmissionResult {
  ok: boolean;
  id?: string;
  status?: string;
  companyEmailSent?: boolean;
  customerEmailSent?: boolean;
  error?: string;
}
