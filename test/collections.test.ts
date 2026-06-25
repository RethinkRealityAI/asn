import { describe, it, expect } from "vitest";
import { deriveCollections } from "@/lib/catalog/collections";
import catalog from "@/lib/shopify/mock/catalog.json";
import type { Product } from "@/lib/shopify/types";

describe("deriveCollections", () => {
  const cols = deriveCollections(catalog as Product[]);
  it("derives a meaningful set of collections", () => {
    expect(cols.length).toBeGreaterThanOrEqual(15);
  });
  it("each collection has a handle, title, and at least one product", () => {
    for (const c of cols) {
      expect(c.handle).toMatch(/^[a-z0-9-]+$/);
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.productHandles.length).toBeGreaterThan(0);
    }
  });
  it("separates a wholesale/bulk collection", () => {
    expect(cols.some(c => /bulk|wholesale/i.test(c.handle))).toBe(true);
  });
  it("has an oils collection with products", () => {
    const oils = cols.find(c => /oil/i.test(c.title));
    expect(oils && oils.productHandles.length).toBeTruthy();
  });
});
