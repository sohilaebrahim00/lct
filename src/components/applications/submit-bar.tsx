import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { CONTACT } from "@/lib/site-data";

export type SubmitState = "idle" | "submitting" | "success" | "error";

export function SuccessPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="luxe-card space-y-5 rounded-sm p-8 md:p-10">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-onyx">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <div className="eyebrow text-[0.65rem]">Application received</div>
          <h3 className="mt-2 font-display text-2xl leading-tight">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

function errorMessageFor(code: string | undefined): string {
  switch (code) {
    case "duplicate_submission":
      return "It looks like this application was already submitted. If you don't hear back soon, please call us directly.";
    case "rate_limited":
      return "Please wait a moment before submitting again.";
    case "validation_failed":
      return "Please check the highlighted fields and try again.";
    default:
      return `We could not save your application right now. Please try again shortly or call ${CONTACT.phoneDisplay}.`;
  }
}

export function SubmitBar({ state, error, submitLabel }: { state: SubmitState; error?: string; submitLabel: string }) {
  return (
    <>
      {state === "error" ? (
        <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{errorMessageFor(error)}</div>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={state === "submitting"}
        aria-busy={state === "submitting"}
        className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-gold-gradient px-6 py-4 text-sm font-semibold uppercase tracking-widest text-onyx transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
          </>
        ) : (
          <>{submitLabel}</>
        )}
      </button>
    </>
  );
}
