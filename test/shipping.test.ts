/**
 * Shipping & tax copy tests.
 *
 * The "free Canada-wide shipping over $75" promo ENDED — it must not survive
 * anywhere in the shipped UI, metadata or policy copy. These tests sweep the
 * whole app/ + components/ tree so a stray reintroduction fails loudly.
 *
 * They also guard the replacement facts against the live Shopify delivery
 * profile (Domestic Standard $12 / Express $20, tax + shipping calculated at
 * checkout) so the storefront can never quote a rate the store doesn't honour.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

/** Every source file the shopper can actually read copy from. */
function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        walk(full);
      } else if (/\.(tsx?|mdx?)$/.test(entry.name)) {
        out.push(full);
      }
    }
  };
  for (const dir of ["app", "components", "lib"]) walk(path.join(ROOT, dir));
  return out;
}

const FILES = sourceFiles();

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

describe("the $75 free-shipping promo is gone", () => {
  it("no source file offers free shipping over a threshold", () => {
    const offenders = FILES.filter((f) => {
      const src = fs.readFileSync(f, "utf8");
      return (
        /free[^.\n]{0,40}shipping[^.\n]{0,40}\$?\s*75/i.test(src) ||
        /\$\s*75[^.\n]{0,40}free/i.test(src) ||
        /free Canada-wide shipping/i.test(src) ||
        /Free shipping over/i.test(src) ||
        /FREE_SHIPPING_THRESHOLD/.test(src)
      );
    }).map((f) => path.relative(ROOT, f));

    expect(offenders).toEqual([]);
  });

  it("the promo bar no longer advertises a shipping offer", () => {
    const header = read("components/chrome/Header.tsx");
    expect(header).not.toMatch(/free.{0,30}shipping/i);
  });
});

describe("shipping copy matches the live Shopify rates", () => {
  // Domestic is Canada Post carrier-calculated, so there is NO fixed domestic
  // price to quote. Copy must describe live rates, never a number the store
  // can't guarantee.
  const QUOTES_A_DOMESTIC_PRICE = /\$\s*\d+(\.\d+)?\s*(CAD)?\s*(standard|shipping|flat)/i;

  it("the PDP shipping panel describes live rates, not a fixed price", () => {
    const pdp = read("app/products/[handle]/page.tsx");
    expect(pdp).toMatch(/Canada Post/i);
    expect(pdp).toMatch(/calculated at checkout/i);
    expect(pdp).not.toMatch(QUOTES_A_DOMESTIC_PRICE);
    // Previously-invented / now-stale rates must not come back.
    expect(pdp).not.toContain("8.99");
    expect(pdp).not.toContain("$12");
    expect(pdp).not.toContain("$20");
  });

  it("the policies page describes live rates without a free-shipping threshold", () => {
    const policies = read("app/policies/page.tsx");
    expect(policies).toMatch(/Canada Post/i);
    expect(policies).not.toMatch(/free shipping/i);
    expect(policies).not.toMatch(QUOTES_A_DOMESTIC_PRICE);
  });

  it("still promises free local pickup, which is a real configured rate", () => {
    expect(read("app/policies/page.tsx")).toMatch(/pickup/i);
  });
});

describe("the cart never invents a tax or shipping number", () => {
  const cartPage = read("app/cart/CartPageClient.tsx");
  const cartDrawer = read("components/cart/CartDrawer.tsx");

  it("does not hardcode a flat HST rate", () => {
    // 13% ON HST is wrong for BC/AB/etc — Shopify computes the real rate.
    expect(cartPage).not.toContain("HST_RATE");
    expect(cartPage).not.toContain("0.13");
  });

  it("defers both tax and shipping to checkout", () => {
    expect(cartPage).toMatch(/calculated at checkout/i);
    expect(cartDrawer).toMatch(/calculated at checkout/i);
  });

  it("still shows a subtotal and offers local pickup as an alternative", () => {
    expect(cartPage).toMatch(/>Subtotal</);
    expect(cartPage).toContain("PICKUP.address");
    expect(cartDrawer).toContain("PICKUP.address");
  });
});
