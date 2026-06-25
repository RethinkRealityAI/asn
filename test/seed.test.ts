import { describe, it, expect } from "vitest";
import { loadCatalog } from "@/lib/shopify/mock/seed";

const CSV = "data/source/all_naturals_shopify_products.csv";

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
