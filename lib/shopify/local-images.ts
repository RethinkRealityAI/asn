/**
 * lib/shopify/local-images.ts
 *
 * Curated local product imagery overlay. `public/media/index.json` maps
 * product handle → local WebP URLs (the 212 real photos imported via
 * `npm run images`). Both the mock and Storefront adapters use this so the
 * premium curated imagery wins over raw catalog/CDN images.
 *
 * Server-only (fs) — never import from client components.
 */

import fs from "fs";
import path from "path";
import type { Product, ProductImage } from "@/lib/shopify/types";

/** Load the local image index from public/media/index.json (empty if absent). */
export function loadLocalImageIndex(): Record<string, string[]> {
  try {
    const indexPath = path.resolve(process.cwd(), "public/media/index.json");
    if (fs.existsSync(indexPath)) {
      return JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    }
  } catch {
    // Pre-build or malformed index — fall back silently to source images.
  }
  return {};
}

/** Replace product.images with local /media URLs when the index has them. */
export function withLocalImages(product: Product, index: Record<string, string[]>): Product {
  const urls = index[product.handle];
  if (!urls || urls.length === 0) return product;
  const images: ProductImage[] = urls.map((url) => ({ url, altText: product.title }));
  return { ...product, images };
}
