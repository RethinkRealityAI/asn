/**
 * scripts/shopify-push.ts
 *
 * Transforms lib/shopify/mock/catalog.json into JSONL of Shopify `ProductSetInput`
 * objects (one `{ "input": {...} }` per line) for bulkOperationRunMutation(productSet).
 * Idempotent by handle. Prints data-shape stats + edge cases before any upload.
 *
 * Usage: npx tsx scripts/shopify-push.ts <out.jsonl>
 */

import fs from "fs";
import path from "path";

type Money = { amount: number; currencyCode: string };
type Variant = {
  id: string; title: string; sku: string | null;
  price: Money; compareAtPrice: Money | null;
  available: boolean; selectedOptions: { name: string; value: string }[];
};
type CatProduct = {
  handle: string; title: string; descriptionHtml: string; vendor: string;
  productType: string; tags: string[]; options: { name: string; values: string[] }[];
  variants: Variant[]; images: { url: string; altText?: string }[];
};

const money = (n: number) => (Math.round(Number(n) * 100) / 100).toFixed(2);

function toInput(p: CatProduct) {
  const hasOptions = Array.isArray(p.options) && p.options.length > 0;
  const productOptions = hasOptions
    ? p.options.map((o) => ({ name: o.name, values: o.values.map((v) => ({ name: String(v) })) }))
    : [{ name: "Title", values: [{ name: "Default Title" }] }];

  const variants = p.variants.map((v) => {
    const optionValues =
      v.selectedOptions && v.selectedOptions.length > 0
        ? v.selectedOptions.map((so) => ({ optionName: so.name, name: so.value }))
        : [{ optionName: "Title", name: "Default Title" }];
    const out: Record<string, unknown> = {
      optionValues,
      price: money(v.price.amount),
      inventoryItem: { tracked: false },
    };
    if (v.sku) out.sku = v.sku;
    if (v.compareAtPrice && v.compareAtPrice.amount != null) out.compareAtPrice = money(v.compareAtPrice.amount);
    return out;
  });

  const files = (p.images || [])
    .filter((img) => img?.url)
    .map((img) => ({ originalSource: img.url, contentType: "IMAGE", alt: img.altText || p.title }));

  const input: Record<string, unknown> = {
    handle: p.handle,
    title: p.title,
    descriptionHtml: p.descriptionHtml,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    status: "ACTIVE",
    productOptions,
    variants,
  };
  if (files.length) input.files = files;
  return input;
}

const outPath = process.argv[2] || path.resolve(process.cwd(), "shopify-products.jsonl");
const catalog = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "lib/shopify/mock/catalog.json"), "utf-8")
) as CatProduct[];

// ── Edge-case audit ─────────────────────────────────────────────────────────
const noOptions = catalog.filter((p) => !p.options?.length);
const multiVariantNoOption = catalog.filter((p) => !p.options?.length && p.variants.length > 1);
const noVariants = catalog.filter((p) => !p.variants?.length);
const noImages = catalog.filter((p) => !p.images?.length);
const manyVariants = catalog.filter((p) => p.variants.length > 100);

console.log(`Products:            ${catalog.length}`);
console.log(`Total variants:      ${catalog.reduce((n, p) => n + p.variants.length, 0)}`);
console.log(`No options (→Title): ${noOptions.length}`);
console.log(`No variants (BAD):   ${noVariants.length}${noVariants.length ? " " + noVariants.map((p) => p.handle).join(", ") : ""}`);
console.log(`>1 variant + no opt (BAD): ${multiVariantNoOption.length}${multiVariantNoOption.length ? " " + multiVariantNoOption.map((p) => p.handle).join(", ") : ""}`);
console.log(`>100 variants (BAD): ${manyVariants.length}`);
console.log(`No images:           ${noImages.length}`);

const lines = catalog.map((p) => JSON.stringify({ input: toInput(p) }));
fs.writeFileSync(outPath, lines.join("\n") + "\n");
console.log(`\nWrote ${lines.length} lines → ${outPath}`);
