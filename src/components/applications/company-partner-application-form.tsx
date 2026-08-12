import { useMemo, useState } from "react";
import {
  ApplicationSection,
  CheckboxAckField,
  FileField,
  HoneypotField,
  RadioGroupField,
  TextAreaField,
  TextField,
} from "./form-fields";
import { SubmitBar, SuccessPanel, type SubmitState } from "./submit-bar";
import { submitCompanyPartnerApplication } from "@/lib/applications/submit.client";
import { uploadApplicationFile } from "@/lib/applications/upload";
import type { CompanyPartnerApplicationInput } from "@/lib/applications/types";
import { track } from "@/lib/tracking";

function randomToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type FileKey = "businessLicensePath" | "operatingPermitPath" | "einLetterPath" | "insuranceCertPath";
type FileStatus = "idle" | "uploading" | "done" | "error";

const emptyFile = { status: "idle" as FileStatus };

export function CompanyPartnerApplicationForm() {
  const clientToken = useMemo(() => randomToken(), []);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorCode, setErrorCode] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [values, setValues] = useState<Omit<CompanyPartnerApplicationInput, FileKey>>({
    fullName: "",
    email: "",
    phone: "",
    jobTitle: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    website: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    yearsOperating: "",
    activeDrivers: "",
    fleetVehicleCount: "",
    fleetDescription: "",
    suitRequirement: "",
    certificationAck: false,
    noPartnershipDisclaimerAck: false,
    contactConsentAck: false,
  });

  const [files, setFiles] = useState<Record<FileKey, { status: FileStatus; path?: string; name?: string; error?: string }>>({
    businessLicensePath: emptyFile,
    operatingPermitPath: emptyFile,
    einLetterPath: emptyFile,
    insuranceCertPath: emptyFile,
  });

  const set = <K extends keyof typeof values>(key: K, v: (typeof values)[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  const handleFile = async (key: FileKey, file: File) => {
    setFiles((s) => ({ ...s, [key]: { status: "uploading", name: file.name } }));
    const res = await uploadApplicationFile(file, "company-partner", clientToken, key);
    if (res.ok) {
      setFiles((s) => ({ ...s, [key]: { status: "done", path: res.path, name: file.name } }));
    } else {
      setFiles((s) => ({ ...s, [key]: { status: "error", name: file.name, error: res.error } }));
    }
  };

  const validate = (payload: CompanyPartnerApplicationInput): boolean => {
    const errs: Record<string, string> = {};
    if (payload.fullName.trim().length < 2) errs.fullName = "Please enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email.trim())) errs.email = "Please enter a valid email";
    if (payload.phone.trim().length < 7) errs.phone = "Please enter a valid phone number";
    if (!payload.certificationAck) errs.certificationAck = "Required to submit";
    if (!payload.noPartnershipDisclaimerAck) errs.noPartnershipDisclaimerAck = "Required to submit";
    if (!payload.contactConsentAck) errs.contactConsentAck = "Required to submit";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "submitting") return;

    const payload: CompanyPartnerApplicationInput = {
      ...values,
      businessLicensePath: files.businessLicensePath.path,
      operatingPermitPath: files.operatingPermitPath.path,
      einLetterPath: files.einLetterPath.path,
      insuranceCertPath: files.insuranceCertPath.path,
    };

    if (!validate(payload)) return;

    setState("submitting");
    try {
      const res = await submitCompanyPartnerApplication(payload, clientToken, honeypot);
      if (res.ok) {
        setState("success");
        track.leadSubmitSuccess("company_partner_application");
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
        title="Your partnership application has been received."
        message="Thank you for your interest in partnering with LCT Universal. Our team will review your company information and compliance documents and reach out if there's a fit."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="luxe-card space-y-8 rounded-sm p-8 md:p-10">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <ApplicationSection title="Personal Information">
        <TextField id="partner-fullName" label="Full Name" required value={values.fullName} onChange={(v) => set("fullName", v)} autoComplete="name" error={fieldErrors.fullName} />
        <TextField id="partner-email" label="Email" type="email" required value={values.email} onChange={(v) => set("email", v)} autoComplete="email" error={fieldErrors.email} />
        <TextField id="partner-phone" label="Phone" type="tel" required value={values.phone} onChange={(v) => set("phone", v)} autoComplete="tel" error={fieldErrors.phone} />
        <TextField id="partner-jobTitle" label="Job Title" value={values.jobTitle ?? ""} onChange={(v) => set("jobTitle", v)} autoComplete="organization-title" />
      </ApplicationSection>

      <ApplicationSection title="Company Information">
        <TextField id="partner-companyName" label="Company Name" value={values.companyName ?? ""} onChange={(v) => set("companyName", v)} autoComplete="organization" />
        <TextField id="partner-companyEmail" label="Company Email" type="email" value={values.companyEmail ?? ""} onChange={(v) => set("companyEmail", v)} />
        <TextField id="partner-companyPhone" label="Company Phone" type="tel" value={values.companyPhone ?? ""} onChange={(v) => set("companyPhone", v)} />
        <TextField id="partner-website" label="Website" type="url" value={values.website ?? ""} onChange={(v) => set("website", v)} autoComplete="url" placeholder="https://" />
        <TextField id="partner-street" label="Street Address" value={values.streetAddress ?? ""} onChange={(v) => set("streetAddress", v)} autoComplete="address-line1" colSpan={2} />
        <TextField id="partner-city" label="City" value={values.city ?? ""} onChange={(v) => set("city", v)} autoComplete="address-level2" />
        <TextField id="partner-state" label="State" value={values.state ?? ""} onChange={(v) => set("state", v)} autoComplete="address-level1" />
        <TextField id="partner-country" label="Country" value={values.country ?? ""} onChange={(v) => set("country", v)} autoComplete="country-name" />
        <TextField id="partner-postal" label="Postal Code" value={values.postalCode ?? ""} onChange={(v) => set("postalCode", v)} autoComplete="postal-code" />
        <RadioGroupField
          id="partner-yearsOperating"
          label="How long has your company been operating?"
          value={values.yearsOperating ?? ""}
          onChange={(v) => set("yearsOperating", v as CompanyPartnerApplicationInput["yearsOperating"])}
          options={["Less than 1 year", "1-3 years", "3-5 years", "5+ years"]}
          colSpan={2}
        />
        <TextField id="partner-activeDrivers" label="Total Number of Active Drivers" value={values.activeDrivers ?? ""} onChange={(v) => set("activeDrivers", v)} />
        <TextField id="partner-fleetCount" label="Total Number of Vehicles in Fleet" value={values.fleetVehicleCount ?? ""} onChange={(v) => set("fleetVehicleCount", v)} />
        <TextAreaField id="partner-fleetDescription" label="Tell us about your fleet" value={values.fleetDescription ?? ""} onChange={(v) => set("fleetDescription", v)} colSpan={2} rows={3} />
        <RadioGroupField
          id="partner-suitRequirement"
          label="Are drivers required to wear a suit for executive bookings?"
          value={values.suitRequirement ?? ""}
          onChange={(v) => set("suitRequirement", v as CompanyPartnerApplicationInput["suitRequirement"])}
          options={["Yes - Always", "Yes - Upon request", "No"]}
          colSpan={2}
        />
      </ApplicationSection>

      <ApplicationSection title="Required Compliance Documents">
        <FileField id="partner-businessLicense" label="Valid Business License" status={files.businessLicensePath.status} fileName={files.businessLicensePath.name} error={files.businessLicensePath.error} onSelect={(f) => handleFile("businessLicensePath", f)} />
        <FileField id="partner-operatingPermit" label="For-Hire Transportation Operating Permit" status={files.operatingPermitPath.status} fileName={files.operatingPermitPath.name} error={files.operatingPermitPath.error} onSelect={(f) => handleFile("operatingPermitPath", f)} />
        <FileField id="partner-einLetter" label="EIN Confirmation Letter" status={files.einLetterPath.status} fileName={files.einLetterPath.name} error={files.einLetterPath.error} onSelect={(f) => handleFile("einLetterPath", f)} />
        <FileField id="partner-insurance" label="Commercial Auto Liability Insurance Certificate" status={files.insuranceCertPath.status} fileName={files.insuranceCertPath.name} error={files.insuranceCertPath.error} onSelect={(f) => handleFile("insuranceCertPath", f)} />
      </ApplicationSection>

      <ApplicationSection title="Legal" description="Recovered verbatim from LCT Universal's company partner application (audited 2026-08-11).">
        <CheckboxAckField
          id="partner-certification"
          required
          checked={values.certificationAck}
          onChange={(v) => set("certificationAck", v)}
          error={fieldErrors.certificationAck}
        >
          I certify that all information and documents provided are accurate and current. I confirm that
          my company maintains all required licenses, permits, and commercial insurance in compliance with
          applicable laws and regulations.
        </CheckboxAckField>
        <CheckboxAckField
          id="partner-no-partnership"
          required
          checked={values.noPartnershipDisclaimerAck}
          onChange={(v) => set("noPartnershipDisclaimerAck", v)}
          error={fieldErrors.noPartnershipDisclaimerAck}
        >
          I understand that submission of this application does not create any partnership, contract,
          employment relationship, or obligation with LCT Universal. Approval, if granted, is subject to
          separate written agreement and compliance review.
        </CheckboxAckField>
        <CheckboxAckField
          id="partner-contact-consent"
          required
          checked={values.contactConsentAck}
          onChange={(v) => set("contactConsentAck", v)}
          error={fieldErrors.contactConsentAck}
        >
          I consent to be contacted by LCT Universal via phone, email, and SMS regarding my application
          and related partnership matters.
        </CheckboxAckField>
      </ApplicationSection>

      <SubmitBar state={state} error={errorCode} submitLabel="Submit Partnership Application" />
      <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground/70">
        Submitting this form does not guarantee a partnership. Our team reviews every application individually.
      </p>
    </form>
  );
}
