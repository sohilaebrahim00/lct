import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The CSP lives in three hand-synced files (Netlify build config, Netlify
// _headers for drag-and-drop deploys, Apache .htaccess). These tests keep
// them identical and lock in origins that real traffic was found to need.
const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

const csp = {
  "netlify.toml": read("netlify.toml").match(/Content-Security-Policy = "([^"]+)"/)?.[1],
  "public/_headers": read("public/_headers")
    .match(/Content-Security-Policy: (.+)/)?.[1]
    ?.trim(),
  "public/.htaccess": read("public/.htaccess").match(/Content-Security-Policy "([^"]+)"/)?.[1],
};

const directive = (policy: string, name: string) =>
  policy
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith(name + " "))
    ?.split(/\s+/)
    .slice(1) ?? [];

describe("Content-Security-Policy", () => {
  it("is present and identical in all three header files", () => {
    for (const value of Object.values(csp)) expect(value).toBeTruthy();
    expect(csp["public/_headers"]).toBe(csp["netlify.toml"]);
    expect(csp["public/.htaccess"]).toBe(csp["netlify.toml"]);
  });

  const policy = csp["netlify.toml"] ?? "";

  it("allows the Clienity application forms on /join-our-team to be framed", () => {
    expect(directive(policy, "frame-src")).toContain("https://link.clienity.com");
  });

  it("allows the StatCounter beacon and Google Ads conversion pixels", () => {
    expect(directive(policy, "connect-src")).toContain("https://c.statcounter.com");
    expect(directive(policy, "img-src")).toEqual(
      expect.arrayContaining([
        "https://www.googleadservices.com",
        "https://www.googletagmanager.com",
      ]),
    );
  });

  it("does not depend on Google Fonts (fonts are self-hosted)", () => {
    expect(policy).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    expect(read("index.html")).not.toMatch(/<link[^>]+fonts\.googleapis\.com/);
  });
});
