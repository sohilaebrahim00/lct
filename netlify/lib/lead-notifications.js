/**
 * Website lead → email notification core (server-side only).
 *
 * Supabase `public.form_submissions` stays the source of truth: the browser
 * still inserts every lead there directly (unchanged). This module only reads
 * a stored row with the server-side key and emails it to the company inbox,
 * tracking delivery in the row's existing `company_email_status` /
 * `company_email_error` columns — so no schema change, and a failed email can
 * never touch or lose the lead itself (no DELETE anywhere; the only writes are
 * those two status columns).
 *
 * Status lifecycle (company_email_status):
 *   pending  → new row, not attempted yet (the column's default)
 *   sending  → claimed by one sender (atomic UPDATE … WHERE status = …)
 *   sent     → accepted by the mail server (terminal)
 *   retry    → attempt failed; retried by the scheduled sweep after a delay
 *   failed   → gave up after MAX attempts; still stored, visible in Supabase
 * A `sending` row older than the stale window (sender crashed mid-send) is
 * reclaimed by the sweep. Attempt count + last error are kept in
 * `company_email_error` as "attempt N | ISO time | message".
 *
 * Duplicate prevention: the atomic claim means two senders (the instant
 * trigger and the sweep) can never both send the same lead; `sent` is
 * terminal; and every message carries a deterministic Message-ID
 * (<lead-ID@lctuniversal.com>) so a rare resend after an ambiguous failure
 * threads/collapses with the original in mail clients.
 */
import nodemailer from "nodemailer";

export const DEFAULT_SUPABASE_URL = "https://gqjzrkossjayendtjxxp.supabase.co";
export const DEFAULT_NOTIFY_TO = "reservations@lctuniversal.com";
// Leads stored before this moment are never emailed (no backlog blast). The
// default covers the 2026-10-16 production fix that made the forms save
// (live 15:47 UTC) plus the approved QA row from 13:32 UTC. Override with
// LEAD_NOTIFY_SINCE.
export const DEFAULT_NOTIFY_SINCE = "2026-10-16T13:00:00Z";

// Keep in sync with FORM_TYPE_LABELS in src/lib/forms/types.ts (a test checks).
export const FORM_TYPE_LABELS = {
  contact: "Contact Request",
  quote: "Quote Request",
  booking: "Booking Request",
  corporate: "Corporate Account Request",
  airport: "Airport Transfer Request",
  event: "Event Transportation Request",
  fleet: "Fleet Inquiry",
  service_inquiry: "Service Inquiry",
};

const ATTEMPT_RE = /^attempt (\d+)\b/;

export function loadConfig(env = process.env) {
  const int = (v, d) => (Number.isFinite(Number.parseInt(v, 10)) ? Number.parseInt(v, 10) : d);
  const smtp =
    env.SMTP_USER && env.SMTP_PASS
      ? {
          host: env.SMTP_HOST || "mail.privateemail.com",
          port: int(env.SMTP_PORT, 465),
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : null;
  return {
    supabaseUrl: (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, ""),
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "",
    notifyTo: env.LEAD_NOTIFY_TO || DEFAULT_NOTIFY_TO,
    notifyFrom: env.LEAD_NOTIFY_FROM || env.SMTP_USER || DEFAULT_NOTIFY_TO,
    notifySince: env.LEAD_NOTIFY_SINCE || DEFAULT_NOTIFY_SINCE,
    maxPerHour: int(env.LEAD_NOTIFY_MAX_PER_HOUR, 60),
    maxAttempts: int(env.LEAD_NOTIFY_MAX_ATTEMPTS, 6),
    retryAfterMs: int(env.LEAD_NOTIFY_RETRY_MINUTES, 10) * 60_000,
    staleAfterMs: int(env.LEAD_NOTIFY_STALE_MINUTES, 10) * 60_000,
    batchSize: int(env.LEAD_NOTIFY_BATCH, 10),
    smtp,
    resendKey: env.RESEND_API_KEY || "",
    dashboardUrl: `https://supabase.com/dashboard/project/${(env.SUPABASE_URL || DEFAULT_SUPABASE_URL).match(/\/\/([a-z0-9]+)\./)?.[1] ?? "gqjzrkossjayendtjxxp"}/editor`,
  };
}

/** What's missing for notifications to run (empty = ready). Never includes values. */
export function missingConfig(cfg) {
  const missing = [];
  if (!cfg.serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!cfg.smtp && !cfg.resendKey) missing.push("SMTP_USER+SMTP_PASS (or RESEND_API_KEY)");
  return missing;
}

export function attemptsFrom(errorText) {
  const m = typeof errorText === "string" ? errorText.match(ATTEMPT_RE) : null;
  return m ? Number(m[1]) : 0;
}

/* ---------------------------------------------------------------- Supabase */

function serviceHeaders(key) {
  // New-format secret keys (sb_secret_…) are opaque, not JWTs: apikey only.
  // Legacy service_role keys are JWTs and also go in Authorization.
  const h = { apikey: key, "Content-Type": "application/json" };
  if (!key.startsWith("sb_")) h.Authorization = `Bearer ${key}`;
  return h;
}

export function createStore(cfg, fetchImpl = fetch) {
  const base = `${cfg.supabaseUrl}/rest/v1/form_submissions`;
  const headers = serviceHeaders(cfg.serviceKey);
  const iso = (msAgo) => new Date(Date.now() - msAgo).toISOString();
  // Rows eligible for an attempt right now.
  const eligible = () =>
    `(company_email_status.eq.pending,` +
    `and(company_email_status.eq.retry,updated_at.lt.${iso(cfg.retryAfterMs)}),` +
    `and(company_email_status.eq.sending,updated_at.lt.${iso(cfg.staleAfterMs)}))`;

  async function call(method, query, body, extraHeaders = {}) {
    const res = await fetchImpl(`${base}?${query}`, {
      method,
      headers: { ...headers, ...extraHeaders },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`supabase ${method} ${res.status}: ${text.slice(0, 200)}`);
    }
    return res;
  }

  return {
    /** Atomically moves one eligible row to `sending`; returns it, or null. */
    async claim(id) {
      const q = new URLSearchParams({
        id: `eq.${id}`,
        created_at: `gte.${cfg.notifySince}`,
        or: eligible(),
        select: "*",
      });
      const res = await call(
        "PATCH",
        q.toString(),
        { company_email_status: "sending" },
        { Prefer: "return=representation" },
      );
      const rows = await res.json();
      return rows[0] ?? null;
    },
    async due(limit) {
      const q = new URLSearchParams({
        select: "id",
        created_at: `gte.${cfg.notifySince}`,
        or: eligible(),
        order: "created_at.asc",
        limit: String(limit),
      });
      const res = await call("GET", q.toString());
      return (await res.json()).map((r) => r.id);
    },
    async finish(id, status, errorText) {
      const q = new URLSearchParams({ id: `eq.${id}`, company_email_status: "eq.sending" });
      await call(
        "PATCH",
        q.toString(),
        { company_email_status: status, company_email_error: errorText },
        { Prefer: "return=minimal" },
      );
    },
    async sentInLastHour() {
      const q = new URLSearchParams({
        select: "id",
        company_email_status: "eq.sent",
        updated_at: `gte.${iso(3_600_000)}`,
      });
      const res = await call("GET", q.toString(), undefined, {
        Prefer: "count=exact",
        Range: "0-0",
      });
      const total = (res.headers.get("content-range") || "").split("/")[1];
      return Number.parseInt(total, 10) || 0;
    },
  };
}

/* ------------------------------------------------------------------- Email */

const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const oneLine = (v) =>
  String(v ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim();

export function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  // DFW local time (the business's timezone) plus exact UTC.
  const local = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
  return `${local} (${d.toISOString().replace(".000Z", "Z")})`;
}

export function buildLeadEmail(row, cfg) {
  const label = FORM_TYPE_LABELS[row.form_type] || row.form_type;
  const name = oneLine(row.customer_name);
  const yesNo = (b) => (b ? "Yes" : "No");
  const sections = [
    [
      "Customer",
      [
        ["Name", row.customer_name],
        ["Email", row.customer_email],
        ["Phone", row.phone],
        ["Company", row.company_name],
      ],
    ],
    [
      "Trip details",
      [
        ["Trip type", row.trip_type],
        ["Pickup", row.pickup_address],
        ["Drop-off", row.dropoff_address],
        ["Additional stops", row.additional_stops],
        ["Pickup date/time", formatTime(row.pickup_datetime)],
        ["Return date/time", formatTime(row.return_datetime)],
        ["Passengers", row.passengers],
        ["Luggage", row.luggage],
        ["Vehicle preference", row.vehicle_preference],
        ["Flight", row.flight_number],
        ["Airline", row.airline],
        ["Meet & greet", row.form_type === "airport" ? yesNo(row.meet_and_greet) : null],
        ["Corporate booking", row.corporate_booking ? "Yes" : null],
      ],
    ],
    ["Message / special requests", [["", row.special_requests]]],
  ]
    .map(([title, fields]) => [
      title,
      fields.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== ""),
    ])
    .filter(([, fields]) => fields.length);

  const received = formatTime(row.created_at);
  const page = row.source_page ? `https://lctuniversal.com${row.source_page}` : "";

  const lines = [`New website lead — ${label}`, `Received: ${received}`];
  for (const [title, fields] of sections) {
    lines.push("", title.toUpperCase(), ...fields.map(([k, v]) => (k ? `${k}: ${v}` : String(v))));
  }
  lines.push("");
  if (page) lines.push(`Submitted from: ${page}`);
  lines.push(
    `Lead ID: ${row.id}`,
    `Stored in Supabase (form_submissions): ${cfg.dashboardUrl}`,
    "",
    "Reply to this email to respond to the customer directly.",
  );
  const text = lines.join("\n");

  const rowHtml = ([k, v]) => {
    const val =
      k === "Email"
        ? `<a href="mailto:${esc(v)}">${esc(v)}</a>`
        : k === "Phone"
          ? `<a href="tel:${esc(String(v).replace(/[^\d+]/g, ""))}">${esc(v)}</a>`
          : esc(v).replace(/\n/g, "<br>");
    return k
      ? `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:4px 0">${val}</td></tr>`
      : `<tr><td colspan="2" style="padding:4px 0">${val}</td></tr>`;
  };
  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.45">
<h2 style="margin:0 0 4px">New website lead — ${esc(label)}</h2>
<p style="margin:0 0 16px;color:#555">Received: ${esc(received)}</p>
${sections
  .map(
    ([title, fields]) =>
      `<h3 style="margin:16px 0 4px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#8a6d1f">${esc(title)}</h3><table style="border-collapse:collapse;font-size:14px">${fields.map(rowHtml).join("")}</table>`,
  )
  .join("\n")}
<p style="margin:20px 0 0;font-size:12px;color:#666">${page ? `Submitted from: ${esc(page)}<br>` : ""}Lead ID: ${esc(row.id)}<br>Stored in Supabase (form_submissions): <a href="${esc(cfg.dashboardUrl)}">open table editor</a><br>Reply to this email to respond to the customer directly.</p>
</body></html>`;

  return {
    to: cfg.notifyTo,
    from: `LCT Universal Website <${cfg.notifyFrom}>`,
    replyTo: oneLine(row.customer_email) || undefined,
    subject: oneLine(`New ${label} — ${name || row.customer_email}`).slice(0, 180),
    text,
    html,
    messageId: `<lead-${row.id}@lctuniversal.com>`,
    headers: { "X-LCT-Lead-Id": row.id, "Auto-Submitted": "auto-generated" },
  };
}

/* --------------------------------------------------------------- Transport */

export function createMailer(
  cfg,
  { createTransport = nodemailer.createTransport, fetchImpl = fetch } = {},
) {
  let smtp = null;
  const viaSmtp = async (msg) => {
    smtp ??= createTransport({
      host: cfg.smtp.host,
      port: cfg.smtp.port,
      secure: cfg.smtp.port === 465,
      auth: { user: cfg.smtp.user, pass: cfg.smtp.pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
    const info = await smtp.sendMail(msg);
    return { transport: "smtp", id: info.messageId };
  };
  const viaResend = async (msg) => {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.resendKey}`,
        "Content-Type": "application/json",
        // Provider-side de-duplication for 24h on top of the DB claim.
        "Idempotency-Key": msg.messageId,
      },
      body: JSON.stringify({
        from: msg.from,
        to: [msg.to],
        reply_to: msg.replyTo,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        headers: { ...msg.headers, "Message-ID": msg.messageId },
      }),
    });
    if (!res.ok)
      throw new Error(`resend ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
    return { transport: "resend", id: (await res.json()).id };
  };
  return {
    async send(msg) {
      if (cfg.smtp) {
        try {
          return await viaSmtp(msg);
        } catch (err) {
          if (!cfg.resendKey) throw err;
          log("warn", "smtp_failed_trying_resend", { error: errorSummary(err) });
        }
      }
      return viaResend(msg);
    },
    close() {
      smtp?.close?.();
    },
  };
}

/* ------------------------------------------------------------ Orchestration */

export function errorSummary(err) {
  const code = err?.responseCode || err?.code || "";
  return oneLine(`${code ? code + " " : ""}${err?.message ?? err}`).slice(0, 300);
}

export function log(level, event, fields = {}) {
  const line = JSON.stringify({ source: "lead-notify", level, event, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/**
 * Sends the notification for one lead if it is eligible. Never throws for
 * delivery problems; the lead row is only ever updated in its two
 * notification-status columns.
 */
export async function processLead(id, { cfg, store, mailer }) {
  const claimed = await store.claim(id);
  if (!claimed) return { id, status: "skipped" };

  const attempt = attemptsFrom(claimed.company_email_error) + 1;
  try {
    const msg = buildLeadEmail(claimed, cfg);
    const result = await mailer.send(msg);
    try {
      await store.finish(id, "sent", null);
    } catch (err) {
      // Email went out but the status write failed: the stale-claim window
      // may resend it later (same Message-ID). Loud log, lead untouched.
      log("error", "sent_but_status_not_saved", { id, attempt, error: errorSummary(err) });
      return { id, status: "sent", warning: "status_not_saved" };
    }
    log("info", "sent", { id, attempt, transport: result.transport });
    return { id, status: "sent", attempt };
  } catch (err) {
    const final = attempt >= cfg.maxAttempts;
    const status = final ? "failed" : "retry";
    const error = `attempt ${attempt} | ${new Date().toISOString()} | ${errorSummary(err)}`;
    await store
      .finish(id, status, error)
      .catch((e) => log("error", "status_write_failed", { id, attempt, error: errorSummary(e) }));
    log("error", final ? "gave_up" : "will_retry", { id, attempt, error: errorSummary(err) });
    return { id, status, attempt };
  }
}

/** Global hourly cap so a spam burst can't flood the inbox (deferred leads stay pending). */
export async function remainingThisHour({ cfg, store }) {
  return Math.max(0, cfg.maxPerHour - (await store.sentInLastHour()));
}

export async function sweep({ cfg, store, mailer, budgetMs = 22_000 }) {
  const started = Date.now();
  const remaining = await remainingThisHour({ cfg, store });
  if (remaining === 0) {
    log("warn", "hourly_cap_reached", { maxPerHour: cfg.maxPerHour });
    return { processed: 0, capped: true, results: [] };
  }
  const ids = await store.due(Math.min(cfg.batchSize, remaining));
  const results = [];
  for (const id of ids) {
    if (Date.now() - started > budgetMs) break; // stay inside the function time limit
    results.push(await processLead(id, { cfg, store, mailer }));
  }
  return { processed: results.length, capped: false, results };
}
