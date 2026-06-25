import type { Product, Collection } from "./types";

export interface StoreClient {
  getProducts(opts?: { limit?: number; collection?: string }): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  getCollections(): Promise<Collection[]>;
  getCollection(handle: string): Promise<Collection | null>;
}

import { mockClient } from "./mock/adapter";
// Real Storefront API adapter swaps in here later via env; mock for now.
export const store: StoreClient = mockClient;
