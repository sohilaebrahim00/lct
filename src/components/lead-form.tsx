import { useState, useMemo, useEffect, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { submitFormClient } from "@/lib/forms/submissions.client";
import { FORM_TYPE_LABELS, type FormType, type SubmissionInput } from "@/lib/forms/types";
import { CONTACT } from "@/lib/site-data";
import { track } from "@/lib/tracking";

export interface FieldSpec {
  name: keyof Omit<
    SubmissionInput,
    "formType" | "clientToken" | "website" | "captchaToken" | "meetAndGreet" | "corporateBooking"
  >;
  label: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "date"
    | "time"
    | "datetime-local"
    | "number"
    | "textarea"
    | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  colSpan?: 1 | 2;
  rows?: number;
  /** Optional step/group key. Only meaningful when the caller also passes `activeGroup`. */
  group?: string;
}

export interface LeadFormProps {
  formType: FormType;
  fields: FieldSpec[];
  toggles?: Array<{ name: "meetAndGreet" | "corporateBooking"; label: string }>;
  submitLabel?: string;
  title?: ReactNode;
  description?: ReactNode;
  compact?: boolean;
  /** card = legacy luxe-card chrome; bare = thin-border page-integrated layout */
  variant?: "card" | "bare";
  initialValues?: Record<string, string>;
  /**
   * When provided, only fields whose `group` matches this value are visible —
   * the rest stay mounted (so their values persist) but are hidden from view
   * and interaction. Omit entirely for the normal single-page form (every
   * existing caller does this today; behavior is unchanged for them).
   */
  activeGroup?: string;
  /** Hide the submit button/disclaimer and disable submission — used for wizard steps before the last one. */
  hideSubmit?: boolean;
}

const successMessage =
  "Thank you for contacting LCT Universal Executive Transports. Your request has been securely received and saved. A member of our reservation team will review it and contact you shortly.";

function errorMessageFor(code: string | undefined): string {
  switch (code) {
    case "duplicate_submission":
      return "It looks like this request was already submitted. If you don't hear back soon, please call us directly.";
    case "rate_limited":
      return "Please wait a moment before submitting again.";
    case "validation_failed":
      return "Please check the highlighted fields and try again.";
    default:
      return `We could not save your request right now. Please try again shortly or call ${CONTACT.phoneDisplay}.`;
  }
}

function randomToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function LeadForm({
  formType,
  fields,
  toggles = [],
  submitLabel = "Send Request",
  title,
  description,
  compact,
  variant = "card",
  initialValues,
  activeGroup,
  hideSubmit,
}: LeadFormProps) {
  const clientToken = useMemo(() => randomToken(), []);
  const [values, setValues] = useState<Record<string, string>>(initialValues ?? {});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [emailWarn, setEmailWarn] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialValues) return;
    setValues((s) => {
      let changed = false;
      const next = { ...s };
      for (const [k, v] of Object.entries(initialValues)) {
        if (next[k] !== v) {
          next[k] = v;
          changed = true;
        }
      }
      return changed ? next : s;
    });
  }, [initialValues]);

  const setValue = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.name] ?? "").trim();
      if (f.required && !v) errs[f.name] = "Required";
    }
    if (!values.customerName?.trim() || values.customerName.trim().length < 2)
      errs.customerName = "Please enter your full name";
    const email = values.customerEmail?.trim() ?? "";
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      errs.customerEmail = "Please enter a valid email";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hideSubmit) return;
    if (state === "submitting") return;
    if (!validate()) return;
    setState("submitting");
    setMessage("");
    setEmailWarn(false);

    try {
      const payload: SubmissionInput = {
        formType,
        clientToken,
        website, // honeypot
        customerName: values.customerName ?? "",
        customerEmail: values.customerEmail ?? "",
        phone: values.phone,
        companyName: values.companyName,
        pickupAddress: values.pickupAddress,
        dropoffAddress: values.dropoffAddress,
        additionalStops: values.additionalStops,
        tripType: values.tripType,
        pickupDateTime: values.pickupDateTime,
        returnDateTime: values.returnDateTime,
        passengers: values.passengers,
        luggage: values.luggage,
        vehiclePreference: values.vehiclePreference,
        flightNumber: values.flightNumber,
        airline: values.airline,
        meetAndGreet: !!flags.meetAndGreet,
        corporateBooking: !!flags.corporateBooking,
        specialRequests: values.specialRequests,
        sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
      };
      const res = await submitFormClient(payload);
      if (res.ok) {
        setState("success");
        setMessage(successMessage);
        track.leadSubmitSuccess(formType);
        // Truthfully signal partial email delivery
        if (res.status === "email_failed" || res.status === "partially_delivered") {
          setEmailWarn(true);
        }
      } else {
        setState("error");
        setMessage(errorMessageFor(res.error));
      }
    } catch {
      setState("error");
      setMessage(errorMessageFor(undefined));
    }
  };

  const shell =
    variant === "bare"
      ? "space-y-6 border border-champagne/20 bg-transparent p-0 md:p-0"
      : compact
        ? "luxe-card space-y-5 rounded-sm p-6"
        : "luxe-card space-y-5 rounded-sm p-8 md:p-10";

  if (state === "success") {
    return (
      <div className={variant === "bare" ? "border border-champagne/25 p-6 md:p-8" : shell}>
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-onyx">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="eyebrow text-[0.65rem]">
              Request received · {FORM_TYPE_LABELS[formType]}
            </div>
            <h3 className="mt-2 font-display text-2xl leading-tight">
              Your request has been received.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>
            {emailWarn ? (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-gold/30 bg-gold/5 p-3 text-xs text-foreground/80">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div>
                  Confirmation email delivery is pending sender-domain verification. Your request is
                  safely stored and our team will still contact you.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={shell}>
      {title ? <div className="font-display text-2xl text-foreground">{title}</div> : null}
      {description ? <p className="-mt-2 text-sm text-muted-foreground">{description}</p> : null}

      {/* Honeypot: kept off-screen with tab index -1 */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => {
          const hiddenByGroup = activeGroup !== undefined && f.group !== undefined && f.group !== activeGroup;
          return (
            <FieldRow
              key={f.name}
              formType={formType}
              spec={f}
              value={values[f.name] ?? ""}
              onChange={(v) => setValue(f.name, v)}
              error={fieldErrors[f.name]}
              hidden={hiddenByGroup}
            />
          );
        })}
      </div>

      {toggles.length ? (
        <div className="flex flex-wrap gap-4 pt-1">
          {toggles.map((t) => (
            <label
              key={t.name}
              className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85"
            >
              <input
                type="checkbox"
                checked={!!flags[t.name]}
                onChange={(e) => setFlags((s) => ({ ...s, [t.name]: e.target.checked }))}
                className="h-4 w-4 accent-[color:var(--color-gold,#c9a961)]"
              />
              {t.label}
            </label>
          ))}
        </div>
      ) : null}

      {state === "error" ? (
        <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{message}</div>
        </div>
      ) : null}

      {hideSubmit ? null : (
        <>
          <button
            type="submit"
            disabled={state === "submitting"}
            aria-busy={state === "submitting"}
            className="group flex w-full items-center justify-center gap-2 rounded-md bg-gold-gradient px-6 py-4 text-sm font-semibold uppercase tracking-widest text-onyx transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {state === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>{submitLabel}</>
            )}
          </button>
          <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground/70">
            This confirms receipt of your request only. Your reservation is not confirmed until our
            team contacts you.
          </p>
        </>
      )}
    </form>
  );
}

function FieldRow({
  formType,
  spec,
  value,
  onChange,
  error,
  hidden,
}: {
  formType: FormType;
  spec: FieldSpec;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hidden?: boolean;
}) {
  const cs = spec.colSpan === 2 ? "md:col-span-2" : "";
  const inputBase =
    "w-full rounded-md border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-gold";
  const fieldId = `${formType}-${spec.name}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className={`${cs}${hidden ? " hidden" : ""}`} aria-hidden={hidden || undefined}>
      <label htmlFor={fieldId} className="eyebrow mb-2 block text-[0.6rem]">
        {spec.label}
        {spec.required ? <span className="text-gold"> *</span> : null}
      </label>
      {spec.type === "textarea" ? (
        <textarea
          id={fieldId}
          name={spec.name}
          aria-invalid={!!error}
          aria-describedby={errorId}
          rows={spec.rows ?? 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={spec.placeholder}
          tabIndex={hidden ? -1 : undefined}
          className={inputBase + " resize-none"}
        />
      ) : spec.type === "select" ? (
        <select
          id={fieldId}
          name={spec.name}
          aria-invalid={!!error}
          aria-describedby={errorId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={hidden ? -1 : undefined}
          className={inputBase}
        >
          <option value="">Select…</option>
          {(spec.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name={spec.name}
          aria-invalid={!!error}
          aria-describedby={errorId}
          type={spec.type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={spec.placeholder}
          autoComplete={autoCompleteFor(spec.name)}
          tabIndex={hidden ? -1 : undefined}
          className={inputBase}
        />
      )}
      {error ? (
        <div id={errorId} className="mt-1 text-xs text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function autoCompleteFor(name: string): string | undefined {
  switch (name) {
    case "customerName":
      return "name";
    case "customerEmail":
      return "email";
    case "phone":
      return "tel";
    case "companyName":
      return "organization";
    default:
      return "off";
  }
}
