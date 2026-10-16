import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
});

// Records exactly how the client talks to Supabase. This verifies request
// shape only — real persistence is verified against the live project.
const calls: { table?: string; row?: Record<string, unknown>; selected: boolean } = {
  selected: false,
};
let insertError: { code: string; message: string } | null = null;

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      insert: (row: Record<string, unknown>) => {
        calls.table = table;
        calls.row = row;
        const result = Promise.resolve({ data: null, error: insertError });
        return Object.assign(result, {
          select: () => {
            calls.selected = true;
            return { single: () => result };
          },
        });
      },
    }),
  },
}));

// Captures the fire-and-forget notification request (never a real network call).
const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
vi.stubGlobal("fetch", fetchMock);

const { submitFormClient } = await import("./submissions.client");

const valid = {
  formType: "contact" as const,
  clientToken: "12345678-token",
  customerName: "Jane Doe",
  customerEmail: "Jane@Example.com",
  specialRequests: "Airport pickup",
};

describe("submitFormClient", () => {
  beforeEach(() => {
    calls.table = undefined;
    calls.row = undefined;
    calls.selected = false;
    insertError = null;
    localStorage.clear();
    fetchMock.mockClear();
  });

  it("asks the server to email the company inbox after the lead is saved (id only)", async () => {
    const res = await submitFormClient(valid);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/.netlify/functions/lead-notify");
    expect(init).toMatchObject({ method: "POST", keepalive: true });
    expect(JSON.parse(String(init.body))).toEqual({ id: res.id });
  });

  it("does not request a notification when the lead was not saved", async () => {
    insertError = { code: "42501", message: "denied" };
    await submitFormClient(valid);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("inserts without reading the row back (anon has no SELECT policy, so RETURNING fails RLS)", async () => {
    const res = await submitFormClient(valid);
    expect(res.ok).toBe(true);
    expect(calls.table).toBe("form_submissions");
    expect(calls.selected).toBe(false);
  });

  it("returns the client-generated id that was sent with the row", async () => {
    const res = await submitFormClient(valid);
    expect(typeof calls.row?.id).toBe("string");
    expect(res.id).toBe(calls.row?.id);
    expect(calls.row?.customer_email).toBe("jane@example.com");
  });

  it("maps a database failure to an error instead of a success message", async () => {
    insertError = { code: "42501", message: "new row violates row-level security policy" };
    const res = await submitFormClient(valid);
    expect(res).toMatchObject({ ok: false, error: "storage_failed" });
  });

  it("maps the unique submission hash violation to duplicate_submission", async () => {
    insertError = { code: "23505", message: "duplicate key" };
    const res = await submitFormClient(valid);
    expect(res).toMatchObject({ ok: false, error: "duplicate_submission" });
  });

  it("reports which fields failed validation without touching the database", async () => {
    const res = await submitFormClient({ ...valid, passengers: "-1" });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("validation_failed");
    expect(res.fieldErrors?.passengers).toBeTruthy();
    expect(calls.table).toBeUndefined();
  });

  it("blocks a second submission inside the client rate-limit window", async () => {
    expect((await submitFormClient(valid)).ok).toBe(true);
    expect(await submitFormClient({ ...valid, clientToken: "another-token" })).toMatchObject({
      ok: false,
      error: "rate_limited",
    });
  });
});
