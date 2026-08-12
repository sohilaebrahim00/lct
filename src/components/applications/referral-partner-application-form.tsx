import { useMemo, useState } from "react";
import {
  ApplicationSection,
  CheckboxAckField,
  HoneypotField,
  RadioGroupField,
  SelectField,
  TextAreaField,
  TextField,
} from "./form-fields";
import { SubmitBar, SuccessPanel, type SubmitState } from "./submit-bar";
import { submitReferralPartnerApplication } from "@/lib/applications/submit.client";
import type { ReferralPartnerApplicationInput } from "@/lib/applications/types";
import { track } from "@/lib/tracking";

function randomToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ReferralPartnerApplicationForm() {
  const clientToken = useMemo(() => randomToken(), []);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorCode, setErrorCode] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [values, setValues] = useState<ReferralPartnerApplicationInput>({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    applicantType: "",
    companyBrandName: "",
    website: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    otherPlatform: "",
    referralMethod: "",
    estimatedReferrals: "",
    preferredPayment: "",
    agreementAck1: false,
    agreementAck2: false,
  });

  const set = <K extends keyof ReferralPartnerApplicationInput>(key: K, v: ReferralPartnerApplicationInput[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  const validate = (payload: ReferralPartnerApplicationInput): boolean => {
    const errs: Record<string, string> = {};
    if (payload.fullName.trim().length < 2) errs.fullName = "Please enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email.trim())) errs.email = "Please enter a valid email";
    if (payload.phone.trim().length < 7) errs.phone = "Please enter a valid phone number";
    if (!payload.country.trim()) errs.country = "Required";
    if (!payload.city.trim()) errs.city = "Required";
    if (!payload.applicantType) errs.applicantType = "Please select an option";
    if (!payload.referralMethod.trim()) errs.referralMethod = "Please tell us how you plan to generate referrals";
    if (!payload.estimatedReferrals) errs.estimatedReferrals = "Please select an option";
    if (!payload.agreementAck1) errs.agreementAck1 = "Required to submit";
    if (!payload.agreementAck2) errs.agreementAck2 = "Required to submit";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "submitting") return;
    if (!validate(values)) return;

    setState("submitting");
    try {
      const res = await submitReferralPartnerApplication(values, clientToken, honeypot);
      if (res.ok) {
        setState("success");
        track.leadSubmitSuccess("referral_partner_application");
      } else {
        setState("error");
        setErrorCode(res.error);
      }
    } catch {
      setState("error");
      setErrorCode(undefined);
    }
  };

  if (state === "success") {
    return (
      <SuccessPanel
        title="Your referral partner application has been received."
        message="Thank you for your interest in becoming an LCT Universal referral partner. Our team will review your application and follow up with next steps."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="luxe-card space-y-8 rounded-sm p-8 md:p-10">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <ApplicationSection title="Your Information">
        <TextField id="referral-fullName" label="Full Name" required value={values.fullName} onChange={(v) => set("fullName", v)} autoComplete="name" error={fieldErrors.fullName} />
        <TextField id="referral-email" label="Email" type="email" required value={values.email} onChange={(v) => set("email", v)} autoComplete="email" error={fieldErrors.email} />
        <TextField id="referral-phone" label="Phone" type="tel" required value={values.phone} onChange={(v) => set("phone", v)} autoComplete="tel" error={fieldErrors.phone} />
        <TextField id="referral-country" label="Country" required value={values.country} onChange={(v) => set("country", v)} autoComplete="country-name" error={fieldErrors.country} />
        <TextField id="referral-city" label="City" required value={values.city} onChange={(v) => set("city", v)} autoComplete="address-level2" error={fieldErrors.city} />
      </ApplicationSection>

      <ApplicationSection title="Professional Background">
        <RadioGroupField
          id="referral-applicantType"
          label="What best describes you?"
          required
          value={values.applicantType}
          onChange={(v) => set("applicantType", v as ReferralPartnerApplicationInput["applicantType"])}
          options={["Influencer", "Social Media Marketer", "Sales Professional", "Business Consultant", "Transportation Industry Contact", "Other"]}
          colSpan={2}
          error={fieldErrors.applicantType}
        />
        <TextField id="referral-companyBrand" label="Company / Brand Name (If Applicable)" value={values.companyBrandName ?? ""} onChange={(v) => set("companyBrandName", v)} colSpan={2} />
      </ApplicationSection>

      <ApplicationSection title="Social / Web Presence" description="Optional — share whatever's relevant.">
        <TextField id="referral-website" label="Website" type="url" value={values.website ?? ""} onChange={(v) => set("website", v)} placeholder="https://" />
        <TextField id="referral-instagram" label="Instagram Profile" value={values.instagram ?? ""} onChange={(v) => set("instagram", v)} />
        <TextField id="referral-facebook" label="Facebook Profile / Page" value={values.facebook ?? ""} onChange={(v) => set("facebook", v)} />
        <TextField id="referral-linkedin" label="LinkedIn Profile" value={values.linkedin ?? ""} onChange={(v) => set("linkedin", v)} />
        <TextField id="referral-otherPlatform" label="Other Platform (Optional)" value={values.otherPlatform ?? ""} onChange={(v) => set("otherPlatform", v)} colSpan={2} />
      </ApplicationSection>

      <ApplicationSection title="Promotion Method">
        <TextAreaField
          id="referral-method"
          label="How do you plan to generate referrals?"
          required
          value={values.referralMethod}
          onChange={(v) => set("referralMethod", v)}
          colSpan={2}
          rows={3}
          error={fieldErrors.referralMethod}
        />
        <RadioGroupField
          id="referral-estimated"
          label="Estimated referrals per month?"
          required
          value={values.estimatedReferrals}
          onChange={(v) => set("estimatedReferrals", v as ReferralPartnerApplicationInput["estimatedReferrals"])}
          options={["1-3", "3-10", "10+"]}
          colSpan={2}
          error={fieldErrors.estimatedReferrals}
        />
      </ApplicationSection>

      <ApplicationSection title="Payment Information">
        <SelectField
          id="referral-payment"
          label="Preferred Payment Method"
          value={values.preferredPayment ?? ""}
          onChange={(v) => set("preferredPayment", v as ReferralPartnerApplicationInput["preferredPayment"])}
          options={["Zelle", "ACH", "PayPal", "Wire Transfer"]}
          colSpan={2}
        />
      </ApplicationSection>

      <ApplicationSection title="Affiliate Agreement & Acknowledgment">
        <CheckboxAckField
          id="referral-ack1"
          required
          checked={values.agreementAck1}
          onChange={(v) => set("agreementAck1", v)}
          error={fieldErrors.agreementAck1}
        >
          I understand that I am applying as an independent referral/affiliate partner and not as an
          employee, agent, or representative of LCT Universal. Submission of this application does not
          guarantee approval or create any contractual obligation.
        </CheckboxAckField>
        <CheckboxAckField
          id="referral-ack2"
          required
          checked={values.agreementAck2}
          onChange={(v) => set("agreementAck2", v)}
          error={fieldErrors.agreementAck2}
        >
          I understand that commissions are earned only on successfully completed and fully paid
          bookings, and I agree not to misrepresent LCT Universal, its services, pricing, or policies in
          any way.
        </CheckboxAckField>
      </ApplicationSection>

      <SubmitBar state={state} error={errorCode} submitLabel="Submit" />
      <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground/70">
        Submitting this form does not guarantee acceptance into the referral program.
      </p>
    </form>
  );
}
