/**
 * Gemini model selection + error classification for the AI Concierge.
 *
 * 2026-10-16: the Concierge had been answering every message with its
 * "temporarily unavailable" fallback because both configured models,
 * gemini-2.0-flash and gemini-2.0-flash-lite, were shut down by Google on
 * 2026-06-01 (https://ai.google.dev/gemini-api/docs/deprecations — the
 * listed replacements are gemini-3.6-flash / gemini-3.1-flash-lite), so
 * every call returned 404. To stop the next retirement from silently
 * breaking it again, a 404 now walks: configured model → the
 * `gemini-flash-latest` alias → a current Flash model discovered from the
 * ListModels API (cached).
 */

export const DEFAULT_MODEL = "gemini-3.6-flash";
export const DEFAULT_FALLBACK_MODEL = "gemini-flash-latest";
const API = "https://generativelanguage.googleapis.com/v1beta";

export class ConciergeError extends Error {
  /** `upstream` is Google's HTTP status code (0 = network error), if any. */
  constructor(reason, detail, upstream) {
    super(`${reason}: ${detail}`);
    this.reason = reason;
    this.upstream = upstream;
  }
}

/** Coarse, non-sensitive failure class — safe to expose in a response header. */
export function classify(status, bodyText = "") {
  if (status === 404) return "model_unavailable";
  if (status === 429) return "quota_exceeded";
  if (status === 401 || status === 403) return "auth_error";
  if (status === 400 && /api key/i.test(bodyText)) return "auth_error";
  if (status >= 500) return "provider_error";
  return "provider_rejected";
}

/** Highest-version stable "gemini-X.Y-flash" model that supports generateContent. */
export function pickFlashModel(models = []) {
  const usable = models
    .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => String(m.name || "").replace(/^models\//, ""));
  const version = (n) => Number.parseFloat(n.match(/^gemini-(\d+(?:\.\d+)?)/)?.[1] ?? "0");
  const stable = usable.filter((n) => /^gemini-\d+(\.\d+)?-flash$/.test(n));
  const pool = stable.length
    ? stable
    : usable.filter(
        (n) => /flash/.test(n) && !/preview|exp|tts|image|live|audio|lite|thinking|embed/.test(n),
      );
  return pool.sort((a, b) => version(b) - version(a))[0] ?? null;
}

let discovered = { model: null, at: 0 };
export const resetDiscoveryCache = () => {
  discovered = { model: null, at: 0 };
};

export async function discoverModel(apiKey, fetchImpl = fetch) {
  if (discovered.model && Date.now() - discovered.at < 10 * 60_000) return discovered.model;
  const res = await fetchImpl(`${API}/models?pageSize=1000&key=${apiKey}`);
  if (!res.ok) return null;
  const model = pickFlashModel((await res.json()).models);
  discovered = { model, at: Date.now() };
  return model;
}

/** Concatenated answer text, ignoring any "thought" parts newer models may return. */
export function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p) => typeof p.text === "string" && !p.thought)
    .map((p) => p.text)
    .join("")
    .trim();
}

/**
 * Calls generateContent, walking the model chain on 404 only (other failures
 * wouldn't be fixed by another model). Returns { text, model } or throws a
 * ConciergeError with a classified `reason`. Never logs the key or URL.
 */
// 404 = model retired/unknown; 5xx = Google-side failure (e.g. 503 "model
// overloaded", seen on 2 of 3 live requests right after the 2026-10-16
// deploy). Both can succeed on a different model, so the chain moves on.
// 400/401/403/429 stop immediately — another model won't fix a bad key,
// quota, or request.
const tryNextModel = (status) => status === 404 || status >= 500;

export async function generate(
  apiKey,
  buildBody,
  { models, fetchImpl = fetch, timeoutMs = 6000, budgetMs = 8500 } = {},
) {
  if (!apiKey) throw new ConciergeError("missing_key", "GEMINI_API_KEY not configured");
  const started = Date.now();
  const tried = new Set();
  const queue = [...models];
  let discoveredTried = false;
  let last = null;

  while (queue.length || !discoveredTried) {
    if (!queue.length) {
      discoveredTried = true;
      const found = await discoverModel(apiKey, fetchImpl).catch(() => null);
      if (!found || tried.has(found)) break;
      queue.push(found);
    }
    const model = queue.shift();
    if (!model || tried.has(model)) continue;
    // Each call gets what's left of the budget, so the function always answers
    // before Netlify's 10 s limit instead of timing out with a 502.
    const remaining = budgetMs - (Date.now() - started);
    if (remaining < 1500) break;
    tried.add(model);

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), Math.min(timeoutMs, remaining));
    let res;
    try {
      res = await fetchImpl(`${API}/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
        signal: ctl.signal,
      });
    } catch (err) {
      if (err?.name === "AbortError") {
        throw new ConciergeError("timeout", `${model} timed out`, last?.status);
      }
      // Network-level failure: another model/connection may work.
      last = { status: 0, model, body: String(err?.message ?? err).slice(0, 200) };
      console.error("[ai-concierge] Gemini network error:", last);
      continue;
    } finally {
      clearTimeout(timer);
    }

    if (res.ok) {
      const text = extractText(await res.json());
      if (!text) throw new ConciergeError("empty_response", `${model} returned no text`);
      return { text, model };
    }
    const body = await res.text().catch(() => "");
    last = { status: res.status, model, body: body.slice(0, 300) };
    console.error("[ai-concierge] Gemini error:", last);
    if (!tryNextModel(res.status)) {
      throw new ConciergeError(classify(res.status, body), `${model} ${res.status}`, res.status);
    }
  }
  if (!last) throw new ConciergeError("timeout", "time budget exhausted");
  const reason = last.status === 404 ? "model_unavailable" : "provider_error";
  throw new ConciergeError(
    reason,
    `no model succeeded (last: ${last.model} ${last.status})`,
    last.status,
  );
}
