import { describe, expect, it, vi } from "vitest";
import { FORM_TYPE_LABELS as SITE_LABELS } from "../../src/lib/forms/types";
import {
  FORM_TYPE_LABELS,
  attemptsFrom,
  buildLeadEmail,
  createMailer,
  createStore,
  loadConfig,
  missingConfig,
  processLead,
  sweep,
} from "./lead-notifications.js";

const cfg = loadConfig({
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test",
  SMTP_USER: "reservations@lctuniversal.com",
  SMTP_PASS: "x",
});

const row = (over = {}) => ({
  id: "7d0f3e8a-1b2c-4d5e-8f90-123456789abc",
  form_type: "airport",
  customer_name: "Jane <b>Doe</b>",
  customer_email: "jane@example.com",
  phone: "+1 (214) 555-0100",
  company_name: null,
  pickup_address: "DFW Terminal D",
  dropoff_address: "Grapevine, TX",
  pickup_datetime: "2026-12-01T16:30:00.000Z",
  passengers: 3,
  luggage: 2,
  flight_number: "AA 123",
  airline: "American",
  meet_and_greet: true,
  special_requests: "Child seat please\nThanks",
  source_page: "/airport",
  created_at: "2026-10-16T15:32:20.000Z",
  company_email_status: "sending",
  company_email_error: null,
  ...over,
});

describe("config", () => {
  it("labels stay in sync with the site's form labels", () => {
    expect(FORM_TYPE_LABELS).toEqual(SITE_LABELS);
  });

  it("reports what is missing without exposing values", () => {
    expect(missingConfig(loadConfig({}))).toEqual([
      "SUPABASE_SERVICE_ROLE_KEY",
      "SMTP_USER+SMTP_PASS (or RESEND_API_KEY)",
    ]);
    expect(missingConfig(cfg)).toEqual([]);
    expect(cfg.notifyTo).toBe("reservations@lctuniversal.com");
    expect(cfg.smtp).toMatchObject({ host: "mail.privateemail.com", port: 465 });
  });

  it("parses the attempt counter kept in company_email_error", () => {
    expect(attemptsFrom(null)).toBe(0);
    expect(attemptsFrom("attempt 3 | 2026-10-16T00:00:00Z | 535 auth")).toBe(3);
  });
});

describe("buildLeadEmail", () => {
  const msg = buildLeadEmail(row(), cfg);

  it("addresses the company inbox and lets staff reply to the customer", () => {
    expect(msg.to).toBe("reservations@lctuniversal.com");
    expect(msg.from).toBe("LCT Universal Website <reservations@lctuniversal.com>");
    expect(msg.replyTo).toBe("jane@example.com");
    expect(msg.messageId).toBe("<lead-7d0f3e8a-1b2c-4d5e-8f90-123456789abc@lctuniversal.com>");
  });

  it("includes form type, contact info, trip details and timestamps", () => {
    expect(msg.subject).toBe("New Airport Transfer Request — Jane <b>Doe</b>");
    for (const s of [
      "Airport Transfer Request",
      "jane@example.com",
      "+1 (214) 555-0100",
      "DFW Terminal D",
      "AA 123",
      "Meet & greet: Yes",
      "Child seat please",
    ]) {
      expect(msg.text).toContain(s);
    }
    expect(msg.text).toMatch(/Received: Oct 16, 2026, 10:32 AM CDT \(2026-10-16T15:32:20Z\)/);
    expect(msg.text).toMatch(/Pickup date\/time: Dec 1, 2026, 10:30 AM CST/);
    expect(msg.text).toContain("Lead ID: 7d0f3e8a-1b2c-4d5e-8f90-123456789abc");
  });

  it("escapes customer input in HTML and strips newlines from headers", () => {
    expect(msg.html).toContain("Jane &lt;b&gt;Doe&lt;/b&gt;");
    expect(msg.html).not.toContain("<b>Doe</b>");
    const evil = buildLeadEmail(row({ customer_name: "A\r\nBcc: victim@example.com" }), cfg);
    expect(evil.subject).not.toMatch(/[\r\n]/);
  });

  it("omits empty fields", () => {
    expect(msg.text).not.toContain("Company:");
    expect(
      buildLeadEmail(row({ form_type: "contact", meet_and_greet: false }), cfg).text,
    ).not.toContain("Meet & greet");
  });
});

function fakeStore(initial = row({ company_email_status: "pending" })) {
  const state = { row: { ...initial }, finishes: [] };
  return {
    state,
    claim: vi.fn(async () => {
      if (!["pending", "retry"].includes(state.row.company_email_status)) return null;
      state.row.company_email_status = "sending";
      return { ...state.row };
    }),
    finish: vi.fn(async (id, status, error) => {
      state.finishes.push([status, error]);
      state.row.company_email_status = status;
      state.row.company_email_error = error;
    }),
    due: vi.fn(async () => [state.row.id]),
    sentInLastHour: vi.fn(async () => 0),
  };
}

describe("processLead", () => {
  it("sends once and marks the lead sent", async () => {
    const store = fakeStore();
    const mailer = { send: vi.fn(async () => ({ transport: "smtp" })) };
    expect(await processLead(store.state.row.id, { cfg, store, mailer })).toMatchObject({
      status: "sent",
      attempt: 1,
    });
    expect(store.state.row.company_email_status).toBe("sent");
    // A second trigger (instant + sweep) can't send it again.
    expect(await processLead(store.state.row.id, { cfg, store, mailer })).toMatchObject({
      status: "skipped",
    });
    expect(mailer.send).toHaveBeenCalledTimes(1);
  });

  it("records failures for retry, then gives up without touching the lead", async () => {
    const store = fakeStore();
    const mailer = {
      send: vi.fn(async () =>
        Promise.reject(Object.assign(new Error("auth failed"), { responseCode: 535 })),
      ),
    };
    const statuses = [];
    for (let i = 0; i < cfg.maxAttempts + 2; i++)
      statuses.push((await processLead(store.state.row.id, { cfg, store, mailer })).status);
    expect(statuses.slice(0, cfg.maxAttempts - 1).every((s) => s === "retry")).toBe(true);
    expect(statuses[cfg.maxAttempts - 1]).toBe("failed");
    expect(statuses.slice(cfg.maxAttempts)).toEqual(["skipped", "skipped"]);
    expect(store.state.row.company_email_error).toMatch(
      new RegExp(`^attempt ${cfg.maxAttempts} \\| .* \\| 535 auth failed$`),
    );
    expect(store.state.row.customer_email).toBe("jane@example.com"); // lead data intact
  });

  it("reports (but keeps) a lead whose email went out when the status write fails", async () => {
    const store = fakeStore();
    store.finish.mockRejectedValueOnce(new Error("network"));
    const mailer = { send: vi.fn(async () => ({ transport: "smtp" })) };
    expect(await processLead(store.state.row.id, { cfg, store, mailer })).toMatchObject({
      status: "sent",
      warning: "status_not_saved",
    });
  });
});

describe("sweep", () => {
  it("does nothing when the hourly cap is reached (leads stay pending)", async () => {
    const store = fakeStore();
    store.sentInLastHour.mockResolvedValue(cfg.maxPerHour);
    const mailer = { send: vi.fn() };
    expect(await sweep({ cfg, store, mailer })).toMatchObject({ processed: 0, capped: true });
    expect(store.due).not.toHaveBeenCalled();
    expect(store.state.row.company_email_status).toBe("pending");
  });

  it("limits the batch to the remaining hourly allowance", async () => {
    const store = fakeStore();
    store.sentInLastHour.mockResolvedValue(cfg.maxPerHour - 2);
    await sweep({ cfg, store, mailer: { send: vi.fn(async () => ({ transport: "smtp" })) } });
    expect(store.due).toHaveBeenCalledWith(2);
  });
});

describe("createStore (Supabase REST)", () => {
  const recorder = (responses) => {
    const calls = [];
    const fetchImpl = vi.fn(async (url, init) => {
      calls.push({ url: decodeURIComponent(url), init });
      return responses.shift() ?? new Response("[]", { status: 200 });
    });
    return { calls, fetchImpl };
  };

  it("claims atomically with a conditional UPDATE and never deletes", async () => {
    const { calls, fetchImpl } = recorder([new Response(JSON.stringify([row()]), { status: 200 })]);
    const store = createStore(cfg, fetchImpl);
    expect(await store.claim(row().id)).toMatchObject({ id: row().id });
    const { url, init } = calls[0];
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ company_email_status: "sending" });
    expect(url).toContain(`id=eq.${row().id}`);
    expect(url).toContain("created_at=gte.2026-10-16T13:00:00Z");
    expect(url).toMatch(
      /or=\(company_email_status\.eq\.pending,and\(company_email_status\.eq\.retry,updated_at\.lt\.[^)]+\),and\(company_email_status\.eq\.sending,updated_at\.lt\.[^)]+\)\)/,
    );
    expect(init.headers).toMatchObject({
      apikey: "sb_secret_test",
      Prefer: "return=representation",
    });
    expect(init.headers.Authorization).toBeUndefined(); // new-format secret keys are not JWTs
    await store.finish(row().id, "sent", null);
    expect(calls.map((c) => c.init.method)).not.toContain("DELETE");
  });

  it("sends legacy service_role JWTs as a Bearer token too", async () => {
    const { calls, fetchImpl } = recorder([new Response("[]")]);
    await createStore(
      loadConfig({ SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOi.test" }),
      fetchImpl,
    ).claim(row().id);
    expect(calls[0].init.headers.Authorization).toBe("Bearer eyJhbGciOi.test");
  });

  it("reads the hourly sent count from Content-Range", async () => {
    const { fetchImpl } = recorder([new Response("[]", { headers: { "content-range": "0-0/7" } })]);
    expect(await createStore(cfg, fetchImpl).sentInLastHour()).toBe(7);
  });

  it("surfaces HTTP errors instead of treating them as 'nothing to do'", async () => {
    const { fetchImpl } = recorder([new Response('{"message":"invalid key"}', { status: 401 })]);
    await expect(createStore(cfg, fetchImpl).claim(row().id)).rejects.toThrow(/401/);
  });
});

describe("createMailer", () => {
  const msg = buildLeadEmail(row(), cfg);

  it("falls back to Resend (with an idempotency key) when SMTP fails", async () => {
    const both = loadConfig({
      SUPABASE_SERVICE_ROLE_KEY: "k",
      SMTP_USER: "u@x.com",
      SMTP_PASS: "p",
      RESEND_API_KEY: "re_test",
    });
    const createTransport = () => ({
      sendMail: vi.fn(async () => Promise.reject(new Error("ETIMEDOUT"))),
      close() {},
    });
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ id: "re_1" }), { status: 200 }),
    );
    const out = await createMailer(both, { createTransport, fetchImpl }).send(msg);
    expect(out).toEqual({ transport: "resend", id: "re_1" });
    expect(fetchImpl.mock.calls[0][1].headers["Idempotency-Key"]).toBe(msg.messageId);
  });

  it("propagates the SMTP error when no fallback is configured", async () => {
    const createTransport = () => ({
      sendMail: vi.fn(async () => Promise.reject(new Error("ECONNREFUSED"))),
      close() {},
    });
    await expect(createMailer(cfg, { createTransport }).send(msg)).rejects.toThrow("ECONNREFUSED");
  });
});
