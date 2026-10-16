import { describe, expect, it } from "vitest";
import { myLimoBizReturnTarget } from "./mylimobiz-return-routing";

describe("myLimoBizReturnTarget", () => {
  it("forwards the exact URL MyLimoBiz's 'Register Now' link opens to /book", () => {
    expect(myLimoBizReturnTarget("/", "?la-login-widget-register=", "")).toBe(
      "/book?la-login-widget-register=",
    );
  });

  it("forwards forgot-password, post-login dashboard and booking-data returns", () => {
    expect(myLimoBizReturnTarget("/", "?la-login-widget-forget-password=", "")).toBe(
      "/book?la-login-widget-forget-password=",
    );
    expect(myLimoBizReturnTarget("/fleet", "?la-login-widget-dashboard&Sid=abc", "#x")).toBe(
      "/book?la-login-widget-dashboard&Sid=abc#x",
    );
    expect(myLimoBizReturnTarget("/contact", "?widget-booking-data=xyz", "")).toBe(
      "/book?widget-booking-data=xyz",
    );
  });

  it("leaves /book itself and ordinary URLs alone", () => {
    expect(myLimoBizReturnTarget("/book", "?la-login-widget-register=", "")).toBeNull();
    expect(myLimoBizReturnTarget("/", "", "")).toBeNull();
    expect(myLimoBizReturnTarget("/fleet", "?vehicle=suv", "")).toBeNull();
  });
});
