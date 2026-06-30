/**
 * Wholesale / bulk-wholesale catalog tests.
 *
 * Verifies that the mock adapter correctly separates the bulk-wholesale bucket
 * from the retail catalog, and that the wholesale page's pail asset references
 * are consistent with what lives in public/hero/.
 */
import { describe, it, expect } from "vitest";
import { mockClient } from "@/lib/shopify/mock/adapter";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const pub  = (...parts: string[]) => path.join(ROOT, "public", ...parts);

// ── Bulk-wholesale collection ─────────────────────────────────────────────────

describe("bulk-wholesale collection", () => {
  it("exists in the mock catalog", async () => {
    const cols = await mockClient.getCollections();
    const bulk = cols.find(c => /bulk.wholesale/i.test(c.handle));
    expect(bulk).toBeDefined();
  });

  it("contains at least one product", async () => {
    const cols = await mockClient.getCollections();
    const bulk = cols.find(c => /bulk.wholesale/i.test(c.handle))!;
    expect(bulk.productHandles.length).toBeGreaterThan(0);
  });

  it("bulk products are fetchable via getProducts({ collection })", async () => {
    const cols = await mockClient.getCollections();
    const bulk = cols.find(c => /bulk.wholesale/i.test(c.handle))!;
    const products = await mockClient.getProducts({ collection: bulk.handle });
    expect(products.length).toBeGreaterThan(0);
    expect(products.length).toBe(bulk.productHandles.length);
  });

  it("bulk products are tagged or priced as wholesale (large unit or pail size)", async () => {
    const cols = await mockClient.getCollections();
    const bulk = cols.find(c => /bulk.wholesale/i.test(c.handle))!;
    const products = await mockClient.getProducts({ collection: bulk.handle });
    // At least one product should have bulk pricing > $50 (pail/bulk size) or a bulk tag
    const hasBulkIndicator = products.some(
      p => p.priceRange.min.amount > 50 || p.tags.some(t => /bulk|wholesale|kg|lb/i.test(t))
    );
    expect(hasBulkIndicator).toBe(true);
  });
});

// ── Wholesale page pail asset references ──────────────────────────────────────
// These are the exact paths used in app/wholesale/page.tsx. If someone renames
// the files, this test breaks before the page 404s in production.

describe("wholesale page pail asset paths", () => {
  const PAIL_SRCS = [
    "/hero/pail-shea-butter.webp",
    "/hero/pail-cocoa-shea.webp",
    "/hero/pail-argan-body.webp",
  ];

  for (const src of PAIL_SRCS) {
    it(`${src} (used in wholesale page header) resolves to a real file`, () => {
      // Next.js serves public/ as the root, so /hero/x.webp → public/hero/x.webp
      expect(fs.existsSync(pub(src.replace(/^\//, "")))).toBe(true);
    });
  }
});

// ── Retail vs wholesale separation ───────────────────────────────────────────
// The mock adapter returns ALL products in the default fetch; separation is done
// in the UI by filtering on the bulk-wholesale collection handle. This tests that
// the collection filter is precise — only bulk products come back.

describe("retail vs wholesale product separation", () => {
  it("getProducts({ collection: 'bulk-wholesale' }) returns a strict subset of the full catalog", async () => {
    const cols = await mockClient.getCollections();
    const bulk = cols.find(c => /bulk.wholesale/i.test(c.handle))!;
    const allProducts = await mockClient.getProducts();
    const bulkProducts = await mockClient.getProducts({ collection: bulk.handle });

    // Bulk is a strict subset — every bulk product must appear in the full catalog
    for (const bp of bulkProducts) {
      expect(allProducts.some(p => p.handle === bp.handle)).toBe(true);
    }
    // And the full catalog has more products than just bulk
    expect(allProducts.length).toBeGreaterThan(bulkProducts.length);
  });

  it("bulk-wholesale collection contains fewer products than the full retail catalog", async () => {
    const cols = await mockClient.getCollections();
    const bulk = cols.find(c => /bulk.wholesale/i.test(c.handle))!;
    const all = await mockClient.getProducts();
    const bulkProducts = await mockClient.getProducts({ collection: bulk.handle });
    expect(bulkProducts.length).toBeLessThan(all.length);
  });
});
