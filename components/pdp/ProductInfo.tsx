"use client";

/**
 * ProductInfo
 *
 * Right-column of the PDP: eyebrow, title, price (variant-reactive),
 * VariantSwatch, quantity stepper, AddToCartButton, trust row.
 *
 * Never blue. AA contrast. Honors prefers-reduced-motion via AddToCartButton.
 */

import { useState, useId } from "react";
import type { Product, Variant } from "@/lib/shopify/types";
import { VariantSwatch } from "@/components/product/VariantSwatch";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { cn } from "@/lib/utils";

// ── CAD formatter ────────────────────────────────────────────────────────────
const cadFmt = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(amount: number): string {
  return cadFmt.format(amount);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSizeValues(product: Product): string[] {
  const opt = product.options.find((o) => o.name === "Size");
  return opt ? opt.values.filter((v) => v !== "Default Title") : [];
}

function getVariantForSize(product: Product, sizeValue: string): Variant | null {
  return (
    product.variants.find((v) =>
      v.selectedOptions.some((o) => o.name === "Size" && o.value === sizeValue)
    ) ?? null
  );
}

// ── Trust badges ─────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: "🚚", label: "Free shipping over $75" },
  { icon: "🐰", label: "Cruelty-free" },
  { icon: "🍁", label: "Made in Canada" },
];

// ── Component ────────────────────────────────────────────────────────────────

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const sizeValues = getSizeValues(product);
  const hasSizes = sizeValues.length > 0;

  // Default to first size value
  const [selectedSize, setSelectedSize] = useState<string>(sizeValues[0] ?? "");
  const [qty, setQty] = useState(1);
  const qtyId = useId();

  // Resolve the active variant based on size selection
  const selectedVariant: Variant =
    (hasSizes ? getVariantForSize(product, selectedSize) : null) ??
    product.variants[0];

  const activePrice = selectedVariant?.price ?? product.priceRange.min;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? null;

  const hasDiscount =
    compareAtPrice !== null && compareAtPrice.amount > activePrice.amount;

  function decrementQty() {
    setQty((q) => Math.max(1, q - 1));
  }

  function incrementQty() {
    setQty((q) => Math.min(99, q + 1));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Eyebrow: product type ─────────────────────────────────────────── */}
      {product.productType && (
        <p className="text-xs font-semibold uppercase tracking-widest text-marigold">
          {product.productType}
        </p>
      )}

      {/* ── Title ────────────────────────────────────────────────────────── */}
      <h1 className="font-display text-3xl md:text-4xl font-bold text-espresso leading-tight">
        {product.title}
      </h1>

      {/* ── Price ────────────────────────────────────────────────────────── */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-espresso">
          {formatMoney(activePrice.amount)}
        </span>
        {hasDiscount && (
          <span className="text-base text-espresso/40 line-through">
            {formatMoney(compareAtPrice!.amount)}
          </span>
        )}
        <span className="text-xs text-espresso/40 font-normal">CAD</span>
      </div>

      {/* ── Size swatch ──────────────────────────────────────────────────── */}
      {hasSizes && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-espresso/60">
            Size
            {selectedSize && (
              <span className="normal-case tracking-normal font-normal text-espresso ml-2">
                — {selectedSize}
              </span>
            )}
          </p>
          <VariantSwatch
            values={sizeValues}
            value={selectedSize}
            onChange={setSelectedSize}
          />
        </div>
      )}

      {/* ── Quantity stepper ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor={qtyId}
          className="text-xs font-semibold uppercase tracking-wider text-espresso/60"
        >
          Quantity
        </label>
        <div className="flex items-center gap-0 w-fit rounded-xl border border-espresso/20 overflow-hidden">
          <button
            aria-label="Decrease quantity"
            onClick={decrementQty}
            disabled={qty <= 1}
            className={cn(
              "w-10 h-10 flex items-center justify-center text-espresso",
              "hover:bg-cream transition-colors duration-150 outline-none",
              "focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-inset",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            −
          </button>
          <span
            id={qtyId}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="w-10 text-center text-sm font-medium text-espresso tabular-nums select-none"
          >
            {qty}
          </span>
          <button
            aria-label="Increase quantity"
            onClick={incrementQty}
            disabled={qty >= 99}
            className={cn(
              "w-10 h-10 flex items-center justify-center text-espresso",
              "hover:bg-cream transition-colors duration-150 outline-none",
              "focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-inset",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            +
          </button>
        </div>
      </div>

      {/* ── Add to cart ───────────────────────────────────────────────────── */}
      {selectedVariant && (
        <AddToCartButton
          product={product}
          variant={selectedVariant}
          qty={qty}
          label={
            selectedVariant.available ? "Add to cart" : "Out of stock"
          }
          className="max-w-sm"
        />
      )}

      {/* ── Trust row ─────────────────────────────────────────────────────── */}
      <ul
        aria-label="Product assurances"
        className="flex flex-wrap gap-x-5 gap-y-2 mt-1"
      >
        {TRUST_ITEMS.map(({ icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-1.5 text-xs text-espresso/60 font-medium"
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
