/**
 * Pickup content tests — the cart/checkout pickup option (shown instead of a
 * shipping line while checkout is pre-Shopify). Guards the coordinates so a
 * wrong day, number or email can't ship silently.
 */
import { describe, it, expect } from "vitest";
import { PICKUP } from "@/lib/content/pickup";

describe("PICKUP", () => {
  it("collects on Fridays at unit 18", () => {
    expect(PICKUP.day).toMatch(/friday/i);
    expect(PICKUP.address.toLowerCase()).toContain("unit 18");
  });

  it("has a call-ahead number with a matching tel: href", () => {
    expect(PICKUP.phone).toMatch(/\d{3}-\d{3}-\d{4}/);
    const digits = PICKUP.phone.replace(/\D/g, "");
    expect(PICKUP.phoneHref).toContain(digits);
    expect(PICKUP.phoneHref.startsWith("tel:")).toBe(true);
  });

  it("uses the Timothy pickup email with a matching mailto: href", () => {
    expect(PICKUP.email.toLowerCase()).toBe("timothy@allnaturalscosmetics.ca");
    expect(PICKUP.emailHref).toBe(`mailto:${PICKUP.email}`);
  });
});
