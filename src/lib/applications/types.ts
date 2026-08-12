export const APPLICATION_TYPES = ["driver", "company-partner", "referral-partner"] as const;
export type ApplicationType = (typeof APPLICATION_TYPES)[number];

export interface ApplicationResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Field inventory audited from the client's real old-site form (2026-08-11). */
export interface DriverApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  felonyConviction: "Yes" | "No" | "";
  duiPast5Years: "Yes" | "No" | "";
  chauffeurExperience: "Less than 1 year" | "1-3 years" | "3-5 years" | "5+ years" | "";
  headshotPath: string;
  licenseFrontPath: string;
  licenseBackPath: string;
  transportationLicensePath?: string;
  certificationConsent: boolean;
  backgroundCheckConsent: boolean;
  screeningNoticeAck: boolean;
  dataConsent: boolean;
  employmentTermsAck: boolean;
}

export interface CompanyPartnerApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  jobTitle?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  website?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  yearsOperating?: "Less than 1 year" | "1-3 years" | "3-5 years" | "5+ years" | "";
  activeDrivers?: string;
  fleetVehicleCount?: string;
  fleetDescription?: string;
  suitRequirement?: "Yes - Always" | "Yes - Upon request" | "No" | "";
  businessLicensePath?: string;
  operatingPermitPath?: string;
  einLetterPath?: string;
  insuranceCertPath?: string;
  certificationAck: boolean;
  noPartnershipDisclaimerAck: boolean;
  contactConsentAck: boolean;
}

export interface ReferralPartnerApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  applicantType:
    | "Influencer"
    | "Social Media Marketer"
    | "Sales Professional"
    | "Business Consultant"
    | "Transportation Industry Contact"
    | "Other"
    | "";
  companyBrandName?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  otherPlatform?: string;
  referralMethod: string;
  estimatedReferrals: "1-3" | "3-10" | "10+" | "";
  preferredPayment?: "Zelle" | "ACH" | "PayPal" | "Wire Transfer" | "";
  agreementAck1: boolean;
  agreementAck2: boolean;
}
