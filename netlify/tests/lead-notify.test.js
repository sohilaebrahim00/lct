import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../functions/lead-notify.js";

const ID = "7d0f3e8a-1b2c-4d5e-8f90-123456789abc";
let ipCounter = 0;
const call = (body, { method = "POST", ip } = {}) =>
  handler(
    new Request("https://lctuniversal.com/.netlify/functions/lead-notify", {
      method,
      headers: { "Content-Type": "application/json" },
      body:
        method === "POST" ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    }),
    { ip: ip ?? `10.0.0.${++ipCounter}` },
  );

function supabaseAndResend({ claimRows }) {
  const calls = [];
  const fetchMock = vi.fn(async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method ?? "GET", init });
    if (String(url).startsWith("https://api.resend.com"))
      return new Response(JSON.stringify({ id: "re_1" }), { status: 200 });
    if ((init.method ?? "GET") === "GET")
      return new Response("[]", { status: 200, headers: { "content-range": "0-0/0" } });
    if (init.method === "PATCH" && String(url).includes("or="))
      return new Response(JSON.stringify(claimRows), { status: 200 });
    return new Response(null, { status: 204 });
  });
  return { calls, fetchMock };
}

const ROW = {
  id: ID,
  form_type: "fleet",
  customer_name: "Pat Example",
  customer_email: "pat@example.com",
  created_at: "2026-10-16T16:00:00Z",
  company_email_status: "sending",
  company_email_error: null,
};

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("lead-notify function", () => {
  it("rejects other methods and malformed input", async () => {
    expect((await call(null, { method: "GET" })).status).toBe(405);
    expect((await call("not json")).status).toBe(400);
    expect((await call({ id: "1; drop table" })).status).toBe(400);
  });

  it("accepts but does nothing when not configured (lead stays pending)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await call({ id: ID });
    expect(res.status).toBe(202);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("when configured", () => {
    beforeEach(() => {
      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test");
      vi.stubEnv("RESEND_API_KEY", "re_test");
    });

    it("emails the stored lead once and marks it sent", async () => {
      const { calls, fetchMock } = supabaseAndResend({ claimRows: [ROW] });
      vi.stubGlobal("fetch", fetchMock);
      expect((await call({ id: ID })).status).toBe(202);
      const resend = calls.filter((c) => c.url.startsWith("https://api.resend.com"));
      expect(resend).toHaveLength(1);
      expect(resend[0].init.headers["Idempotency-Key"]).toBe(`<lead-${ID}@lctuniversal.com>`);
      expect(JSON.parse(resend[0].init.body)).toMatchObject({
        to: ["reservations@lctuniversal.com"],
        reply_to: "pat@example.com",
      });
      const finish = calls.find((c) => c.method === "PATCH" && !c.url.includes("or="));
      expect(JSON.parse(finish.init.body)).toEqual({
        company_email_status: "sent",
        company_email_error: null,
      });
    });

    it("gives the same 202 for an id that doesn't exist (no probing), and sends nothing", async () => {
      const { calls, fetchMock } = supabaseAndResend({ claimRows: [] });
      vi.stubGlobal("fetch", fetchMock);
      expect((await call({ id: ID })).status).toBe(202);
      expect(calls.some((c) => c.url.startsWith("https://api.resend.com"))).toBe(false);
    });

    it("rate-limits a single client", async () => {
      const { fetchMock } = supabaseAndResend({ claimRows: [] });
      vi.stubGlobal("fetch", fetchMock);
      const statuses = [];
      for (let i = 0; i < 11; i++)
        statuses.push((await call({ id: ID }, { ip: "203.0.113.9" })).status);
      expect(statuses.slice(0, 10).every((s) => s === 202)).toBe(true);
      expect(statuses[10]).toBe(429);
    });
  });
});
