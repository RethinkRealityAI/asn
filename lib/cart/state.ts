/**
 * lib/cart/state.ts
 *
 * Pure cart logic — no side effects, no React, no browser APIs.
 * Shaped after a Shopify Storefront cart so the later Shopify-backed
 * implementation can swap in with no UI change.
 *
 * All functions are immutable: they return new CartState objects.
 */

import type { Product, Variant, Money } from "@/lib/shopify/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CartItem = {
  variantId: string;
  quantity: number;
  product: Product;
  variant: Variant;
};

export type CartState = {
  items: CartItem[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export const EMPTY_CART: CartState = { items: [] };

// ── Pure functions ────────────────────────────────────────────────────────────

/**
 * Add a product/variant line. If the variant already exists, increment qty.
 */
export function addLine(
  s: CartState,
  product: Product,
  variant: Variant,
  qty: number = 1
): CartState {
  const existing = s.items.findIndex((i) => i.variantId === variant.id);

  if (existing !== -1) {
    // Variant already in cart — increment quantity
    const items = s.items.map((item, idx) =>
      idx === existing ? { ...item, quantity: item.quantity + qty } : item
    );
    return { ...s, items };
  }

  // New line
  const newItem: CartItem = {
    variantId: variant.id,
    quantity: qty,
    product,
    variant,
  };
  return { ...s, items: [...s.items, newItem] };
}

/**
 * Update the quantity of an existing line.
 * qty <= 0 removes the line (mirrors Shopify Storefront behaviour).
 */
export function updateQty(
  s: CartState,
  variantId: string,
  qty: number
): CartState {
  if (qty <= 0) {
    return removeLine(s, variantId);
  }
  const items = s.items.map((item) =>
    item.variantId === variantId ? { ...item, quantity: qty } : item
  );
  return { ...s, items };
}

/**
 * Remove a line by variantId. No-op if not found.
 */
export function removeLine(s: CartState, variantId: string): CartState {
  return { ...s, items: s.items.filter((i) => i.variantId !== variantId) };
}

/**
 * Sum of all item quantities.
 */
export function cartCount(s: CartState): number {
  return s.items.reduce((n, i) => n + i.quantity, 0);
}

/**
 * Sum of (variant.price.amount × quantity) across all lines, in CAD.
 */
export function cartSubtotal(s: CartState): Money {
  const amount = s.items.reduce(
    (sum, i) => sum + i.variant.price.amount * i.quantity,
    0
  );
  return { amount, currencyCode: "CAD" };
}
