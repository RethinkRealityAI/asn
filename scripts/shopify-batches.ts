/**
 * scripts/shopify-batches.ts
 *
 * Emits aliased `productSet` mutation batches (query + variables per batch) so
 * all 113 catalog products can be pushed through the MCP graphql_mutation tool
 * in a handful of calls (bulkOperationRunMutation is blocked by the connector).
 *
 * Descriptions are condensed to a plain-text lead to keep payloads small enough
 * to pass inline through chat. Images (external URLs) are kept.
 *
 * Usage: npx tsx scripts/shopify-batches.ts <outDir> [batchSize]
 */

import fs from "fs";
import path from "path";

type Money = { amount: number; currencyCode: string };
type Variant = {
  title: string; sku: string | null; price: Money; compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
};
type CatProduct = {
  handle: string; title: string; descriptionHtml: string; vendor: string;
  productType: string; tags: string[]; options: { name: string; values: string[] }[];
  variants: Variant[]; images: { url: string; altText?: string }[];
};

const money = (n: number) => (Math.round(Number(n) * 100) / 100).toFixed(2);

function condense(html: string, max = 280): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const short = text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
  return `<p>${short}</p>`;
}

function toInput(p: CatProduct) {
  return {
    handle: p.handle,
    title: p.title,
    descriptionHtml: condense(p.descriptionHtml),
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    status: "ACTIVE",
    productOptions: p.options.map((o) => ({ name: o.name, values: o.values.map((v) => ({ name: String(v) })) })),
    variants: p.variants.map((v) => {
      const out: Record<string, unknown> = {
        optionValues: v.selectedOptions.map((so) => ({ optionName: so.name, name: so.value })),
        price: money(v.price.amount),
        inventoryItem: { tracked: false },
      };
      if (v.sku) out.sku = v.sku;
      if (v.compareAtPrice?.amount != null) out.compareAtPrice = money(v.compareAtPrice.amount);
      return out;
    }),
    files: p.images.filter((i) => i?.url).map((img) => ({ originalSource: img.url, contentType: "IMAGE", alt: img.altText || p.title })),
  };
}

const outDir = process.argv[2] || ".";
const batchSize = Number(process.argv[3] || 15);
const catalog = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "lib/shopify/mock/catalog.json"), "utf-8")
) as CatProduct[];

let batchIdx = 0;
for (let i = 0; i < catalog.length; i += batchSize) {
  const slice = catalog.slice(i, i + batchSize);
  const decls = slice.map((_, n) => `$i${n}: ProductSetInput!`).join(", ");
  const aliases = slice
    .map((_, n) => `p${n}: productSet(synchronous: true, input: $i${n}) { product { id handle } userErrors { field message } }`)
    .join(" ");
  const query = `mutation Batch(${decls}) { ${aliases} }`;
  const variables: Record<string, unknown> = {};
  slice.forEach((p, n) => (variables[`i${n}`] = toInput(p)));

  const file = path.join(outDir, `create-batch-${batchIdx}.json`);
  fs.writeFileSync(file, JSON.stringify({ query, variables }));
  const kb = (fs.statSync(file).size / 1024).toFixed(1);
  console.log(`batch ${batchIdx}: products ${i}..${i + slice.length - 1} (${slice.length}) → ${kb} KB`);
  batchIdx++;
}
console.log(`\n${batchIdx} batches, size ${batchSize}.`);
