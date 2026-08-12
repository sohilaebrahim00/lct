import { z } from "zod";
import { sanitizeText } from "@/lib/forms/schema";

const requiredText = (min: number, max: number, message: string) =>
  z
    .string()
    .transform((v) => sanitizeText(v) ?? "")
    .refine((v) => v.length >= min && v.length <= max, message);

const optionalText = (max: number) =>
  z
    .string()
    .transform((v) => sanitizeText(v))
    .refine((v) => v === undefined || v.length <= max, `Must be ${max} characters or fewer`)
    .optional();

const email = z.string().trim().toLowerCase().max(320).email("Please enter a valid email");
const phone = requiredText(7, 40, "Please enter a valid phone number");

export const driverApplicationSchema = z.object({
  fullName: requiredText(2, 200, "Please enter your full name"),
  email,
  phone,
  streetAddress: optionalText(300),
  city: optionalText(120),
  state: optionalText(120),
  country: optionalText(120),
  postalCode: optionalText(20),
  felonyConviction: z.enum(["Yes", "No"], { message: "Please answer this question" }),
  duiPast5Years: z.enum(["Yes", "No"], { message: "Please answer this question" }),
  chauffeurExperience: z.enum(["Less than 1 year", "1-3 years", "3-5 years", "5+ years"], {
    message: "Please select your experience level",
  }),
  headshotPath: z.string().min(1, "Please upload a headshot"),
  licenseFrontPath: z.string().min(1, "Please upload the front of your driver's license"),
  licenseBackPath: z.string().min(1, "Please upload the back of your driver's license"),
  transportationLicensePath: z.string().optional(),
  certificationConsent: z.literal(true, { message: "Required to submit" }),
  backgroundCheckConsent: z.literal(true, { message: "Required to submit" }),
  screeningNoticeAck: z.literal(true, { message: "Required to submit" }),
  dataConsent: z.literal(true, { message: "Required to submit" }),
  employmentTermsAck: z.literal(true, { message: "Required to submit" }),
});

export const companyPartnerApplicationSchema = z.object({
  fullName: requiredText(2, 200, "Please enter your full name"),
  email,
  phone,
  jobTitle: optionalText(150),
  companyName: optionalText(200),
  companyEmail: z.string().max(320).email().optional().or(z.literal("")),
  companyPhone: optionalText(40),
  website: optionalText(300),
  streetAddress: optionalText(300),
  city: optionalText(120),
  state: optionalText(120),
  country: optionalText(120),
  postalCode: optionalText(20),
  yearsOperating: z.enum(["Less than 1 year", "1-3 years", "3-5 years", "5+ years", ""]).optional(),
  activeDrivers: optionalText(20),
  fleetVehicleCount: optionalText(20),
  fleetDescription: optionalText(2000),
  suitRequirement: z.enum(["Yes - Always", "Yes - Upon request", "No", ""]).optional(),
  businessLicensePath: z.string().optional(),
  operatingPermitPath: z.string().optional(),
  einLetterPath: z.string().optional(),
  insuranceCertPath: z.string().optional(),
  certificationAck: z.literal(true, { message: "Required to submit" }),
  noPartnershipDisclaimerAck: z.literal(true, { message: "Required to submit" }),
  contactConsentAck: z.literal(true, { message: "Required to submit" }),
});

export const referralPartnerApplicationSchema = z.object({
  fullName: requiredText(2, 200, "Please enter your full name"),
  email,
  phone,
  country: requiredText(2, 120, "Please enter your country"),
  city: requiredText(2, 120, "Please enter your city"),
  applicantType: z.enum(
    [
      "Influencer",
      "Social Media Marketer",
      "Sales Professional",
      "Business Consultant",
      "Transportation Industry Contact",
      "Other",
    ],
    { message: "Please select an option" },
  ),
  companyBrandName: optionalText(200),
  website: optionalText(300),
  instagram: optionalText(200),
  facebook: optionalText(200),
  linkedin: optionalText(200),
  otherPlatform: optionalText(200),
  referralMethod: requiredText(2, 2000, "Please tell us how you plan to generate referrals"),
  estimatedReferrals: z.enum(["1-3", "3-10", "10+"], { message: "Please select an option" }),
  preferredPayment: z.enum(["Zelle", "ACH", "PayPal", "Wire Transfer", ""]).optional(),
  agreementAck1: z.literal(true, { message: "Required to submit" }),
  agreementAck2: z.literal(true, { message: "Required to submit" }),
});
