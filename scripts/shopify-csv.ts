/**
 * scripts/shopify-csv.ts
 *
 * Generates a Shopify-format products CSV from lib/shopify/mock/catalog.json for
 * the admin's native Products → Import. Preserves full descriptions + images +
 * variants/options. Variants are not inventory-tracked → available for sale.
 *
 * Usage: npx tsx scripts/shopify-csv.ts <out.csv>
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

const COLUMNS = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
  "Variant SKU", "Variant Inventory Tracker", "Variant Inventory Policy", "Variant Fulfillment Service",
  "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
  "Image Src", "Image Position", "Image Alt Text", "Status",
];

const money = (n: number) => (Math.round(Number(n) * 100) / 100).toFixed(2);

function esc(v: string): string {
  if (v === "") return "";
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

const catalog = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "lib/shopify/mock/catalog.json"), "utf-8")
) as CatProduct[];

const rows: string[] = [COLUMNS.join(",")];

for (const p of catalog) {
  const optNames = p.options.map((o) => o.name);
  const rowCount = Math.max(p.variants.length, p.images.length, 1);

  for (let r = 0; r < rowCount; r++) {
    const v = p.variants[r];
    const img = p.images[r];
    const cell: Record<string, string> = {};
    COLUMNS.forEach((c) => (cell[c] = ""));

    cell["Handle"] = p.handle;

    if (r === 0) {
      cell["Title"] = p.title;
      cell["Body (HTML)"] = p.descriptionHtml;
      cell["Vendor"] = p.vendor;
      cell["Type"] = p.productType;
      cell["Tags"] = p.tags.join(", ");
      cell["Published"] = "true";
      cell["Status"] = "active";
      cell["Option1 Name"] = optNames[0] || "Title";
      cell["Option2 Name"] = optNames[1] || "";
      cell["Option3 Name"] = optNames[2] || "";
    }

    if (v) {
      const opts = v.selectedOptions;
      cell["Option1 Value"] = opts[0]?.value || (optNames.length ? "" : "Default Title");
      cell["Option2 Value"] = opts[1]?.value || "";
      cell["Option3 Value"] = opts[2]?.value || "";
      cell["Variant SKU"] = v.sku || "";
      cell["Variant Inventory Tracker"] = ""; // untracked → always available
      cell["Variant Inventory Policy"] = "deny";
      cell["Variant Fulfillment Service"] = "manual";
      cell["Variant Price"] = money(v.price.amount);
      cell["Variant Compare At Price"] = v.compareAtPrice?.amount != null ? money(v.compareAtPrice.amount) : "";
      cell["Variant Requires Shipping"] = "true";
      cell["Variant Taxable"] = "true";
    }

    if (img) {
      cell["Image Src"] = img.url;
      cell["Image Position"] = String(r + 1);
      cell["Image Alt Text"] = img.altText || p.title;
    }

    rows.push(COLUMNS.map((c) => esc(cell[c])).join(","));
  }
}

const outPath = process.argv[2] || path.resolve(process.cwd(), "shea-products-import.csv");
fs.writeFileSync(outPath, rows.join("\r\n") + "\r\n", "utf-8");
console.log(`Wrote ${rows.length - 1} rows for ${catalog.length} products → ${outPath}`);
