/**
 * Checkout — turns the local cart into a Shopify cart and hands back the
 * hosted checkout URL.
 *
 * We use the Cart API (cartCreate → cart.checkoutUrl) rather than the retired
 * Checkout API. Shopify's hosted checkout then handles payment, taxes,
 * shipping rates, discount codes and order confirmation — so no card data ever
 * touches this site.
 */

import { storefront, ShopifyError } from "./client";
import type { CartLine } from "../types";

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface CartCreateResponse {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
}

/** A Storefront variant id looks like gid://shopify/ProductVariant/123. */
export function isShopifyVariantId(id: string): boolean {
  return /^gid:\/\/shopify\/ProductVariant\/\w+/.test(id);
}

/**
 * Create a Shopify cart from the given lines and return its checkout URL.
 *
 * Throws ShopifyError when the store is unconfigured, when any line isn't a
 * real Shopify variant (i.e. the cart was built against the mock catalogue),
 * or when Shopify rejects the cart.
 */
export async function createCheckout(lines: CartLine[]): Promise<string> {
  if (!lines.length) {
    throw new ShopifyError("Cannot create a checkout from an empty cart.");
  }

  const invalid = lines.filter((l) => !isShopifyVariantId(l.variantId));
  if (invalid.length) {
    throw new ShopifyError(
      "Cart contains items that aren't linked to Shopify variants. Clear the cart and add items again.",
      invalid.map((l) => l.variantId),
    );
  }

  const data = await storefront<CartCreateResponse>(
    CART_CREATE,
    {
      lines: lines.map((l) => ({
        merchandiseId: l.variantId,
        quantity: Math.max(1, Math.floor(l.quantity)),
      })),
    },
    // Never cache a cart mutation.
    { revalidate: false },
  );

  const { cart, userErrors } = data.cartCreate;

  if (userErrors?.length) {
    throw new ShopifyError(userErrors.map((e) => e.message).join("; "), userErrors);
  }
  if (!cart?.checkoutUrl) {
    throw new ShopifyError("Shopify did not return a checkout URL.");
  }

  return cart.checkoutUrl;
}
