import { describe, it, expect } from "vitest";
import { resolveCardCta } from "@/lib/catalog/card-cta";
import catalog from "@/lib/shopify/mock/catalog.json";
import type { Product } from "@/lib/shopify/types";

const products = catalog as Product[];

function make(variants: { id: string; title: string; amount: number }[], optionName = "Size"): Product {
  return {
    handle: "x",
    title: "X",
    descriptionHtml: "",
    vendor: "v",
    productType: "t",
    tags: [],
    options: [{ name: optionName, values: variants.map((v) => v.title) }],
    variants: variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: null,
      price: { amount: v.amount, currencyCode: "CAD" },
      compareAtPrice: null,
      available: true,
      selectedOptions: [{ name: optionName, value: v.title }],
      weightGrams: 250,
    })),
    images: [],
    priceRange: {
      min: { amount: Math.min(...variants.map((v) => v.amount)), currencyCode: "CAD" },
      max: { amount: Math.max(...variants.map((v) => v.amount)), currencyCode: "CAD" },
    },
  };
}

describe("resolveCardCta", () => {
  it("quick-adds when there is exactly one variant", () => {
    const p = make([{ id: "v1", title: "Default Title", amount: 15 }]);
    expect(resolveCardCta(p)).toEqual({ kind: "add", variantId: "v1" });
  });

  it("sends multi-variant products to the PDP instead of guessing a size", () => {
    // The bug: card showed "From $85" but blind-added variants[0] (50lbs, $250).
    const p = make([
      { id: "v50", title: "50lbs", amount: 250 },
      { id: "v25", title: "25lbs", amount: 150 },
      { id: "v8", title: "8.8lbs", amount: 85 },
    ]);
    expect(resolveCardCta(p)).toEqual({ kind: "choose", optionLabel: "size" });
  });

  it("uses the product's own option name in the label", () => {
    const p = make(
      [
        { id: "a", title: "250ml", amount: 20 },
        { id: "b", title: "1L", amount: 60 },
      ],
      "Volume"
    );
    expect(resolveCardCta(p)).toEqual({ kind: "choose", optionLabel: "volume" });
  });

  it("falls back to a generic label when the option is the default placeholder", () => {
    const p = make(
      [
        { id: "a", title: "A", amount: 10 },
        { id: "b", title: "B", amount: 20 },
      ],
      "Title"
    );
    expect(resolveCardCta(p)).toEqual({ kind: "choose", optionLabel: "options" });
  });

  it("returns null when a product somehow has no variants", () => {
    const p = make([{ id: "v", title: "T", amount: 1 }]);
    p.variants = [];
    expect(resolveCardCta(p)).toBeNull();
  });
});

describe("resolveCardCta against the real catalog", () => {
  it("never quick-adds a product whose variants differ in price", () => {
    const offenders = products.filter((p) => {
      const cta = resolveCardCta(p);
      if (cta?.kind !== "add") return false;
      const prices = new Set(p.variants.map((v) => v.price.amount));
      return prices.size > 1;
    });
    expect(offenders.map((p) => p.handle)).toEqual([]);
  });

  it("multi-size bulk items route to the PDP (e.g. argan oil hair & locks butter)", () => {
    const bulk = products.find((p) => p.variants.length > 1);
    expect(bulk).toBeDefined();
    expect(resolveCardCta(bulk!)?.kind).toBe("choose");
  });
});
