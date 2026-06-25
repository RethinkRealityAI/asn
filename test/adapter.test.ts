import { describe, it, expect } from "vitest";
import { mockClient } from "@/lib/shopify/mock/adapter";

describe("mockClient", () => {
  it("returns a product by handle", async () => {
    const p = await mockClient.getProduct("peppermint-essential-oil");
    expect(p?.title).toBe("Peppermint Essential oil");
  });
  it("returns null for unknown handle", async () => {
    expect(await mockClient.getProduct("nope")).toBeNull();
  });
  it("limits product lists", async () => {
    const list = await mockClient.getProducts({ limit: 8 });
    expect(list).toHaveLength(8);
  });
  it("returns all products when no limit", async () => {
    const list = await mockClient.getProducts();
    expect(list).toHaveLength(113);
  });
  it("filters products by collection handle", async () => {
    const cols = await mockClient.getCollections();
    const someCol = cols.find(c => c.productHandles.length > 0)!;
    const list = await mockClient.getProducts({ collection: someCol.handle });
    expect(list.length).toBe(someCol.productHandles.length);
    expect(list.every(p => someCol.productHandles.includes(p.handle))).toBe(true);
  });
});
