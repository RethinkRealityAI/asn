/**
 * Pickup content tests — local pickup is offered in the cart/checkout summary
 * as an ALTERNATIVE to shipping; shipping remains the default. Guards both the
 * pickup coordinates (day, number, email) and the fact that the shipping rows
 * are still present, so neither can regress silently.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
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

describe("cart summary offers BOTH shipping and pickup", () => {
  const cartPage = fs.readFileSync(
    path.resolve(__dirname, "..", "app", "cart", "CartPageClient.tsx"),
    "utf8",
  );

  it("keeps shipping as the default fulfilment row", () => {
    expect(cartPage).toContain("FREE_SHIPPING_THRESHOLD");
    expect(cartPage).toMatch(/>Shipping</);
    expect(cartPage).toContain("Calculated at checkout");
  });

  it("still nudges toward free Canada-wide shipping", () => {
    expect(cartPage).toMatch(/free Canada-wide shipping/i);
  });

  it("offers pickup as an additional option, not a replacement", () => {
    expect(cartPage).toContain("PICKUP.address");
    expect(cartPage).toMatch(/Or pick up locally/i);
  });
});
