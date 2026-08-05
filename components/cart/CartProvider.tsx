"use client";

/**
 * CartProvider
 *
 * React context that owns CartState + drawer visibility.
 * Persists to localStorage under key "shea-cart-v1".
 *
 * SSR-safety:
 *   - Context initial value has empty items + isOpen=false.
 *   - localStorage is read only inside a useEffect (after mount),
 *     so the server render and first client paint both see an empty
 *     cart → no hydration mismatch.
 *   - Writes to localStorage happen in a separate useEffect that fires
 *     only after mount, guarded by a `mounted` flag.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import type { Product, Variant, Money } from "@/lib/shopify/types";
import {
  addLine,
  updateQty,
  removeLine,
  cartCount,
  cartSubtotal,
  EMPTY_CART,
  type CartState,
} from "@/lib/cart/state";

// ── Storage key ───────────────────────────────────────────────────────────────

// v2: carts now hold real Shopify variant GIDs (gid://shopify/ProductVariant/…).
// The key bump silently discards v1 mock-era carts whose variant ids
// ("<handle>-v0") would fail Shopify checkout.
const STORAGE_KEY = "shea-cart-v2";

function readStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw) as CartState;
    // Basic shape guard
    if (!Array.isArray(parsed?.items)) return EMPTY_CART;
    return parsed;
  } catch {
    return EMPTY_CART;
  }
}

function writeStorage(s: CartState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Silently ignore quota errors
  }
}

// ── Context shape ─────────────────────────────────────────────────────────────

export interface CartContextValue {
  /** All items in the cart */
  items: CartState["items"];
  /** Total item quantity across all lines */
  count: number;
  /** Subtotal (variant.price × qty summed) */
  subtotal: Money;
  /** Add (or increment) a variant */
  add: (product: Product, variant: Variant, qty?: number) => void;
  /** Set quantity for a variant (0 removes) */
  update: (variantId: string, qty: number) => void;
  /** Remove a variant entirely */
  remove: (variantId: string) => void;
  /** Whether the cart drawer is open */
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY_CART);
  const [isOpen, setIsOpen] = useState(false);
  // Track mount so we never write to localStorage during SSR or first paint
  const [mounted, setMounted] = useState(false);

  // Load persisted cart after mount (client only)
  useEffect(() => {
    setState(readStorage());
    setMounted(true);
  }, []);

  // Persist to localStorage whenever state changes (skip before mount)
  useEffect(() => {
    if (!mounted) return;
    writeStorage(state);
  }, [state, mounted]);

  const add = useCallback(
    (product: Product, variant: Variant, qty?: number) =>
      setState((prev) => addLine(prev, product, variant, qty)),
    []
  );

  const update = useCallback(
    (variantId: string, qty: number) =>
      setState((prev) => updateQty(prev, variantId, qty)),
    []
  );

  const remove = useCallback(
    (variantId: string) =>
      setState((prev) => removeLine(prev, variantId)),
    []
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value: CartContextValue = {
    items: state.items,
    count: cartCount(state),
    subtotal: cartSubtotal(state),
    add,
    update,
    remove,
    isOpen,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
