import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { loadCatalog } from "@/lib/shopify/mock/seed";
import type { Product } from "@/lib/shopify/types";

const CSV = "data/source/all_naturals_shopify_products.csv";
const COMMITTED = "lib/shopify/mock/catalog.json";

describe("loadCatalog", () => {
  it("loads 113 products", async () => {
    const products = await loadCatalog(CSV);
    expect(products).toHaveLength(113);
  });
  it("groups image rows under their product by Handle", async () => {
    const products = await loadCatalog(CSV);
    const argan = products.find(p => p.handle === "100-organic-argan-oil")!;
    expect(argan).toBeDefined();
    expect(argan.title).toBe("100% Organic Argan Oil");
    expect(argan.images.length).toBeGreaterThan(0);
  });
  it("totals 208 variants across the catalog", async () => {
    const products = await loadCatalog(CSV);
    const variants = products.reduce((n, p) => n + p.variants.length, 0);
    expect(variants).toBe(208);
  });
  it("produces CAD money with numeric amounts and a valid price range", async () => {
    const products = await loadCatalog(CSV);
    for (const p of products.slice(0, 20)) {
      expect(p.variants.length).toBeGreaterThan(0);
      expect(p.priceRange.min.currencyCode).toBe("CAD");
      expect(typeof p.priceRange.min.amount).toBe("number");
      expect(p.priceRange.max.amount).toBeGreaterThanOrEqual(p.priceRange.min.amount);
    }
  });
});

/**
 * The committed catalog.json is a build artifact of the source CSV, but it's
 * checked in and edited by hand often enough to drift — it had silently fallen
 * three products behind the CSV (110 vs 113), which nothing caught because the
 * count assertions were pinned to the stale file. Compare the whole thing so
 * any drift fails loudly with `npm run seed` as the fix.
 */
describe("the committed catalog seed matches the source CSV", () => {
  it("is byte-identical to a fresh parse", async () => {
    const fresh = await loadCatalog(CSV);
    const committed = JSON.parse(fs.readFileSync(COMMITTED, "utf8")) as Product[];

    // Compare handles first — a mismatch here gives a readable diff rather than
    // dumping two 113-product objects at the reader.
    expect(committed.map((p) => p.handle)).toEqual(fresh.map((p) => p.handle));
    expect(committed).toEqual(fresh);
  });
});
