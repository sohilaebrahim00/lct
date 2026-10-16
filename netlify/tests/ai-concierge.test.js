import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDiscoveryCache } from "../lib/gemini.js";

let handler;
beforeEach(async () => {
  resetDiscoveryCache();
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.resetModules();
  handler = (await import("../functions/ai-concierge.js")).default;
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const ask = (ip = "198.51.100.1") =>
  handler(
    new Request("https://lctuniversal.com/.netlify/functions/ai-concierge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Do you serve DFW airport?", history: [] }),
    }),
    { ip },
  );

describe("ai-concierge function", () => {
  it("answers again after the default model is retired (404 → next model)", async () => {
    const answer = {
      message: "Yes — DFW and Love Field.",
      intent: "airport",
      actions: [{ label: "Book", href: "/book" }],
      escalate: false,
    };
    const fetchMock = vi.fn(async (url) =>
      String(url).includes("gemini-3.6-flash:generateContent")
        ? new Response("{}", { status: 404 })
        : new Response(
            JSON.stringify({
              candidates: [{ content: { parts: [{ text: JSON.stringify(answer) }] } }],
            }),
            { status: 200 },
          ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = await ask();
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Concierge-Status")).toBe("ok");
    expect(res.headers.get("X-Concierge-Model")).toBe("gemini-flash-latest");
    expect(await res.json()).toEqual(answer);
    // The key travels only in the request to Google, never in the response.
    expect(JSON.stringify([...res.headers])).not.toContain("test-key");
  });

  it("degrades to the fallback message and names the failure class", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response('{"error":{"message":"API key not valid"}}', { status: 400 })),
    );
    const res = await ask("198.51.100.2");
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Concierge-Status")).toBe("auth_error");
    expect((await res.json()).message).toMatch(/temporarily unavailable/);
  });

  it("rides through an overloaded model and reports Google's status when nothing works", async () => {
    const answer = { message: "Hello", intent: "general", actions: [], escalate: false };
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        ++calls === 1
          ? new Response("{}", { status: 503 })
          : new Response(
              JSON.stringify({
                candidates: [{ content: { parts: [{ text: JSON.stringify(answer) }] } }],
              }),
              {
                status: 200,
              },
            ),
      ),
    );
    const res = await ask("198.51.100.4");
    expect(res.headers.get("X-Concierge-Status")).toBe("ok");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) =>
        String(url).includes("/models?")
          ? new Response(JSON.stringify({ models: [] }), { status: 200 })
          : new Response("{}", { status: 503 }),
      ),
    );
    const failed = await ask("198.51.100.5");
    expect(failed.headers.get("X-Concierge-Status")).toBe("provider_error");
    expect(failed.headers.get("X-Concierge-Upstream")).toBe("503");
  });

  it("flags non-JSON model output instead of silently masking it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ candidates: [{ content: { parts: [{ text: "not json" }] } }] }),
            { status: 200 },
          ),
      ),
    );
    const res = await ask("198.51.100.3");
    expect(res.headers.get("X-Concierge-Status")).toBe("bad_response");
  });
});
