import type { Product, Collection } from "./types";

export interface StoreClient {
  getProducts(opts?: { limit?: number; collection?: string; cursor?: string }): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  getCollections(): Promise<Collection[]>;
  getCollection(handle: string): Promise<Collection | null>;
}

import { mockClient } from "./mock/adapter";
import { createStorefrontClient } from "./storefront/adapter";
import { loadLocalImageIndex } from "./local-images";

type StoreEnv = {
  SHOPIFY_STOREFRONT_TOKEN?: string;
  SHOPIFY_STORE_DOMAIN?: string;
  SHOPIFY_STOREFRONT_API_VERSION?: string;
};

/**
 * Choose the commerce backend from the environment: the real Shopify Storefront
 * API when a token + domain are present, otherwise the local mock. Pure and
 * env-injected so it can be unit-tested without touching process.env.
 */
export function resolveStoreClient(env: StoreEnv): { client: StoreClient; source: "storefront" | "mock" } {
  if (env.SHOPIFY_STOREFRONT_TOKEN && env.SHOPIFY_STORE_DOMAIN) {
    return {
      client: createStorefrontClient({
        domain: env.SHOPIFY_STORE_DOMAIN,
        token: env.SHOPIFY_STOREFRONT_TOKEN,
        apiVersion: env.SHOPIFY_STOREFRONT_API_VERSION,
        // Curated /media imagery wins over Shopify CDN copies of the old
        // WordPress images — same overlay the mock adapter applies.
        localImages: loadLocalImageIndex(),
      }),
      source: "storefront",
    };
  }
  return { client: mockClient, source: "mock" };
}

// Single shared client. Falls back to the mock until Shopify env is set.
export const store: StoreClient = resolveStoreClient({
  SHOPIFY_STOREFRONT_TOKEN: process.env.SHOPIFY_STOREFRONT_TOKEN,
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_API_VERSION: process.env.SHOPIFY_STOREFRONT_API_VERSION,
}).client;
