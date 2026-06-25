import { describe, it, expect } from "vitest";
import { mockClient } from "@/lib/shopify/mock/adapter";

describe("local images", () => {
  it("serves local /media webp urls for products that have them", async () => {
    const all = await mockClient.getProducts();
    const withLocal = all.filter(p => p.images.some(i => i.url.startsWith("/media/")));
    expect(withLocal.length).toBeGreaterThan(50); // most products should have local images
    const sample = withLocal[0];
    expect(sample.images[0].url).toMatch(/^\/media\/.+\.webp$/);
    expect(sample.images[0].altText.length).toBeGreaterThan(0);
  });
});
