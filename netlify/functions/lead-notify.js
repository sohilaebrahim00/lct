/**
 * Netlify Function — instant email notification for a just-saved website lead.
 *
 * Called fire-and-forget by the browser right after a lead form's insert into
 * Supabase succeeds (src/lib/forms/submissions.client.ts), with only the new
 * row's id. Everything in the email is read back from Supabase server-side
 * (the stored row is the source of truth), so a caller can't inject content
 * or choose a recipient. If this call never happens (tab closed, offline),
 * the scheduled `lead-notify-sweep` sends it within ~5 minutes.
 *
 * Responds 202 for any well-formed id whether or not it exists or was sent,
 * so the endpoint can't be used to probe for leads. Required Netlify env vars
 * (server-side only, never in the frontend): SUPABASE_SERVICE_ROLE_KEY and
 * SMTP_USER + SMTP_PASS (or RESEND_API_KEY) — see netlify/lib/lead-notifications.js.
 */
import {
  createMailer,
  createStore,
  errorSummary,
  loadConfig,
  log,
  missingConfig,
  processLead,
  remainingThisHour,
} from "../lib/lead-notifications.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const JSON_HEADERS = { "Content-Type": "application/json" };
const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

// Per-instance limiter (resets on cold start) — the durable protections are
// the DB-backed hourly cap and the one-send-per-lead claim.
const hits = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
  if (isRateLimited(ip)) return json({ accepted: false }, 429);

  let id;
  try {
    ({ id } = await req.json());
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (typeof id !== "string" || !UUID_RE.test(id)) return json({ error: "Invalid id" }, 400);

  const cfg = loadConfig();
  const missing = missingConfig(cfg);
  if (missing.length) {
    // Lead stays `pending` in Supabase and is sent once configuration exists.
    log("error", "not_configured", { missing });
    return json({ accepted: true }, 202);
  }

  const store = createStore(cfg);
  const mailer = createMailer(cfg);
  try {
    if ((await remainingThisHour({ cfg, store })) === 0) {
      log("warn", "hourly_cap_reached", { id, maxPerHour: cfg.maxPerHour });
    } else {
      await processLead(id, { cfg, store, mailer });
    }
  } catch (err) {
    log("error", "notify_failed", { id, error: errorSummary(err) });
  } finally {
    mailer.close();
  }
  return json({ accepted: true }, 202);
};
