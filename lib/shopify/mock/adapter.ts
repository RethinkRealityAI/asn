import type { Product } from "@/lib/shopify/types";
import type { StoreClient } from "@/lib/shopify/index";
import { deriveCollections } from "@/lib/catalog/collections";
import { loadLocalImageIndex, withLocalImages as overlay } from "@/lib/shopify/local-images";
import catalogData from "./catalog.json";

const catalog = catalogData as Product[];
// Derived once at module load — cheap and consistent.
const collections = deriveCollections(catalog);

// Load local image index once at module load (shared with the live adapter).
const localImageIndex = loadLocalImageIndex();

/** Replace product.images with local /media WebP URLs when available. */
function withLocalImages(product: Product): Product {
  return overlay(product, localImageIndex);
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
