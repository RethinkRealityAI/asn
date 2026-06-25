import { parse } from "csv-parse/sync";
import fs from "fs";
import type { Product, Variant, ProductImage, Money } from "@/lib/shopify/types";

function cad(amount: number): Money {
  return { amount, currencyCode: "CAD" };
}

export async function loadCatalog(csvPath: string): Promise<Product[]> {
  const content = fs.readFileSync(csvPath, "utf8");

  // csv-parse with BOM stripping and column header mode
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  // Group rows by Handle, preserving first-seen order
  const groups = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const handle = row["Handle"]?.trim();
    if (!handle) continue;
    if (!groups.has(handle)) groups.set(handle, []);
    groups.get(handle)!.push(row);
  }

  const products: Product[] = [];

  for (const [handle, grp] of groups) {
    // Product-level fields from first row of the group
    const first = grp[0];
    const title = first["Title"]?.trim() ?? "";
    const descriptionHtml = first["Body (HTML)"]?.trim() ?? "";
    const vendor = first["Vendor"]?.trim() ?? "";
    const productType = first["Type"]?.trim() ?? "";
    const rawTags = first["Tags"]?.trim() ?? "";
    const tags = rawTags
      ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    // --- Images ---
    // Collect all rows with non-empty Image Src, de-dupe by URL, sort by Image Position
    const seenUrls = new Set<string>();
    const imageEntries: { url: string; altText: string; position: number }[] = [];
    for (const row of grp) {
      const url = row["Image Src"]?.trim();
      if (!url || seenUrls.has(url)) continue;
      seenUrls.add(url);
      const altText = (row["Image Alt Text"]?.trim() || title);
      const position = parseInt(row["Image Position"] ?? "0", 10) || 0;
      imageEntries.push({ url, altText, position });
    }
    imageEntries.sort((a, b) => a.position - b.position);
    const images: ProductImage[] = imageEntries.map(({ url, altText }) => ({ url, altText }));

    // --- Variants ---
    // Only rows with a non-empty Variant Price are variant rows
    const variantRows = grp.filter((row) => row["Variant Price"]?.trim());

    // Collect option names from variant rows (Option1 Name, Option2 Name, Option3 Name)
    // Use first row as authoritative for option names (they're the same across the group)
    const optionNames: string[] = [];
    for (const key of ["Option1 Name", "Option2 Name", "Option3 Name"] as const) {
      const name = first[key]?.trim();
      if (name) optionNames.push(name);
    }

    // Collect distinct values per option across variant rows
    const optionValuesMap = new Map<string, string[]>();
    for (const name of optionNames) optionValuesMap.set(name, []);

    const variants: Variant[] = variantRows.map((row, idx) => {
      const sku = row["Variant SKU"]?.trim() || null;
      const price = cad(parseFloat(row["Variant Price"]));
      const rawCompare = row["Variant Compare At Price"]?.trim();
      const compareAtPrice = rawCompare ? cad(parseFloat(rawCompare)) : null;

      // Build selectedOptions and track distinct values
      const selectedOptions: { name: string; value: string }[] = [];
      const valueParts: string[] = [];

      for (const [optIdx, name] of optionNames.entries()) {
        const valueKey = `Option${optIdx + 1} Value`;
        const value = row[valueKey]?.trim() ?? "";
        selectedOptions.push({ name, value });
        valueParts.push(value);

        const existing = optionValuesMap.get(name)!;
        if (value && !existing.includes(value)) existing.push(value);
      }

      const variantTitle =
        valueParts.filter(Boolean).join(" / ") || "Default Title";

      return {
        id: `${handle}-v${idx}`,
        title: variantTitle,
        sku,
        price,
        compareAtPrice,
        available: true,
        selectedOptions,
      };
    });

    // Build options array
    const options = optionNames.map((name) => ({
      name,
      values: optionValuesMap.get(name) ?? [],
    }));

    // Price range
    const prices = variants.map((v) => v.price.amount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    products.push({
      handle,
      title,
      descriptionHtml,
      vendor,
      productType,
      tags,
      options,
      variants,
      images,
      priceRange: { min: cad(minPrice), max: cad(maxPrice) },
    });
  }

  return products;
}
