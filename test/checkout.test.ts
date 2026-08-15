import { describe, it, expect, vi } from "vitest";
import { startCheckout, resolvePublicShopifyConfig } from "@/lib/cart/checkout";
import type { CartItem } from "@/lib/cart/state";
import type { Product, Variant } from "@/lib/shopify/types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeVariant = (id: string, amount: number): Variant => ({
  id,
  title: `Variant ${id}`,
  sku: null,
  price: { amount, currencyCode: "CAD" },
  compareAtPrice: null,
  available: true,
  selectedOptions: [],
  weightGrams: 250,
});

const makeProduct = (handle: string, variants: Variant[]): Product => ({
  handle,
  title: `Product ${handle}`,
  descriptionHtml: "",
  vendor: "Shea",
  productType: "Skincare",
  tags: [],
  options: [],
  variants,
  images: [],
  priceRange: { min: variants[0].price, max: variants[variants.length - 1].price },
});

const varA = makeVariant("gid://shopify/ProductVariant/111", 12.5);
const varB = makeVariant("gid://shopify/ProductVariant/222", 22.0);
const items: CartItem[] = [
  { variantId: varA.id, quantity: 2, product: makeProduct("a", [varA]), variant: varA },
  { variantId: varB.id, quantity: 1, product: makeProduct("b", [varB]), variant: varB },
];

const SF_CART_RESPONSE = {
  data: {
    cartCreate: {
      cart: {
        id: "gid://shopify/Cart/xyz",
        checkoutUrl: "https://shea-allnaturals.myshopify.com/cart/c/xyz?key=k",
        totalQuantity: 3,
        cost: { subtotalAmount: { amount: "47.00", currencyCode: "CAD" } },
        lines: { edges: [] },
      },
      userErrors: [],
    },
  },
};

function stubFetch(body: unknown) {
  return vi.fn(async () => ({ ok: true, status: 200, json: async () => body })) as unknown as typeof fetch;
}

const CFG = { domain: "shea-allnaturals.myshopify.com", token: "tok", apiVersion: "2025-01" };

// ── resolvePublicShopifyConfig ────────────────────────────────────────────────

describe("resolvePublicShopifyConfig", () => {
  it("returns config when both public env values are present", () => {
    const cfg = resolvePublicShopifyConfig({
      NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "shea-allnaturals.myshopify.com",
      NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: "tok",
    });
    expect(cfg).toEqual({ domain: "shea-allnaturals.myshopify.com", token: "tok", apiVersion: undefined });
  });

  it("returns null when either value is missing (mock mode)", () => {
    expect(resolvePublicShopifyConfig({})).toBeNull();
    expect(resolvePublicShopifyConfig({ NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "d" })).toBeNull();
    expect(resolvePublicShopifyConfig({ NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: "t" })).toBeNull();
  });
});

// ── startCheckout ─────────────────────────────────────────────────────────────

describe("startCheckout", () => {
  it("creates a Shopify cart from local items and returns the hosted checkoutUrl", async () => {
    const fetchImpl = stubFetch(SF_CART_RESPONSE);
    const url = await startCheckout(items, { ...CFG, fetch: fetchImpl });

    expect(url).toBe("https://shea-allnaturals.myshopify.com/cart/c/xyz?key=k");

    const init = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0][1];
    const parsed = JSON.parse(init.body as string);
    expect(parsed.query).toContain("cartCreate");
    expect(parsed.variables.input.lines).toEqual([
      { merchandiseId: "gid://shopify/ProductVariant/111", quantity: 2 },
      { merchandiseId: "gid://shopify/ProductVariant/222", quantity: 1 },
    ]);
  });

  it("throws on an empty cart", async () => {
    const fetchImpl = stubFetch(SF_CART_RESPONSE);
    await expect(startCheckout([], { ...CFG, fetch: fetchImpl })).rejects.toThrow(/empty/i);
  });

  it("surfaces Shopify userErrors", async () => {
    const fetchImpl = stubFetch({
      data: { cartCreate: { cart: null, userErrors: [{ field: null, message: "Variant is unavailable" }] } },
    });
    await expect(startCheckout(items, { ...CFG, fetch: fetchImpl })).rejects.toThrow(/unavailable/i);
  });
});
