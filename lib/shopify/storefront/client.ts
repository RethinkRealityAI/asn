/**
 * lib/shopify/storefront/client.ts
 *
 * Shared low-level transport for the Shopify Storefront API (v2025-01).
 * Both the product adapter and the cart client build on this so the request
 * shape, headers, and error handling live in exactly one place. `fetch` is
 * injectable for testing.
 */

import type { Money } from "@/lib/shopify/types";

export type StorefrontConfig = {
  domain: string;
  token: string;
  apiVersion?: string;
  /** Injectable for tests; defaults to the global fetch. */
  fetch?: typeof fetch;
  /** Curated local image overlay (handle → /media URLs); server-side only. */
  localImages?: Record<string, string[]>;
};

export const DEFAULT_API_VERSION = "2025-01";

/** Shopify returns money amounts as strings; the domain uses numbers, CAD. */
export function money(m: { amount: string; currencyCode: string }): Money {
  return { amount: parseFloat(m.amount), currencyCode: m.currencyCode as "CAD" };
}

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

/** A bound GraphQL request function: `request(query, variables) => data`. */
export type StorefrontRequest = <T>(query: string, variables: Record<string, unknown>) => Promise<T>;

/** Build a request function bound to one store's endpoint + token. */
export function createFetcher(config: StorefrontConfig): StorefrontRequest {
  const apiVersion = config.apiVersion ?? DEFAULT_API_VERSION;
  const fetchImpl = config.fetch ?? fetch;
  const endpoint = `https://${config.domain}/api/${apiVersion}/graphql.json`;

  return async function request<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.token,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(`Shopify Storefront API HTTP ${res.status}`);
    }
    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors && json.errors.length > 0) {
      throw new Error(`Shopify Storefront API error: ${json.errors.map((e) => e.message).join("; ")}`);
    }
    if (!json.data) {
      throw new Error("Shopify Storefront API returned no data");
    }
    return json.data;
  };
}
