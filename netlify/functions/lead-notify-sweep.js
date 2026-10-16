/**
 * Netlify Scheduled Function — the safety net for lead email notifications.
 *
 * Every 5 minutes: sends any lead the instant trigger missed (`pending`),
 * retries failed attempts (`retry`, after LEAD_NOTIFY_RETRY_MINUTES), and
 * reclaims sends that crashed mid-way (`sending` older than the stale window).
 * Gives up after LEAD_NOTIFY_MAX_ATTEMPTS (status `failed`) — the lead itself
 * is never modified or removed, only its notification status columns.
 *
 * Scheduled functions run only on the published production deploy, never on
 * deploy previews, and can't be invoked by URL in production.
 */
import {
  createMailer,
  createStore,
  errorSummary,
  loadConfig,
  log,
  missingConfig,
  sweep,
} from "../lib/lead-notifications.js";

export default async () => {
  const cfg = loadConfig();
  const missing = missingConfig(cfg);
  if (missing.length) {
    log("error", "not_configured", { missing });
    return;
  }
  const mailer = createMailer(cfg);
  try {
    const summary = await sweep({ cfg, store: createStore(cfg), mailer });
    if (summary.processed || summary.capped) {
      log("info", "sweep_done", {
        processed: summary.processed,
        capped: summary.capped,
        statuses: summary.results.map((r) => r.status),
      });
    }
  } catch (err) {
    log("error", "sweep_failed", { error: errorSummary(err) });
  } finally {
    mailer.close();
  }
};

export const config = { schedule: "*/5 * * * *" };
