import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ConciergeError,
  classify,
  extractText,
  generate,
  pickFlashModel,
  resetDiscoveryCache,
} from "./gemini.js";

const ok = (text, extraParts = []) =>
  new Response(
    JSON.stringify({ candidates: [{ content: { parts: [...extraParts, { text }] } }] }),
    { status: 200 },
  );
const err = (status, body = "{}") => new Response(body, { status });
const LIST = {
  models: [
    { name: "models/gemini-2.5-flash", supportedGenerationMethods: ["generateContent"] },
    {
      name: "models/gemini-3.8-flash",
      supportedGenerationMethods: ["generateContent", "countTokens"],
    },
    { name: "models/gemini-3.6-flash", supportedGenerationMethods: ["generateContent"] },
    { name: "models/gemini-3.5-flash-lite", supportedGenerationMethods: ["generateContent"] },
    { name: "models/gemini-3-flash-preview", supportedGenerationMethods: ["generateContent"] },
    { name: "models/gemini-3.8-flash-tts", supportedGenerationMethods: ["generateContent"] },
    { name: "models/text-embedding-005", supportedGenerationMethods: ["embedContent"] },
  ],
};

beforeEach(() => {
  resetDiscoveryCache();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("model selection", () => {
  it("picks the newest stable Flash model that can generate content", () => {
    expect(pickFlashModel(LIST.models)).toBe("gemini-3.8-flash");
    expect(pickFlashModel([])).toBeNull();
  });

  it("classifies provider failures into coarse, non-sensitive reasons", () => {
    expect(classify(404)).toBe("model_unavailable");
    expect(classify(429)).toBe("quota_exceeded");
    expect(classify(403)).toBe("auth_error");
    expect(classify(400, '{"message":"API key not valid"}')).toBe("auth_error");
    expect(classify(503)).toBe("provider_error");
  });

  it("ignores reasoning ('thought') parts in the answer", () => {
    expect(
      extractText({
        candidates: [
          { content: { parts: [{ text: "thinking…", thought: true }, { text: "{}" }] } },
        ],
      }),
    ).toBe("{}");
  });
});

describe("generate", () => {
  const body = () => ({ contents: [] });

  it("fails fast without a key", async () => {
    await expect(generate("", body, { models: ["m"] })).rejects.toMatchObject({
      reason: "missing_key",
    });
  });

  it("recovers from the June 2026 retirement: configured model 404 → fallback alias", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(err(404))
      .mockResolvedValueOnce(ok('{"message":"hi"}'));
    const out = await generate("k", body, {
      models: ["gemini-2.0-flash", "gemini-flash-latest"],
      fetchImpl,
    });
    expect(out).toEqual({ text: '{"message":"hi"}', model: "gemini-flash-latest" });
    expect(fetchImpl.mock.calls[0][0]).toContain("/models/gemini-2.0-flash:generateContent");
  });

  it("discovers a current model when every configured model is gone", async () => {
    const fetchImpl = vi.fn(async (url) => {
      if (url.includes("/models?")) return new Response(JSON.stringify(LIST), { status: 200 });
      if (url.includes("gemini-3.8-flash:generateContent")) return ok('{"message":"hello"}');
      return err(404);
    });
    const out = await generate("k", body, {
      models: ["gemini-2.0-flash", "gemini-2.0-flash-lite"],
      fetchImpl,
    });
    expect(out.model).toBe("gemini-3.8-flash");
  });

  it("moves to the next model when Google returns a server error (e.g. 503 overloaded)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(err(503, '{"error":{"message":"The model is overloaded."}}'))
      .mockResolvedValueOnce(ok('{"message":"ok"}'));
    const out = await generate("k", body, {
      models: ["gemini-3.6-flash", "gemini-flash-latest"],
      fetchImpl,
    });
    expect(out.model).toBe("gemini-flash-latest");
  });

  it("moves on after a network error too", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(ok('{"message":"ok"}'));
    expect((await generate("k", body, { models: ["a", "b"], fetchImpl })).model).toBe("b");
  });

  it("reports provider_error with Google's status code when every model fails", async () => {
    const fetchImpl = vi.fn(async (url) =>
      url.includes("/models?")
        ? new Response(JSON.stringify({ models: [] }), { status: 200 })
        : err(503),
    );
    await expect(generate("k", body, { models: ["a", "b"], fetchImpl })).rejects.toMatchObject({
      reason: "provider_error",
      upstream: 503,
    });
  });

  it("stops trying once the time budget is nearly used up", async () => {
    const slow503 = () => new Promise((r) => setTimeout(() => r(err(503)), 60));
    const fetchImpl = vi.fn(slow503);
    await expect(
      generate("k", body, { models: ["a", "b", "c"], fetchImpl, budgetMs: 1550 }),
    ).rejects.toBeInstanceOf(ConciergeError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("does not switch models for quota or auth errors", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(err(429));
    await expect(generate("k", body, { models: ["a", "b"], fetchImpl })).rejects.toMatchObject({
      reason: "quota_exceeded",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("reports an empty answer and a timeout distinctly", async () => {
    await expect(
      generate("k", body, { models: ["a"], fetchImpl: async () => ok("") }),
    ).rejects.toMatchObject({ reason: "empty_response" });
    const abort = async () =>
      Promise.reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
    await expect(generate("k", body, { models: ["a"], fetchImpl: abort })).rejects.toBeInstanceOf(
      ConciergeError,
    );
    await expect(generate("k", body, { models: ["a"], fetchImpl: abort })).rejects.toMatchObject({
      reason: "timeout",
    });
  });
});
