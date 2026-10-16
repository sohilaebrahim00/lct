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
