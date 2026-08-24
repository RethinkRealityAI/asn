// test/filters.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { deriveFacets, applyFilters } from "@/lib/catalog/filters";
import type { Facets } from "@/lib/catalog/filters";
import { deriveCollections } from "@/lib/catalog/collections";
import catalog from "@/lib/shopify/mock/catalog.json";
import type { Product } from "@/lib/shopify/types";

const products = catalog as Product[];
const collections = deriveCollections(products);

// ── deriveFacets ─────────────────────────────────────────────────────────────

describe("deriveFacets", () => {
  let facets: Facets;
  beforeAll(() => {
    facets = deriveFacets(products, collections);
  });

  it("returns at least one category", () => {
    expect(facets.categories.length).toBeGreaterThanOrEqual(1);
  });

  it("every category has a positive count", () => {
    for (const cat of facets.categories) {
      expect(cat.count).toBeGreaterThan(0);
      expect(cat.handle.length).toBeGreaterThan(0);
      expect(cat.title.length).toBeGreaterThan(0);
    }
  });

  it("returns exactly 4 price buckets: <$15, $15-30, $30-60, $60+", () => {
    expect(facets.priceBuckets.length).toBe(4);
    const ids = facets.priceBuckets.map((b) => b.id);
    expect(ids).toContain("lt-15");
    expect(ids).toContain("15-30");
    expect(ids).toContain("30-60");
    expect(ids).toContain("60-plus");
  });

  it("price bucket counts sum to total product count", () => {
    const total = products.length;
    const bucketSum = facets.priceBuckets.reduce((s, b) => s + b.count, 0);
    // Each product lands in exactly one bucket → sum should equal total
    expect(bucketSum).toBe(total);
  });

  it("lt-15 bucket has min=0, max=15", () => {
    const b = facets.priceBuckets.find((x) => x.id === "lt-15")!;
    expect(b.min).toBe(0);
    expect(b.max).toBe(15);
  });

  it("60-plus bucket has min=60, max=null (open-ended)", () => {
    const b = facets.priceBuckets.find((x) => x.id === "60-plus")!;
    expect(b.min).toBe(60);
    expect(b.max).toBeNull();
  });

  it("exposes no concern facet — the section was removed (client request 2026-08)", () => {
    // Every product tag mirrors a category key ("Washes and Soaps",
    // "Cleansers and Shaving Bars", "Men"), so the Concern rail only ever
    // repeated the category list. Guard against it being reintroduced.
    expect("concerns" in facets).toBe(false);
  });
});

// ── applyFilters ──────────────────────────────────────────────────────────────

describe("applyFilters — category filter", () => {
  it("no filter returns all products", () => {
    const result = applyFilters(products, {}, collections);
    expect(result.length).toBe(products.length);
  });

  it("filter by a valid category handle returns only products in that collection", () => {
    const col = collections.find((c) => c.productHandles.length > 0)!;
    const result = applyFilters(products, { category: col.handle }, collections);
    const resultHandles = result.map((p) => p.handle);
    // Every result handle must be in the collection
    for (const h of resultHandles) {
      expect(col.productHandles).toContain(h);
    }
    // And count must be > 0
    expect(result.length).toBeGreaterThan(0);
  });

  it("filter by an unknown category handle returns empty array", () => {
    const result = applyFilters(products, { category: "no-such-category" }, collections);
    expect(result.length).toBe(0);
  });

  it("category + sort:price-asc combo: filtered results are sorted", () => {
    const col = collections.find((c) => c.productHandles.length >= 2)!;
    const result = applyFilters(products, { category: col.handle, sort: "price-asc" }, collections);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceRange.min.amount).toBeGreaterThanOrEqual(
        result[i - 1].priceRange.min.amount
      );
    }
  });
});

describe("applyFilters — price filter", () => {
  it("price:lt-15 returns only products with min price < 15", () => {
    const result = applyFilters(products, { price: "lt-15" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.priceRange.min.amount).toBeLessThan(15);
    }
  });

  it("price:15-30 returns only products with min price >= 15 and < 30", () => {
    const result = applyFilters(products, { price: "15-30" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.priceRange.min.amount).toBeGreaterThanOrEqual(15);
      expect(p.priceRange.min.amount).toBeLessThan(30);
    }
  });

  it("price:30-60 returns only products with min price >= 30 and < 60", () => {
    const result = applyFilters(products, { price: "30-60" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.priceRange.min.amount).toBeGreaterThanOrEqual(30);
      expect(p.priceRange.min.amount).toBeLessThan(60);
    }
  });

  it("price:60-plus returns only products with min price >= 60", () => {
    const result = applyFilters(products, { price: "60-plus" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.priceRange.min.amount).toBeGreaterThanOrEqual(60);
    }
  });

  it("unknown price id returns all products (graceful degradation)", () => {
    const result = applyFilters(products, { price: "mystery-bucket" });
    expect(result.length).toBe(products.length);
  });
});

describe("applyFilters — sort", () => {
  it("sort:price-asc produces non-decreasing min prices", () => {
    const result = applyFilters(products, { sort: "price-asc" });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceRange.min.amount).toBeGreaterThanOrEqual(
        result[i - 1].priceRange.min.amount
      );
    }
  });

  it("sort:price-desc produces non-increasing min prices", () => {
    const result = applyFilters(products, { sort: "price-desc" });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceRange.min.amount).toBeLessThanOrEqual(
        result[i - 1].priceRange.min.amount
      );
    }
  });

  it("sort:title produces alphabetical order (case-insensitive)", () => {
    const result = applyFilters(products, { sort: "title" });
    for (let i = 1; i < result.length; i++) {
      expect(
        result[i].title.toLowerCase() >= result[i - 1].title.toLowerCase()
      ).toBe(true);
    }
  });

  it("sort:featured returns same count as input (no items dropped)", () => {
    const result = applyFilters(products, { sort: "featured" });
    expect(result.length).toBe(products.length);
  });
});

// ── applyFilters: q (search) ─────────────────────────────────────────────────

describe("applyFilters — search query (q)", () => {
  it("matches product titles case-insensitively", () => {
    const result = applyFilters(products, { q: "peppermint" }, collections);
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((p) => p.handle === "peppermint-essential-oil")).toBe(true);
  });

  it("matches partial words in titles", () => {
    const result = applyFilters(products, { q: "argan" }, collections);
    expect(result.length).toBeGreaterThan(3);
    expect(result.every((p) =>
      (p.title + " " + p.productType + " " + p.tags.join(" ")).toLowerCase().includes("argan")
    )).toBe(true);
  });

  it("matches productType and tags too", () => {
    const byType = applyFilters(products, { q: "raw materials" }, collections);
    expect(byType.length).toBeGreaterThan(0);
  });

  it("returns [] when nothing matches", () => {
    expect(applyFilters(products, { q: "zzz-no-such-product" }, collections)).toEqual([]);
  });

  it("empty / whitespace query is a no-op", () => {
    expect(applyFilters(products, { q: "" }, collections).length).toBe(products.length);
    expect(applyFilters(products, { q: "   " }, collections).length).toBe(products.length);
  });

  it("composes with category filter", () => {
    const col = collections.find((c) => c.handle === "essential-oils-fragrances")!;
    const result = applyFilters(products, { q: "peppermint", category: col.handle }, collections);
    expect(result.every((p) => col.productHandles.includes(p.handle))).toBe(true);
    expect(result.some((p) => p.handle === "peppermint-essential-oil")).toBe(true);
  });
});

