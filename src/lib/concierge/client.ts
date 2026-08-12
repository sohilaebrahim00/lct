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
 * Calls the `ai-concierge` Netlify Function (`netlify/functions/ai-concierge.js`)
 * at `/.netlify/functions/ai-concierge` — same-origin, so no CORS or base-URL
 * configuration is needed. The Gemini API key lives only in that function's
 * server-side environment (Netlify dashboard secret), never here. Failure is
 * handled gracefully — the panel shows the same premium fallback message
 * rather than a broken spinner or a raw error, whether the function isn't
 * deployed yet, the network request fails, or Gemini itself errors.
 */
export async function sendConciergeMessage(
  message: string,
  history: ConciergeMessage[],
  pagePath: string,
): Promise<ConciergeResult> {
  try {
    const res = await fetch("/.netlify/functions/ai-concierge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history.slice(-8), pagePath }),
    });
    if (!res.ok) return FALLBACK;
    const data = await res.json();
    if (!data) return FALLBACK;
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
