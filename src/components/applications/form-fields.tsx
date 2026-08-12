import type { ReactNode } from "react";
import { Loader2, UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Shared premium field primitives for the three Join Our Team application
 * forms (Driver / Company Partner / Referral Partner). Deliberately separate
 * from `LeadForm` — that component is tightly typed to the booking-lead
 * `SubmissionInput` shape (per explicit instruction, applications must not
 * be mixed with customer booking requests) and has no file-upload support,
 * which two of these three forms require. Same visual language (labels,
 * spacing, focus states, 16px+ inputs to avoid iOS auto-zoom) as LeadForm,
 * built as small composable pieces instead of one generic field-spec engine
 * since the three forms' data shapes genuinely differ.
 */

const inputBase =
  "w-full rounded-md border border-border bg-background/60 px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-gold md:text-sm";

export function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="eyebrow mb-2 block text-[0.6rem]">
      {children}
      {required ? <span className="text-gold"> *</span> : null}
    </label>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <div id={id} className="mt-1 text-xs text-red-300">
      {error}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  autoComplete,
  colSpan,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "tel" | "url";
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  colSpan?: 1 | 2;
  error?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={colSpan === 2 ? "md:col-span-2" : undefined}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={inputBase}
      />
      <FieldError id={errorId ?? ""} error={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  required,
  placeholder,
  rows = 4,
  colSpan,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  colSpan?: 1 | 2;
  error?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={colSpan === 2 ? "md:col-span-2" : undefined}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={inputBase + " resize-none"}
      />
      <FieldError id={errorId ?? ""} error={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required,
  colSpan,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  colSpan?: 1 | 2;
  error?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={colSpan === 2 ? "md:col-span-2" : undefined}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={inputBase}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FieldError id={errorId ?? ""} error={error} />
    </div>
  );
}

export function RadioGroupField({
  id,
  label,
  value,
  onChange,
  options,
  required,
  colSpan,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  colSpan?: 1 | 2;
  error?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <fieldset className={colSpan === 2 ? "md:col-span-2" : undefined} aria-describedby={errorId}>
      <legend className="eyebrow mb-2 block text-[0.6rem]">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </legend>
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <label
            key={o}
            className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border px-4 text-sm transition ${
              value === o ? "border-gold bg-gold/10 text-foreground" : "border-border bg-background/60 text-foreground/80"
            }`}
          >
            <input
              type="radio"
              name={id}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="h-4 w-4 accent-[color:var(--color-gold,#c9a961)]"
            />
            {o}
          </label>
        ))}
      </div>
      <FieldError id={errorId ?? ""} error={error} />
    </fieldset>
  );
}

export function CheckboxAckField({
  id,
  checked,
  onChange,
  required,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="md:col-span-2">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/85">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          aria-describedby={errorId}
          aria-required={required}
          className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-gold,#c9a961)]"
        />
        <span>{children}</span>
      </label>
      <FieldError id={errorId ?? ""} error={error} />
    </div>
  );
}

export function FileField({
  id,
  label,
  required,
  status,
  fileName,
  onSelect,
  error,
  colSpan,
  accept = ".pdf,.doc,.docx,.xls,.csv,.jpg,.jpeg,.png,.gif",
}: {
  id: string;
  label: string;
  required?: boolean;
  status: "idle" | "uploading" | "done" | "error";
  fileName?: string;
  onSelect: (file: File) => void;
  error?: string;
  colSpan?: 1 | 2;
  accept?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={colSpan === 2 ? "md:col-span-2" : undefined}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <label
        htmlFor={id}
        className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-md border border-dashed px-4 py-3 text-sm transition ${
          status === "error" ? "border-red-400/60 text-red-200" : "border-border bg-background/60 text-foreground/80 hover:border-gold"
        }`}
      >
        {status === "uploading" ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gold" />
        ) : status === "done" ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
        ) : status === "error" ? (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        ) : (
          <UploadCloud className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">
          {fileName ?? (status === "uploading" ? "Uploading…" : "Choose file (PDF, DOC, JPG, PNG)")}
        </span>
        <input
          id={id}
          name={id}
          type="file"
          accept={accept}
          className="sr-only"
          aria-invalid={!!error}
          aria-describedby={errorId}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
            e.target.value = "";
          }}
        />
      </label>
      <FieldError id={errorId ?? ""} error={error} />
    </div>
  );
}

export function ApplicationSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="border-t border-border/60 pt-8 first:border-t-0 first:pt-0">
      <h3 className="font-display text-xl text-foreground">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

export function HoneypotField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
