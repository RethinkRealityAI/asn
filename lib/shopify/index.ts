import type { Product, Collection } from "./types";

export interface StoreClient {
  getProducts(opts?: { limit?: number; collection?: string }): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  getCollections(): Promise<Collection[]>;
  getCollection(handle: string): Promise<Collection | null>;
}

import { mockClient } from "./mock/adapter";
import { storefrontClient } from "./storefront/adapter";
import { isShopifyConfigured } from "./storefront/client";

/**
 * The single commerce data source for the whole app.
 *
 * Uses the real Shopify Storefront API when SHOPIFY_STORE_DOMAIN and
 * SHOPIFY_STOREFRONT_TOKEN are set, and falls back to the seeded mock
 * catalogue otherwise, so local dev and previews still work without creds.
 *
 * This matters beyond data: only the Shopify-backed catalogue carries real
 * variant GIDs, and those are what make checkout possible.
 */
export const store: StoreClient = isShopifyConfigured() ? storefrontClient : mockClient;

/** Re-exported so the UI can tell whether real checkout is available. */
export { isShopifyConfigured } from "./storefront/client";
