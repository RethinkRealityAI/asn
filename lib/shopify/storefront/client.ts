/**
 * Shopify Storefront API client.
 *
 * A tiny typed fetch wrapper — no SDK — so the bundle stays small and the
 * request/caching behaviour is explicit.
 *
 * Configuration (set in Netlify → Site configuration → Environment variables):
 *   SHOPIFY_STORE_DOMAIN        e.g. all-naturals-cosmetics.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN    the public Storefront API access token
 *   SHOPIFY_API_VERSION         optional, defaults below
 *
 * Requests run server-side (SSG at build time, server components at runtime),
 * so the token is never shipped to the browser even though Storefront tokens
 * are designed to be publicly readable.
 */

const DEFAULT_API_VERSION = "2026-01";

export interface ShopifyConfig {
  domain: string;
  token: string;
  apiVersion: string;
}

/**
 * Read Shopify credentials from the environment.
 * Returns null when unconfigured — callers fall back to the mock catalogue.
 */
export function getShopifyConfig(): ShopifyConfig | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!domain || !token) return null;

  return {
    // Accept a bare domain or a full URL; normalise to the host.
    domain: domain.replace(/^https?:\/\//, "").replace(/\/+$/, ""),
    token,
    apiVersion: process.env.SHOPIFY_API_VERSION?.trim() || DEFAULT_API_VERSION,
  };
}

/** True when the store is wired up — gates real checkout in the UI. */
export function isShopifyConfigured(): boolean {
  return getShopifyConfig() !== null;
}

export class ShopifyError extends Error {
  constructor(message: string, readonly detail?: unknown) {
    super(message);
    this.name = "ShopifyError";
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; path?: string[] }[];
}

/**
 * Execute a Storefront GraphQL operation.
 *
 * `revalidate` controls Next's data cache: catalogue reads are cached and
 * revalidated periodically; cart/checkout mutations opt out entirely.
 */
export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: { revalidate?: number | false } = {},
): Promise<T> {
  const config = getShopifyConfig();
  if (!config) {
    throw new ShopifyError(
      "Shopify is not configured — set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN.",
    );
  }

  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": config.token,
    },
    body: JSON.stringify({ query, variables }),
    // `false` → always fresh (mutations). A number → ISR-style caching.
    next: opts.revalidate === false ? undefined : { revalidate: opts.revalidate ?? 3600 },
    cache: opts.revalidate === false ? "no-store" : undefined,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ShopifyError(
      `Storefront API returned ${res.status} ${res.statusText}`,
      body.slice(0, 500),
    );
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "), json.errors);
  }
  if (!json.data) {
    throw new ShopifyError("Storefront API returned no data");
  }

  return json.data;
}
