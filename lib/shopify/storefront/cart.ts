/**
 * lib/shopify/storefront/cart.ts
 *
 * Shopify Storefront Cart API (v2025-01) client. Wraps cartCreate /
 * cartLinesAdd / cartLinesUpdate / cartLinesRemove and maps the response onto
 * a small ShopifyCart shape that carries the hosted `checkoutUrl`.
 *
 * `addVariant` adds line-merging on top: if the variant is already in the cart
 * it increments the existing line (cartLinesUpdate) rather than creating a
 * duplicate — mirroring the local cart's addLine semantics.
 */

import type { Money } from "@/lib/shopify/types";
import { createFetcher, money, type StorefrontConfig } from "./client";

// ── Public shapes ───────────────────────────────────────────────────────────
export type CartLineInput = { merchandiseId: string; quantity: number };
export type CartLineUpdate = { id: string; quantity: number };
export type ShopifyCartLine = { id: string; variantId: string; quantity: number };
export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  lines: ShopifyCartLine[];
};

// ── Storefront response shapes ──────────────────────────────────────────────
type SFCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: { amount: string; currencyCode: string } };
  lines: { edges: { node: { id: string; quantity: number; merchandise: { id: string } } }[] };
};
type SFCartPayload = { cart: SFCart | null; userErrors: { field: string[] | null; message: string }[] };

function mapCart(c: SFCart): ShopifyCart {
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    subtotal: money(c.cost.subtotalAmount),
    lines: c.lines.edges.map((e) => ({
      id: e.node.id,
      variantId: e.node.merchandise.id,
      quantity: e.node.quantity,
    })),
  };
}

/** Unwrap a mutation payload: throw on userErrors, else map the cart. */
function unwrap(payload: SFCartPayload): ShopifyCart {
  if (payload.userErrors && payload.userErrors.length > 0) {
    throw new Error(`Shopify cart error: ${payload.userErrors.map((e) => e.message).join("; ")}`);
  }
  if (!payload.cart) {
    throw new Error("Shopify cart mutation returned no cart");
  }
  return mapCart(payload.cart);
}

// ── GraphQL ─────────────────────────────────────────────────────────────────
const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 250) {
      edges { node { id quantity merchandise { ... on ProductVariant { id } } } }
    }
  }
`;

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;

const CART_GET = /* GraphQL */ `
  query CartGet($cartId: ID!) {
    cart(id: $cartId) { ...CartFields }
  }
  ${CART_FRAGMENT}
`;

// ── Client factory ──────────────────────────────────────────────────────────
export function createCartClient(config: StorefrontConfig) {
  const request = createFetcher(config);

  const api = {
    async create(lines: CartLineInput[] = []): Promise<ShopifyCart> {
      const data = await request<{ cartCreate: SFCartPayload }>(CART_CREATE, { input: { lines } });
      return unwrap(data.cartCreate);
    },

    async get(cartId: string): Promise<ShopifyCart | null> {
      const data = await request<{ cart: SFCart | null }>(CART_GET, { cartId });
      return data.cart ? mapCart(data.cart) : null;
    },

    async addLines(cartId: string, lines: CartLineInput[]): Promise<ShopifyCart> {
      const data = await request<{ cartLinesAdd: SFCartPayload }>(CART_LINES_ADD, { cartId, lines });
      return unwrap(data.cartLinesAdd);
    },

    async updateLines(cartId: string, lines: CartLineUpdate[]): Promise<ShopifyCart> {
      const data = await request<{ cartLinesUpdate: SFCartPayload }>(CART_LINES_UPDATE, { cartId, lines });
      return unwrap(data.cartLinesUpdate);
    },

    async removeLines(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
      const data = await request<{ cartLinesRemove: SFCartPayload }>(CART_LINES_REMOVE, { cartId, lineIds });
      return unwrap(data.cartLinesRemove);
    },

    /** Add a variant, merging into an existing line if present. */
    async addVariant(cart: ShopifyCart, variantId: string, quantity: number): Promise<ShopifyCart> {
      const existing = cart.lines.find((l) => l.variantId === variantId);
      if (existing) {
        return api.updateLines(cart.id, [{ id: existing.id, quantity: existing.quantity + quantity }]);
      }
      return api.addLines(cart.id, [{ merchandiseId: variantId, quantity }]);
    },
  };

  return api;
}

export type CartClient = ReturnType<typeof createCartClient>;
