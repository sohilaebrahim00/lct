import { useMemo, useState } from "react";
import {
  ApplicationSection,
  CheckboxAckField,
  FileField,
  HoneypotField,
  RadioGroupField,
  TextField,
} from "./form-fields";
import { SubmitBar, SuccessPanel, type SubmitState } from "./submit-bar";
import { submitDriverApplication } from "@/lib/applications/submit.client";
import { uploadApplicationFile } from "@/lib/applications/upload";
import type { DriverApplicationInput } from "@/lib/applications/types";
import { track } from "@/lib/tracking";

function randomToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type FileKey = "headshotPath" | "licenseFrontPath" | "licenseBackPath" | "transportationLicensePath";
type FileStatus = "idle" | "uploading" | "done" | "error";

export function DriverApplicationForm() {
  const clientToken = useMemo(() => randomToken(), []);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorCode, setErrorCode] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [values, setValues] = useState<Omit<DriverApplicationInput, keyof Record<FileKey, string>>>({
    fullName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    felonyConviction: "",
    duiPast5Years: "",
    chauffeurExperience: "",
    certificationConsent: false,
    backgroundCheckConsent: false,
    screeningNoticeAck: false,
    dataConsent: false,
    employmentTermsAck: false,
  } as Omit<DriverApplicationInput, keyof Record<FileKey, string>>);

  const [files, setFiles] = useState<Record<FileKey, { status: FileStatus; path?: string; name?: string; error?: string }>>({
    headshotPath: { status: "idle" },
    licenseFrontPath: { status: "idle" },
    licenseBackPath: { status: "idle" },
    transportationLicensePath: { status: "idle" },
  });

  const set = <K extends keyof typeof values>(key: K, v: (typeof values)[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  const handleFile = async (key: FileKey, file: File) => {
    setFiles((s) => ({ ...s, [key]: { status: "uploading", name: file.name } }));
    const res = await uploadApplicationFile(file, "driver", clientToken, key);
    if (res.ok) {
      setFiles((s) => ({ ...s, [key]: { status: "done", path: res.path, name: file.name } }));
    } else {
      setFiles((s) => ({ ...s, [key]: { status: "error", name: file.name, error: res.error } }));
    }
  };

  const validate = (payload: DriverApplicationInput): boolean => {
    const errs: Record<string, string> = {};
    if (payload.fullName.trim().length < 2) errs.fullName = "Please enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email.trim())) errs.email = "Please enter a valid email";
    if (payload.phone.trim().length < 7) errs.phone = "Please enter a valid phone number";
    if (!payload.felonyConviction) errs.felonyConviction = "Required";
    if (!payload.duiPast5Years) errs.duiPast5Years = "Required";
    if (!payload.chauffeurExperience) errs.chauffeurExperience = "Required";
    if (!payload.headshotPath) errs.headshotPath = "Please upload a headshot";
    if (!payload.licenseFrontPath) errs.licenseFrontPath = "Please upload the front of your license";
    if (!payload.licenseBackPath) errs.licenseBackPath = "Please upload the back of your license";
    if (!payload.certificationConsent) errs.certificationConsent = "Required to submit";
    if (!payload.backgroundCheckConsent) errs.backgroundCheckConsent = "Required to submit";
    if (!payload.screeningNoticeAck) errs.screeningNoticeAck = "Required to submit";
    if (!payload.dataConsent) errs.dataConsent = "Required to submit";
    if (!payload.employmentTermsAck) errs.employmentTermsAck = "Required to submit";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "submitting") return;

    const payload: DriverApplicationInput = {
      ...values,
      headshotPath: files.headshotPath.path ?? "",
      licenseFrontPath: files.licenseFrontPath.path ?? "",
      licenseBackPath: files.licenseBackPath.path ?? "",
      transportationLicensePath: files.transportationLicensePath.path,
    };

    if (!validate(payload)) return;

    setState("submitting");
    setFieldErrors({});
    try {
      const res = await submitDriverApplication(payload, clientToken, honeypot);
      if (res.ok) {
        setState("success");
        track.leadSubmitSuccess("driver_application"); // form-type label only — no PII in the event
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
        title="Your application has been received."
        message="Thank you for applying to drive with LCT Universal. Our team will review your application and background documents and contact you if there's a fit."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="luxe-card space-y-8 rounded-sm p-8 md:p-10">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <ApplicationSection title="Personal Information">
        <TextField id="driver-fullName" label="Full Name" required value={values.fullName} onChange={(v) => set("fullName", v)} autoComplete="name" error={fieldErrors.fullName} />
        <TextField id="driver-email" label="Email" type="email" required value={values.email} onChange={(v) => set("email", v)} autoComplete="email" error={fieldErrors.email} />
        <TextField id="driver-phone" label="Phone" type="tel" required value={values.phone} onChange={(v) => set("phone", v)} autoComplete="tel" error={fieldErrors.phone} />
      </ApplicationSection>

      <ApplicationSection title="Address" description="Optional, but helps us route your application to the right dispatch region.">
        <TextField id="driver-street" label="Street Address" value={values.streetAddress ?? ""} onChange={(v) => set("streetAddress", v)} autoComplete="address-line1" colSpan={2} />
        <TextField id="driver-city" label="City" value={values.city ?? ""} onChange={(v) => set("city", v)} autoComplete="address-level2" />
        <TextField id="driver-state" label="State" value={values.state ?? ""} onChange={(v) => set("state", v)} autoComplete="address-level1" />
        <TextField id="driver-country" label="Country" value={values.country ?? ""} onChange={(v) => set("country", v)} autoComplete="country-name" />
        <TextField id="driver-postal" label="Postal Code" value={values.postalCode ?? ""} onChange={(v) => set("postalCode", v)} autoComplete="postal-code" />
      </ApplicationSection>

      <ApplicationSection title="Background & Experience">
        <RadioGroupField
          id="driver-felony"
          label="Have you ever been convicted of a felony?"
          required
          value={values.felonyConviction}
          onChange={(v) => set("felonyConviction", v as DriverApplicationInput["felonyConviction"])}
          options={["Yes", "No"]}
          colSpan={2}
          error={fieldErrors.felonyConviction}
        />
        <RadioGroupField
          id="driver-dui"
          label="Have you had a DUI in the past 5 years?"
          required
          value={values.duiPast5Years}
          onChange={(v) => set("duiPast5Years", v as DriverApplicationInput["duiPast5Years"])}
          options={["Yes", "No"]}
          colSpan={2}
          error={fieldErrors.duiPast5Years}
        />
        <RadioGroupField
          id="driver-experience"
          label="Professional Chauffeur Experience"
          required
          value={values.chauffeurExperience}
          onChange={(v) => set("chauffeurExperience", v as DriverApplicationInput["chauffeurExperience"])}
          options={["Less than 1 year", "1-3 years", "3-5 years", "5+ years"]}
          colSpan={2}
          error={fieldErrors.chauffeurExperience}
        />
      </ApplicationSection>

      <ApplicationSection title="Document Upload" description="A professional headshot (white background) and both sides of your driver's license are required.">
        <FileField
          id="driver-headshot"
          label="Professional Headshot"
          required
          status={files.headshotPath.status}
          fileName={files.headshotPath.name}
          error={files.headshotPath.error}
          onSelect={(f) => handleFile("headshotPath", f)}
          accept=".jpg,.jpeg,.png,.gif"
        />
        <FileField
          id="driver-license-front"
          label="Driver's License — Front"
          required
          status={files.licenseFrontPath.status}
          fileName={files.licenseFrontPath.name}
          error={files.licenseFrontPath.error}
          onSelect={(f) => handleFile("licenseFrontPath", f)}
        />
        <FileField
          id="driver-license-back"
          label="Driver's License — Back"
          required
          status={files.licenseBackPath.status}
          fileName={files.licenseBackPath.name}
          error={files.licenseBackPath.error}
          onSelect={(f) => handleFile("licenseBackPath", f)}
        />
        <FileField
          id="driver-transport-license"
          label="Transportation for Hire Driver License (if applicable)"
          status={files.transportationLicensePath.status}
          fileName={files.transportationLicensePath.name}
          error={files.transportationLicensePath.error}
          onSelect={(f) => handleFile("transportationLicensePath", f)}
        />
      </ApplicationSection>

      <ApplicationSection title="Certification & Consent" description="Recovered verbatim from LCT Universal's driver application (audited 2026-08-11) — each acknowledgment below is required.">
        <CheckboxAckField
          id="driver-certification"
          required
          checked={values.certificationConsent}
          onChange={(v) => set("certificationConsent", v)}
          error={fieldErrors.certificationConsent}
        >
          I certify that all information provided in this application, including personal details,
          employment history, licenses, and uploaded documents, is true, complete, and accurate to the
          best of my knowledge. I acknowledge that providing false, misleading, or incomplete information
          may result in disqualification or termination.
        </CheckboxAckField>
        <CheckboxAckField
          id="driver-background-check"
          required
          checked={values.backgroundCheckConsent}
          onChange={(v) => set("backgroundCheckConsent", v)}
          error={fieldErrors.backgroundCheckConsent}
        >
          I authorize LCT Universal to verify my identity, review my Motor Vehicle Record (MVR), conduct
          criminal background checks, and verify my licenses, certifications, insurance documents, and any
          other information necessary to evaluate my eligibility for a driving position. I understand that
          background checks will be conducted in accordance with applicable federal and state laws,
          including the Fair Credit Reporting Act (FCRA), where applicable. I understand that my
          information may be shared with authorized third-party screening providers as required to
          complete background checks in accordance with applicable laws.
        </CheckboxAckField>
        <CheckboxAckField
          id="driver-screening-notice"
          required
          checked={values.screeningNoticeAck}
          onChange={(v) => set("screeningNoticeAck", v)}
          error={fieldErrors.screeningNoticeAck}
        >
          After preliminary approval, applicants may be required to provide their Social Security Number
          and complete a drug and alcohol screening as part of the official verification process.
        </CheckboxAckField>
        <CheckboxAckField
          id="driver-data-consent"
          required
          checked={values.dataConsent}
          onChange={(v) => set("dataConsent", v)}
          error={fieldErrors.dataConsent}
        >
          I consent to LCT Universal collecting, storing, and securely processing my personal information
          solely for recruitment, compliance, and background verification purposes.
        </CheckboxAckField>
        <CheckboxAckField
          id="driver-employment-terms"
          required
          checked={values.employmentTermsAck}
          onChange={(v) => set("employmentTermsAck", v)}
          error={fieldErrors.employmentTermsAck}
        >
          I further understand that submitting this application does not guarantee employment and that
          LCT Universal reserves the right to accept or reject any applicant at its sole discretion. My
          working relationship with LCT Universal, if selected, will be structured in accordance with
          company policy and applicable state regulations, and nothing in this application guarantees
          employment or creates a contractual relationship unless formally agreed upon in writing. By
          checking these boxes and submitting this form, I am providing my electronic signature and
          agreeing to these terms.
        </CheckboxAckField>
      </ApplicationSection>

      <SubmitBar state={state} error={errorCode} submitLabel="Submit Application" />
      <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground/70">
        Submitting this form does not guarantee employment. Our team reviews every application individually.
      </p>
    </form>
  );
}
