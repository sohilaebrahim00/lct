import { supabase } from "@/integrations/supabase/client";

export type ConciergeAction = { label: string; href: string };

export type ConciergeMessage = { role: "user" | "assistant"; content: string };

export type ConciergeResult = {
  message: string;
  intent: string;
  actions: ConciergeAction[];
  escalate: boolean;
};

const FALLBACK: ConciergeResult = {
  message: "Concierge is temporarily unavailable. You can still book online instantly, or reach our dispatch team directly.",
  intent: "escalate",
  actions: [
    { label: "Book Now", href: "/book" },
    { label: "Call Dispatch", href: "/contact" },
  ],
  escalate: true,
};

/**
 * Calls the `ai-concierge` Edge Function. That function is written and
 * ready but NOT deployed (no Supabase CLI auth in this environment — see
 * PROJECT_SPEC.md), so this call will fail until it is. Failure is handled
 * gracefully — the panel shows the same premium fallback message rather
 * than a broken spinner or a raw error, matching the pattern already
 * established for the Join Our Team Supabase forms before their migration
 * was applied.
 */
export async function sendConciergeMessage(
  message: string,
  history: ConciergeMessage[],
  pagePath: string,
): Promise<ConciergeResult> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-concierge", {
      body: { message, history: history.slice(-8), pagePath },
    });
    if (error || !data) return FALLBACK;
    return {
      message: typeof data.message === "string" ? data.message : FALLBACK.message,
      intent: typeof data.intent === "string" ? data.intent : "general",
      actions: Array.isArray(data.actions) ? data.actions : [],
      escalate: Boolean(data.escalate),
    };
  } catch {
    return FALLBACK;
  }
}
