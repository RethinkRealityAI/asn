import { describe, it, expect } from "vitest";
import { applyFilters } from "@/lib/catalog/filters";
import { toSearchHit, type SearchHit } from "@/lib/catalog/search-hit";
import catalog from "@/lib/shopify/mock/catalog.json";
import type { Product } from "@/lib/shopify/types";

const products = catalog as Product[];

describe("search — global, unscoped by any collection", () => {
  it("finds matches across the FULL catalog regardless of any prior category", () => {
    // Simulates: user was browsing "Combo Packages", then searches "peppermint" —
    // global search must not be constrained by that prior context.
    const result = applyFilters(products, { q: "peppermint" });
    expect(result.some((p) => p.handle === "peppermint-essential-oil")).toBe(true);
  });

  it("ignores a stale category left in a FilterState object it wasn't given", () => {
    // applyFilters with no `collections` arg + a category set silently ignores
    // the category (documented graceful-degradation) — the /search route
    // deliberately never passes a category, so this can't leak through.
    const withoutCollections = applyFilters(products, { q: "peppermint", category: "combo-packages" });
    expect(withoutCollections.some((p) => p.handle === "peppermint-essential-oil")).toBe(true);
  });
});

describe("toSearchHit", () => {
  it("maps a Product to a lightweight search result shape", () => {
    const p = products.find((x) => x.handle === "peppermint-essential-oil")!;
    const hit: SearchHit = toSearchHit(p);
    expect(hit).toEqual({
      handle: "peppermint-essential-oil",
      title: p.title,
      price: p.priceRange.min.amount,
      currencyCode: p.priceRange.min.currencyCode,
      image: p.images[0]?.url ?? null,
    });
  });

  it("handles a product with no images", () => {
    const p = { ...products[0], images: [] };
    expect(toSearchHit(p).image).toBeNull();
  });
});
