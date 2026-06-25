import type { Product } from "@/lib/shopify/types";
import type { StoreClient } from "@/lib/shopify/index";
import { deriveCollections } from "@/lib/catalog/collections";
import catalogData from "./catalog.json";

const catalog = catalogData as Product[];
// Derived once at module load — cheap and consistent.
const collections = deriveCollections(catalog);

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

    return result;
  },

  async getProduct(handle) {
    return catalog.find(p => p.handle === handle) ?? null;
  },

  async getCollections() {
    return collections;
  },

  async getCollection(handle) {
    return collections.find(c => c.handle === handle) ?? null;
  },
};
