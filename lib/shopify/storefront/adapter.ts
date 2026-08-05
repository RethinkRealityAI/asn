/**
 * Storefront API adapter — implements the same StoreClient interface as the
 * mock, so pages and components need no changes when the store goes live.
 *
 * Crucially, variant IDs here are real Shopify GIDs
 * (gid://shopify/ProductVariant/…), which is what makes the cart's lines
 * usable directly as checkout line items.
 */

import type { StoreClient } from "../index";
import type { Product, Collection, Variant, Money, ProductImage } from "../types";
import { storefront } from "./client";

// ── GraphQL fragments ────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    handle
    title
    descriptionHtml
    vendor
    productType
    tags
    options {
      name
      values
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 20) {
      nodes {
        url
        altText
        width
        height
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

// ── Shopify response shapes ──────────────────────────────────────────────────

interface SFMoney {
  amount: string;
  currencyCode: string;
}

interface SFProduct {
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  options: { name: string; values: string[] }[];
  priceRange: { minVariantPrice: SFMoney; maxVariantPrice: SFMoney };
  images: { nodes: { url: string; altText: string | null; width: number | null; height: number | null }[] };
  variants: {
    nodes: {
      id: string;
      title: string;
      sku: string | null;
      availableForSale: boolean;
      price: SFMoney;
      compareAtPrice: SFMoney | null;
      selectedOptions: { name: string; value: string }[];
    }[];
  };
}

// ── Mappers ──────────────────────────────────────────────────────────────────

/**
 * Shopify returns money as a decimal string. The app models it as a number
 * with a fixed CAD currency, matching the mock adapter.
 */
function toMoney(m: SFMoney | null | undefined): Money | null {
  if (!m) return null;
  const amount = Number.parseFloat(m.amount);
  if (Number.isNaN(amount)) return null;
  return { amount, currencyCode: "CAD" };
}

function toImage(n: SFProduct["images"]["nodes"][number]): ProductImage {
  return {
    url: n.url,
    altText: n.altText ?? "",
    ...(n.width ? { width: n.width } : {}),
    ...(n.height ? { height: n.height } : {}),
  };
}

function toVariant(v: SFProduct["variants"]["nodes"][number]): Variant {
  return {
    id: v.id, // Shopify GID — used directly as the checkout merchandiseId
    title: v.title,
    sku: v.sku,
    price: toMoney(v.price) ?? { amount: 0, currencyCode: "CAD" },
    compareAtPrice: toMoney(v.compareAtPrice),
    available: v.availableForSale,
    selectedOptions: v.selectedOptions,
  };
}

function toProduct(p: SFProduct): Product {
  return {
    handle: p.handle,
    title: p.title,
    descriptionHtml: p.descriptionHtml,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    options: p.options,
    variants: p.variants.nodes.map(toVariant),
    images: p.images.nodes.map(toImage),
    priceRange: {
      min: toMoney(p.priceRange.minVariantPrice) ?? { amount: 0, currencyCode: "CAD" },
      max: toMoney(p.priceRange.maxVariantPrice) ?? { amount: 0, currencyCode: "CAD" },
    },
  };
}

// ── Queries ──────────────────────────────────────────────────────────────────

/** Page through every published product (Storefront caps at 250 per page). */
async function fetchAllProducts(): Promise<Product[]> {
  const query = /* GraphQL */ `
    ${PRODUCT_FRAGMENT}
    query AllProducts($cursor: String) {
      products(first: 250, after: $cursor) {
        nodes {
          ...ProductFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const all: Product[] = [];
  let cursor: string | null = null;

  // Bounded loop — guards against a pathological cursor cycle.
  for (let page = 0; page < 40; page++) {
    const data: {
      products: { nodes: SFProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
    } = await storefront(query, { cursor });

    all.push(...data.products.nodes.map(toProduct));

    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  return all;
}

async function fetchProduct(handle: string): Promise<Product | null> {
  const query = /* GraphQL */ `
    ${PRODUCT_FRAGMENT}
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        ...ProductFields
      }
    }
  `;
  const data = await storefront<{ product: SFProduct | null }>(query, { handle });
  return data.product ? toProduct(data.product) : null;
}

/** Collections with their product handles, matching the mock's shape. */
async function fetchCollections(): Promise<Collection[]> {
  const query = /* GraphQL */ `
    query AllCollections($cursor: String) {
      collections(first: 250, after: $cursor) {
        nodes {
          handle
          title
          products(first: 250) {
            nodes {
              handle
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const all: Collection[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < 20; page++) {
    const data: {
      collections: {
        nodes: { handle: string; title: string; products: { nodes: { handle: string }[] } }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } = await storefront(query, { cursor });

    all.push(
      ...data.collections.nodes.map((c) => ({
        handle: c.handle,
        title: c.title,
        productHandles: c.products.nodes.map((p) => p.handle),
      })),
    );

    if (!data.collections.pageInfo.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }

  return all;
}

// ── Client ───────────────────────────────────────────────────────────────────

export const storefrontClient: StoreClient = {
  async getProducts(opts) {
    let products = await fetchAllProducts();

    if (opts?.collection) {
      const collections = await fetchCollections();
      const target = collections.find((c) => c.handle === opts.collection);
      const handles = new Set(target?.productHandles ?? []);
      products = products.filter((p) => handles.has(p.handle));
    }

    return typeof opts?.limit === "number" ? products.slice(0, opts.limit) : products;
  },

  async getProduct(handle) {
    return fetchProduct(handle);
  },

  async getCollections() {
    return fetchCollections();
  },

  async getCollection(handle) {
    const collections = await fetchCollections();
    return collections.find((c) => c.handle === handle) ?? null;
  },
};
