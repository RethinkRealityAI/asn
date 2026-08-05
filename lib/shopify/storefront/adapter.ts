/**
 * lib/shopify/storefront/adapter.ts
 *
 * Real Shopify Storefront API (v2025-01) implementation of StoreClient.
 * Maps Storefront GraphQL responses onto the same Product/Variant/Collection
 * domain types the mock adapter uses, so it swaps in behind `store` with no
 * UI change. `fetch` is injectable for testing.
 */

import type { Product, Variant, Collection } from "@/lib/shopify/types";
import type { StoreClient } from "@/lib/shopify/index";
import { createFetcher, money, type StorefrontConfig } from "./client";
import { withLocalImages } from "@/lib/shopify/local-images";

export type { StorefrontConfig };
export { money };

// ── Storefront GraphQL response shapes ──────────────────────────────────────
type SFMoney = { amount: string; currencyCode: string };
type SFVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  price: SFMoney;
  compareAtPrice: SFMoney | null;
  selectedOptions: { name: string; value: string }[];
};
type SFImage = { url: string; altText: string | null; width: number | null; height: number | null };
type SFProduct = {
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  options: { name: string; values: string[] }[];
  priceRange: { minVariantPrice: SFMoney; maxVariantPrice: SFMoney };
  variants: { edges: { node: SFVariant }[] };
  images: { edges: { node: SFImage }[] };
};

type SFCollection = {
  handle: string;
  title: string;
  products: { edges: { node: { handle: string } }[] };
};

// ── Mapping: Storefront → domain types ──────────────────────────────────────
function mapVariant(v: SFVariant): Variant {
  return {
    id: v.id,
    title: v.title,
    sku: v.sku,
    price: money(v.price),
    compareAtPrice: v.compareAtPrice ? money(v.compareAtPrice) : null,
    available: v.availableForSale,
    selectedOptions: v.selectedOptions,
  };
}

function mapProduct(p: SFProduct): Product {
  return {
    handle: p.handle,
    title: p.title,
    descriptionHtml: p.descriptionHtml,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    options: p.options,
    variants: p.variants.edges.map((e) => mapVariant(e.node)),
    images: p.images.edges.map((e) => ({
      url: e.node.url,
      altText: e.node.altText ?? p.title,
      ...(e.node.width != null ? { width: e.node.width } : {}),
      ...(e.node.height != null ? { height: e.node.height } : {}),
    })),
    priceRange: {
      min: money(p.priceRange.minVariantPrice),
      max: money(p.priceRange.maxVariantPrice),
    },
  };
}

function mapCollection(c: SFCollection): Collection {
  return {
    handle: c.handle,
    title: c.title,
    productHandles: c.products.edges.map((e) => e.node.handle),
  };
}

// ── GraphQL fragments/queries ───────────────────────────────────────────────
const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    handle title descriptionHtml vendor productType tags
    options { name values }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 100) {
      edges { node {
        id title sku availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      } }
    }
    images(first: 20) { edges { node { url altText width height } } }
  }
`;

const GET_PRODUCT = /* GraphQL */ `
  query GetProduct($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
  ${PRODUCT_FRAGMENT}
`;

const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges { node { ...ProductFields } }
      pageInfo { hasNextPage endCursor }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const GET_COLLECTION_PRODUCTS = /* GraphQL */ `
  query GetCollectionProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      products(first: $first, after: $after) {
        edges { node { ...ProductFields } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const COLLECTION_FIELDS = /* GraphQL */ `
  fragment CollectionFields on Collection {
    handle title
    products(first: 250) { edges { node { handle } } }
  }
`;

const GET_COLLECTIONS = /* GraphQL */ `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges { node { ...CollectionFields } }
    }
  }
  ${COLLECTION_FIELDS}
`;

const GET_COLLECTION = /* GraphQL */ `
  query GetCollection($handle: String!) {
    collection(handle: $handle) { ...CollectionFields }
  }
  ${COLLECTION_FIELDS}
`;

// ── Client factory ──────────────────────────────────────────────────────────
export function createStorefrontClient(config: StorefrontConfig): StoreClient {
  const request = createFetcher(config);
  const localImages = config.localImages ?? {};
  const finalize = (p: SFProduct): Product => withLocalImages(mapProduct(p), localImages);

  return {
    async getProduct(handle) {
      const data = await request<{ product: SFProduct | null }>(GET_PRODUCT, { handle });
      return data.product ? finalize(data.product) : null;
    },

    async getProducts(opts) {
      const first = opts?.limit ?? 250;
      const after = opts?.cursor ?? null;

      if (opts?.collection) {
        const data = await request<{ collection: { products: { edges: { node: SFProduct }[] } } | null }>(
          GET_COLLECTION_PRODUCTS,
          { handle: opts.collection, first, after }
        );
        if (!data.collection) return [];
        return data.collection.products.edges.map((e) => finalize(e.node));
      }

      const data = await request<{ products: { edges: { node: SFProduct }[] } }>(GET_PRODUCTS, { first, after });
      return data.products.edges.map((e) => finalize(e.node));
    },

    async getCollections() {
      const data = await request<{ collections: { edges: { node: SFCollection }[] } }>(GET_COLLECTIONS, { first: 250 });
      return data.collections.edges
        .filter((e) => e.node.handle !== "frontpage") // Shopify's built-in "Home page" collection
        .map((e) => mapCollection(e.node));
    },

    async getCollection(handle) {
      const data = await request<{ collection: SFCollection | null }>(GET_COLLECTION, { handle });
      return data.collection ? mapCollection(data.collection) : null;
    },
  };
}
