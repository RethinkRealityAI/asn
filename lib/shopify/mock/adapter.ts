import fs from "fs";
import path from "path";
import type { Product, ProductImage } from "@/lib/shopify/types";
import type { StoreClient } from "@/lib/shopify/index";
import { deriveCollections } from "@/lib/catalog/collections";
import catalogData from "./catalog.json";

const catalog = catalogData as Product[];
// Derived once at module load — cheap and consistent.
const collections = deriveCollections(catalog);

// Load local image index once at module load.
// In tests, __dirname is the src file's directory; in Next.js server, process.cwd() = project root.
let localImageIndex: Record<string, string[]> = {};
try {
  const indexPath = path.resolve(process.cwd(), "public/media/index.json");
  if (fs.existsSync(indexPath)) {
    localImageIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  }
} catch {
  // If index doesn't exist yet (e.g. pre-build), fall back to catalog images silently.
}

/** Replace product.images with local /media WebP URLs when available. */
function withLocalImages(product: Product): Product {
  const urls = localImageIndex[product.handle];
  if (!urls || urls.length === 0) return product;
  const images: ProductImage[] = urls.map((url) => ({
    url,
    altText: product.title,
  }));
  return { ...product, images };
}

export const mockClient: StoreClient = {
  async getProducts(opts) {
    let result = catalog;

    if (opts?.collection) {
      const col = collections.find(c => c.handle === opts.collection);
      const handles = new Set(col?.productHandles ?? []);
      result = catalog.filter(p => handles.has(p.handle));
    }

    if (opts?.limit !== undefined) {
      result = result.slice(0, opts.limit);
    }

    return result.map(withLocalImages);
  },

  async getProduct(handle) {
    const product = catalog.find(p => p.handle === handle) ?? null;
    return product ? withLocalImages(product) : null;
  },

  async getCollections() {
    return collections;
  },

  async getCollection(handle) {
    return collections.find(c => c.handle === handle) ?? null;
  },
};
