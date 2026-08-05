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
import type React from "react";
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

/**
 * Which size to preselect. Catalog order often lists the LARGEST bulk size
 * first (50lbs, 25lbs, 8.8lbs), so defaulting to `values[0]` opened the PDP at
 * the priciest option while the card advertised "From $85". Preselect the
 * cheapest size so the card price and the PDP price agree.
 */
function getDefaultSize(product: Product, sizeValues: string[]): string {
  if (sizeValues.length === 0) return "";
  let best = sizeValues[0];
  let bestPrice = Number.POSITIVE_INFINITY;
  for (const value of sizeValues) {
    const price = getVariantForSize(product, value)?.price.amount;
    if (price != null && price < bestPrice) {
      bestPrice = price;
      best = value;
    }
  }
  return best;
}

// ── Trust badges — SVG icons, green botanical + leaf/red maple signals ───────

const TRUST_ITEMS: { icon: React.ReactNode; label: string }[] = [
  {
    // Truck icon — marigold/orange for secondary info
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-marigold shrink-0">
        <rect x="1" y="6" width="12" height="9" rx="1.5" />
        <path d="M13 9h3l2 3v3h-5V9Z" />
        <circle cx="5" cy="17" r="1.5" />
        <circle cx="15" cy="17" r="1.5" />
      </svg>
    ),
    label: "Free shipping over $75",
  },
  {
    // Leaf icon — green botanical/cruelty-free credential
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green shrink-0">
        <path d="M3 17c3-5 6-9 14-11-2 8-7 12-14 11Z" />
        <path d="M3 17 10 8" />
      </svg>
    ),
    label: "Vegan · Cruelty-free",
  },
  {
    // Check circle — green "natural" signal
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green shrink-0">
        <circle cx="10" cy="10" r="7" />
        <path d="m7 10 2 2 4-4" />
      </svg>
    ),
    label: "100% Natural",
  },
  {
    // Maple leaf — leaf/red Canada identity accent
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-leaf shrink-0">
        <path d="M10 2 11.8 6.5H15l-2.5 2.2 1 3.3-3.5-2-3.5 2 1-3.3L5 6.5h3.2Z" />
        <rect x="9.25" y="12" width="1.5" height="4" rx="0.5" />
      </svg>
    ),
    label: "Handcrafted in Canada",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const sizeValues = getSizeValues(product);
  const hasSizes = sizeValues.length > 0;

  // Default to first size value
  const [selectedSize, setSelectedSize] = useState<string>(() =>
    getDefaultSize(product, sizeValues)
  );
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

      {/* ── Availability — green "In stock" dot ──────────────────────────── */}
      {product.variants[0]?.available !== false && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-green">
          <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-green" />
          In stock
        </p>
      )}

      {/* ── Price ────────────────────────────────────────────────────────── */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-espresso">
          {formatMoney(activePrice.amount)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-espresso/40 line-through">
            {formatMoney(compareAtPrice!.amount)}
          </span>
        )}
        <span className="text-sm text-espresso/40 font-normal">CAD</span>
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

      {/* ── Trust row — green leaf/check cues + red maple accent ────────── */}
      <ul
        aria-label="Product assurances"
        className="flex flex-wrap gap-x-5 gap-y-2.5 mt-1 pt-4 border-t border-espresso/08"
      >
        {TRUST_ITEMS.map(({ icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-1.5 text-sm text-espresso/70 font-medium"
          >
            {icon}
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
