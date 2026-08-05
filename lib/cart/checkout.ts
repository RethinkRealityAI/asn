/**
 * lib/cart/checkout.ts
 *
 * Real checkout: converts the local cart into a fresh Shopify cart via the
 * Storefront Cart API and returns the hosted `checkoutUrl` to redirect to.
 *
 * A fresh cart is created at checkout time (atomic, no background sync to
 * drift) — the local cart remains the source of truth until the shopper
 * hands off to Shopify's hosted checkout.
 *
 * Runs in the browser, so it uses NEXT_PUBLIC_ env (the Storefront token is
 * public-by-design). When those are absent (mock/preview mode) the caller
 * gets `null` config and should fall back to the preview message.
 */

import type { CartItem } from "@/lib/cart/state";
import { createCartClient } from "@/lib/shopify/storefront/cart";
import type { StorefrontConfig } from "@/lib/shopify/storefront/client";

type PublicEnv = {
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?: string;
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN?: string;
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION?: string;
};

/**
 * Resolve browser-side Shopify config from NEXT_PUBLIC_ env.
 * Returns null when Shopify isn't wired (mock/design-preview mode).
 */
export function resolvePublicShopifyConfig(env: PublicEnv): StorefrontConfig | null {
  const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !token) return null;
  return { domain, token, apiVersion: env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION };
}

/**
 * Create a Shopify cart from the local cart items and return the hosted
 * checkout URL. Throws on empty carts and Shopify userErrors.
 */
export async function startCheckout(items: CartItem[], config: StorefrontConfig): Promise<string> {
  if (!items.length) {
    throw new Error("Cannot start checkout with an empty cart");
  }
  const client = createCartClient(config);
  const cart = await client.create(
    items.map((i) => ({ merchandiseId: i.variantId, quantity: i.quantity }))
  );
  return cart.checkoutUrl;
}
