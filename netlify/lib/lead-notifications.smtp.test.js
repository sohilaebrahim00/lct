// Integration: real SMTP delivery (local smtp-server + nodemailer) against an
// in-memory stand-in for Supabase's REST API. The stand-in applies the same
// filters the real API was verified to parse (see PR notes), so this covers
// claim → send → status update end to end without touching production.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SMTPServer } from "smtp-server";
import { createMailer, createStore, loadConfig, processLead, sweep } from "./lead-notifications.js";

const USER = "reservations@lctuniversal.com";
let server;
let port;
const inbox = [];

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: false,
    allowInsecureAuth: true,
    disabledCommands: ["STARTTLS"],
    logger: false,
    onAuth(auth, _session, cb) {
      if (auth.username === USER && auth.password === "correct-pass") cb(null, { user: USER });
      else cb(Object.assign(new Error("Invalid credentials"), { responseCode: 535 }));
    },
    onData(stream, session, cb) {
      let raw = "";
      stream.on("data", (c) => (raw += c));
      stream.on("end", () => {
        inbox.push({
          raw,
          from: session.envelope.mailFrom.address,
          to: session.envelope.rcptTo.map((r) => r.address),
        });
        cb();
      });
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  port = server.server.address().port;
});
afterAll(() => new Promise((resolve) => server.close(resolve)));

/** Minimal PostgREST emulation for the four calls the notifier makes. */
function fakeSupabase(rows) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const u = new URL(url);
    const q = Object.fromEntries(u.searchParams);
    calls.push(init.method);
    const since = q.created_at?.replace(/^gte\./, "");
    const eligible = (r) => {
      if (since && new Date(r.created_at) < new Date(since)) return false;
      const or = q.or ?? "";
      const retryBefore = or.match(/retry,updated_at\.lt\.([^)]+)\)/)?.[1];
      const staleBefore = or.match(/sending,updated_at\.lt\.([^)]+)\)/)?.[1];
      return (
        r.company_email_status === "pending" ||
        (r.company_email_status === "retry" && new Date(r.updated_at) < new Date(retryBefore)) ||
        (r.company_email_status === "sending" && new Date(r.updated_at) < new Date(staleBefore))
      );
    };
    if (init.method === "PATCH" && q.or) {
      const id = q.id.replace(/^eq\./, "");
      const hit = rows.filter((r) => r.id === id && eligible(r));
      for (const r of hit)
        Object.assign(r, JSON.parse(init.body), { updated_at: new Date().toISOString() });
      return new Response(JSON.stringify(hit.map((r) => ({ ...r }))), { status: 200 });
    }
    if (init.method === "PATCH") {
      const id = q.id.replace(/^eq\./, "");
      for (const r of rows.filter((x) => x.id === id && x.company_email_status === "sending")) {
        Object.assign(r, JSON.parse(init.body), { updated_at: new Date().toISOString() });
      }
      return new Response(null, { status: 204 });
    }
    if (init.method === "GET" && q.company_email_status === "eq.sent") {
      const n = rows.filter((r) => r.company_email_status === "sent").length;
      return new Response("[]", { status: 200, headers: { "content-range": `0-0/${n}` } });
    }
    if (init.method === "GET") {
      const ids = rows.filter(eligible).map((r) => ({ id: r.id }));
      return new Response(JSON.stringify(ids.slice(0, Number(q.limit))), { status: 200 });
    }
    return new Response("unexpected", { status: 500 });
  };
  return { fetchImpl, calls };
}

const lead = (id, over = {}) => ({
  id,
  form_type: "contact",
  customer_name: "QA Integration",
  customer_email: "customer@example.com",
  phone: "+1 214 555 0100",
  special_requests: "Pickup at DFW Terminal D",
  source_page: "/contact",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  company_email_status: "pending",
  company_email_error: null,
  ...over,
});

const config = (pass) =>
  loadConfig({
    SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test",
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: String(port),
    SMTP_USER: USER,
    SMTP_PASS: pass,
  });

describe("lead notification over real SMTP", () => {
  it("delivers one email per lead to the company inbox and marks it sent", async () => {
    const rows = [lead("11111111-1111-4111-8111-111111111111")];
    const { fetchImpl, calls } = fakeSupabase(rows);
    const cfg = config("correct-pass");
    const deps = { cfg, store: createStore(cfg, fetchImpl), mailer: createMailer(cfg) };
    const before = inbox.length;

    expect(await processLead(rows[0].id, deps)).toMatchObject({ status: "sent" });
    expect(await processLead(rows[0].id, deps)).toMatchObject({ status: "skipped" });
    deps.mailer.close();

    expect(inbox.length - before).toBe(1);
    const mail = inbox.at(-1);
    expect(mail.to).toEqual(["reservations@lctuniversal.com"]);
    expect(mail.from).toBe(USER);
    expect(mail.raw).toMatch(
      /^Message-ID: <lead-11111111-1111-4111-8111-111111111111@lctuniversal\.com>/im,
    );
    expect(mail.raw).toMatch(/^Reply-To: customer@example\.com/im);
    expect(mail.raw).toContain("Pickup at DFW Terminal D");
    expect(mail.raw).toContain("customer@example.com");
    expect(rows[0].company_email_status).toBe("sent");
    expect(calls).not.toContain("DELETE");
  });

  it("keeps the lead and schedules a retry when the mail server rejects the login", async () => {
    const rows = [lead("22222222-2222-4222-8222-222222222222")];
    const { fetchImpl } = fakeSupabase(rows);
    const cfg = config("wrong-pass");
    const before = inbox.length;
    const deps = { cfg, store: createStore(cfg, fetchImpl), mailer: createMailer(cfg) };
    expect(await processLead(rows[0].id, deps)).toMatchObject({ status: "retry", attempt: 1 });
    deps.mailer.close();
    expect(inbox.length).toBe(before);
    expect(rows[0]).toMatchObject({
      company_email_status: "retry",
      customer_email: "customer@example.com",
    });
    expect(rows[0].company_email_error).toMatch(/^attempt 1 \| .* \| (EAUTH )?.*535/);
  });

  it("sweep sends missed leads but never backfills leads older than the cutoff", async () => {
    const rows = [
      lead("33333333-3333-4333-8333-333333333333"),
      lead("44444444-4444-4444-8444-444444444444", { created_at: "2026-09-01T00:00:00Z" }),
    ];
    const { fetchImpl } = fakeSupabase(rows);
    const cfg = config("correct-pass");
    const mailer = createMailer(cfg);
    const summary = await sweep({ cfg, store: createStore(cfg, fetchImpl), mailer });
    mailer.close();
    expect(summary.results.map((r) => r.id)).toEqual(["33333333-3333-4333-8333-333333333333"]);
    expect(rows[0].company_email_status).toBe("sent");
    expect(rows[1].company_email_status).toBe("pending"); // old lead untouched
  });
});
