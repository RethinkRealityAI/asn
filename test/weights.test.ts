/**
 * Variant weight tests.
 *
 * Shipping is only "baked in" if Shopify knows what a parcel weighs: the US
 * cross-border tiers and the Canada Post carrier rates are both weight-driven,
 * so a missing weight silently quotes the cheapest band (a 50 lb pail shipping
 * for the 0–0.5 kg rate). The source CSV carries `Variant Grams` for every
 * variant — these tests guard that it survives the seed → catalog → Shopify
 * import CSV pipeline instead of being dropped on the floor.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "@/lib/shopify/mock/seed";
import type { Product } from "@/lib/shopify/types";

const ROOT = path.resolve(__dirname, "..");
const SOURCE_CSV = path.join(ROOT, "data/source/all_naturals_shopify_products.csv");

let cached: Product[] | null = null;
async function catalog(): Promise<Product[]> {
  if (!cached) cached = await loadCatalog(SOURCE_CSV);
  return cached;
}

describe("seed carries variant weights", () => {
  it("gives every variant a positive weight in grams", async () => {
    const products = await catalog();
    const missing = products.flatMap((p) =>
      p.variants
        .filter((v) => !v.weightGrams || v.weightGrams <= 0)
        .map((v) => `${p.handle} / ${v.title}`),
    );
    expect(missing).toEqual([]);
  });

  it("reads the heavy wholesale sizes as real parcel weights", async () => {
    const products = await catalog();
    const bySize = new Map<string, number>();
    for (const p of products) {
      for (const v of p.variants) {
        if (v.weightGrams) bySize.set(v.title, v.weightGrams);
      }
    }
    // 50 lb ≈ 22.68 kg, 25 lb ≈ 11.34 kg — these must not collapse to 0.
    expect(bySize.get("50lbs")).toBe(22680);
    expect(bySize.get("25lbs")).toBe(11340);
    expect(bySize.get("Gallon")).toBeGreaterThan(1000);
  });

  it("keeps a retail jar light enough for the cheapest band", async () => {
    const products = await catalog();
    const retail = products
      .flatMap((p) => p.variants)
      .filter((v) => v.title === "Default Title" && v.weightGrams);
    expect(retail.length).toBeGreaterThan(0);
    expect(Math.min(...retail.map((v) => v.weightGrams!))).toBeLessThan(1000);
  });
});

describe("the committed catalog seed is in sync", () => {
  it("has weights on every variant in catalog.json", () => {
    const committed = JSON.parse(
      fs.readFileSync(path.join(ROOT, "lib/shopify/mock/catalog.json"), "utf8"),
    ) as Product[];
    const missing = committed.flatMap((p) =>
      p.variants
        .filter((v) => !v.weightGrams || v.weightGrams <= 0)
        .map((v) => `${p.handle} / ${v.title}`),
    );
    expect(missing).toEqual([]);
  });
});

describe("the Shopify import CSV emits weight columns", () => {
  const script = fs.readFileSync(path.join(ROOT, "scripts/shopify-csv.ts"), "utf8");

  it("declares Variant Grams and Variant Weight Unit", () => {
    expect(script).toContain("Variant Grams");
    expect(script).toContain("Variant Weight Unit");
  });

  it("populates grams from the variant, not a constant", () => {
    expect(script).toMatch(/cell\["Variant Grams"\]\s*=[^\n]*weightGrams/);
  });
});
