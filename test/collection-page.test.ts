/**
 * Collection page data-fetch integrity.
 *
 * The /collections/[handle] page used to resolve its grid by mapping over
 * `col.productHandles` and calling `store.getProduct(h)` once per handle,
 * then dropping any null result with `.filter(p => p != null)`.
 *
 * On Bulk & Wholesale that is 48 Storefront round-trips at build time, and
 * because the nulls were swallowed silently, ANY partial failure baked a
 * short — or completely empty — grid into the statically generated page.
 * That is the "no products match these filters" the client reported.
 *
 * The adapters already expose a single-query path (`getProducts({ collection })`),
 * so the page must use that instead.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { store } from "@/lib/shopify";

const PAGE = path.resolve(
  __dirname,
  "..",
  "app/collections/[handle]/page.tsx"
);

describe("collection page — product fetching", () => {
  const src = fs.readFileSync(PAGE, "utf8");

  it("resolves the grid with one collection query, not an n+1 over handles", () => {
    expect(src).toMatch(/getProducts\(\s*\{\s*collection:/);
    // The n+1 must not come back.
    expect(src).not.toMatch(/productHandles\.map\(/);
  });

  it("does not silently swallow failed product fetches", () => {
    expect(src).not.toMatch(/filter\(\s*\(p\)\s*:\s*p is Product\s*=>\s*p\s*!=\s*null\s*\)/);
  });
});

describe("bulk-wholesale resolves a non-empty grid", () => {
  it("returns every product the collection claims to hold", async () => {
    const col = await store.getCollection("bulk-wholesale");
    expect(col).not.toBeNull();
    expect(col!.productHandles.length).toBeGreaterThan(0);

    const products = await store.getProducts({ collection: "bulk-wholesale" });
    expect(products.length).toBe(col!.productHandles.length);
  });
});
