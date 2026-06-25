import { describe, it, expect } from "vitest";
import {
  addLine,
  updateQty,
  removeLine,
  cartCount,
  cartSubtotal,
  type CartState,
} from "@/lib/cart/state";
import type { Product, Variant } from "@/lib/shopify/types";

// ── Minimal fixtures ──────────────────────────────────────────────────────────

const makeVariant = (id: string, amount: number): Variant => ({
  id,
  title: `Variant ${id}`,
  sku: null,
  price: { amount, currencyCode: "CAD" },
  compareAtPrice: null,
  available: true,
  selectedOptions: [],
});

const makeProduct = (handle: string, variants: Variant[]): Product => ({
  handle,
  title: `Product ${handle}`,
  descriptionHtml: "",
  vendor: "Shea",
  productType: "Skincare",
  tags: [],
  options: [],
  variants,
  images: [],
  priceRange: {
    min: variants[0].price,
    max: variants[variants.length - 1].price,
  },
});

const varA = makeVariant("var-a", 12.5);
const varB = makeVariant("var-b", 22.0);
const productA = makeProduct("product-a", [varA]);
const productB = makeProduct("product-b", [varB]);

const empty: CartState = { items: [] };

// ── addLine ───────────────────────────────────────────────────────────────────

describe("addLine", () => {
  it("adds a new line", () => {
    const s = addLine(empty, productA, varA);
    expect(s.items).toHaveLength(1);
    expect(s.items[0].variantId).toBe("var-a");
    expect(s.items[0].quantity).toBe(1);
  });

  it("defaults qty to 1", () => {
    const s = addLine(empty, productA, varA);
    expect(s.items[0].quantity).toBe(1);
  });

  it("accepts a custom qty", () => {
    const s = addLine(empty, productA, varA, 3);
    expect(s.items[0].quantity).toBe(3);
  });

  it("adding the same variant twice INCREMENTS quantity (one line)", () => {
    const s1 = addLine(empty, productA, varA, 2);
    const s2 = addLine(s1, productA, varA, 3);
    expect(s2.items).toHaveLength(1);
    expect(s2.items[0].quantity).toBe(5);
  });

  it("adding a different variant adds a second line", () => {
    const s1 = addLine(empty, productA, varA);
    const s2 = addLine(s1, productB, varB);
    expect(s2.items).toHaveLength(2);
  });

  it("is immutable — original state unchanged", () => {
    const s1 = addLine(empty, productA, varA);
    addLine(s1, productA, varA);
    expect(s1.items[0].quantity).toBe(1);
  });
});

// ── updateQty ─────────────────────────────────────────────────────────────────

describe("updateQty", () => {
  it("updates quantity of an existing line", () => {
    const s1 = addLine(empty, productA, varA, 2);
    const s2 = updateQty(s1, "var-a", 5);
    expect(s2.items[0].quantity).toBe(5);
  });

  it("qty <= 0 removes the line", () => {
    const s1 = addLine(empty, productA, varA, 2);
    const s2 = updateQty(s1, "var-a", 0);
    expect(s2.items).toHaveLength(0);
  });

  it("negative qty also removes the line", () => {
    const s1 = addLine(empty, productA, varA);
    const s2 = updateQty(s1, "var-a", -1);
    expect(s2.items).toHaveLength(0);
  });

  it("updating a non-existent variantId is a no-op", () => {
    const s1 = addLine(empty, productA, varA);
    const s2 = updateQty(s1, "ghost-id", 3);
    expect(s2.items).toHaveLength(1);
    expect(s2.items[0].quantity).toBe(1);
  });
});

// ── removeLine ────────────────────────────────────────────────────────────────

describe("removeLine", () => {
  it("removes a line by variantId", () => {
    const s1 = addLine(addLine(empty, productA, varA), productB, varB);
    const s2 = removeLine(s1, "var-a");
    expect(s2.items).toHaveLength(1);
    expect(s2.items[0].variantId).toBe("var-b");
  });

  it("no-op on unknown variantId", () => {
    const s1 = addLine(empty, productA, varA);
    const s2 = removeLine(s1, "ghost-id");
    expect(s2.items).toHaveLength(1);
  });
});

// ── cartCount ─────────────────────────────────────────────────────────────────

describe("cartCount", () => {
  it("returns 0 for empty cart", () => {
    expect(cartCount(empty)).toBe(0);
  });

  it("sums all item quantities", () => {
    const s = addLine(addLine(empty, productA, varA, 3), productB, varB, 2);
    expect(cartCount(s)).toBe(5);
  });
});

// ── cartSubtotal ──────────────────────────────────────────────────────────────

describe("cartSubtotal", () => {
  it("returns zero money for empty cart", () => {
    expect(cartSubtotal(empty)).toEqual({ amount: 0, currencyCode: "CAD" });
  });

  it("sums variant.price.amount * quantity in CAD", () => {
    // varA = $12.50 × 2 = $25.00, varB = $22.00 × 3 = $66.00, total = $91.00
    const s = addLine(addLine(empty, productA, varA, 2), productB, varB, 3);
    const subtotal = cartSubtotal(s);
    expect(subtotal.amount).toBeCloseTo(91.0, 5);
    expect(subtotal.currencyCode).toBe("CAD");
  });

  it("handles single item", () => {
    const s = addLine(empty, productA, varA, 4);
    expect(cartSubtotal(s).amount).toBeCloseTo(50.0, 5); // 12.50 * 4
  });
});
