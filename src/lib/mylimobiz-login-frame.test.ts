import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// MyLimoBiz's login form measured 261px tall at every width (286–734px wide)
// on 2026-10-16. Its iframe starts at the browser default of 150px and is only
// resized after the iframe's whole page loads, so the site must reserve at
// least the form's height until then — see styles.css.
const MEASURED_FORM_HEIGHT = 261;
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

describe("MyLimoBiz login iframe sizing", () => {
  it("reserves the full form height only until MyLimoBiz's resizer sets one", () => {
    const rule = css.match(
      /\.mylimobiz-login-frame iframe\.ores4iframe:not\(\[style\*="height"\]\)\s*\{([^}]*)\}/,
    );
    expect(rule).not.toBeNull();
    const minHeight = Number(rule![1].match(/min-height:\s*(\d+)px/)?.[1]);
    expect(minHeight).toBeGreaterThanOrEqual(MEASURED_FORM_HEIGHT);
  });

  it("is applied to the popover's iframe container", () => {
    expect(read("../components/booking/mylimobiz-login-popover.tsx")).toContain(
      "mylimobiz-login-frame",
    );
  });
});
