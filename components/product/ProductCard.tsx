"use client";

/**
 * ProductCard
 *
 * Bespoke premium product card for the Shea Allnaturals storefront.
 * - Warm cream surface, rounded-[--radius-card], hairline espresso border
 * - Image: next/image fill inside a reserved aspect-[4/5] container
 * - Hover (pointer:fine + no reduced-motion): image zooms + glass quick-add bar slides up
 * - Touch / reduced-motion: quick-add bar is statically visible (no slide), image doesn't zoom
 * - Badge: derived from product.tags ("Bestseller" / "New" / "Sale" etc.)
 * - Price: single or "From $X" range, CAD Intl formatting
 * - Entire card keyboard-navigable; focus-visible marigold ring; title links to /products/<handle>
 *
 * Never blue. Honors prefers-reduced-motion.
 * Custom Tailwind variant pointer-fine: defined in globals.css via @custom-variant.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import type { Product, Variant } from "@/lib/shopify/types";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { VariantSwatch } from "./VariantSwatch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/useCart";

// ── CAD money formatter ─────────────────────────────────────────────────────
const cadFmt = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(amount: number): string {
  return cadFmt.format(amount);
}

// ── Badge derivation ────────────────────────────────────────────────────────
const BADGE_KEYWORDS: { keyword: string; label: string; classes: string }[] = [
  {
    keyword: "bestseller",
    label: "Bestseller",
    classes: "bg-marigold/20 text-espresso border border-marigold/40",
  },
  {
    keyword: "best seller",
    label: "Bestseller",
    classes: "bg-marigold/20 text-espresso border border-marigold/40",
  },
  {
    keyword: "new",
    label: "New",
    classes: "bg-clay/15 text-clay border border-clay/30",
  },
  {
    keyword: "sale",
    label: "Sale",
    classes: "bg-orange/15 text-orange border border-orange/30",
  },
  {
    keyword: "popular",
    label: "Popular",
    classes: "bg-marigold/20 text-espresso border border-marigold/40",
  },
  {
    keyword: "featured",
    label: "Featured",
    classes: "bg-green/10 text-green border border-green/30",
  },
];

function deriveBadge(
  tags: string[]
): { label: string; classes: string } | null {
  const lower = tags.map((t) => t.toLowerCase());
  for (const { keyword, label, classes } of BADGE_KEYWORDS) {
    if (lower.some((t) => t.includes(keyword))) {
      return { label, classes };
    }
  }
  return null;
}

// ── Size option extraction ──────────────────────────────────────────────────
function getSizeValues(product: Product): string[] {
  const sizeOpt = product.options.find((o) => o.name === "Size");
  if (!sizeOpt) return [];
  return sizeOpt.values.filter((v) => v !== "Default Title");
}

// ── Props ───────────────────────────────────────────────────────────────────
export interface ProductCardProps {
  product: Product;
  /** Pass true for above-the-fold cards to eagerly load the image */
  priority?: boolean;
}

// ── Component ───────────────────────────────────────────────────────────────
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const sizes = getSizeValues(product);
    return sizes[0] ?? "";
  });
  const { add, openCart } = useCart();

  const { priceRange, title, handle, images, productType, tags } = product;
  const badge = deriveBadge(tags);
  const sizeValues = getSizeValues(product);
  const hasSwatches = sizeValues.length > 0;

  // Price display
  const minAmt = priceRange.min.amount;
  const maxAmt = priceRange.max.amount;
  const priceDisplay =
    minAmt === maxAmt
      ? formatMoney(minAmt)
      : `From ${formatMoney(minAmt)}`;

  const img = images[0];

  function handleAddClick() {
    // Find the variant matching the currently-selected size, or fall back to first
    const variant =
      product.variants.find((v) =>
        v.selectedOptions.some(
          (o) => o.name === "Size" && o.value === selectedSize
        )
      ) ?? product.variants[0];
    if (variant) {
      add(product, variant, 1);
      openCart();
    }
  }

  // Image zoom: only on pointer:fine hover with motion allowed
  const imageScale =
    !reducedMotion && hovered ? 1.05 : 1;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[--radius-card] border border-espresso/12",
        "bg-cream overflow-hidden",
        "shadow-[0_2px_12px_0_rgba(42,30,20,0.06)]",
        "transition-shadow duration-300 ease-[--ease-warm]",
        "hover:shadow-[0_6px_28px_0_rgba(42,30,20,0.14)]",
        // Marigold focus ring for keyboard navigation
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-marigold focus-within:ring-offset-2",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Badge ───────────────────────────────────────────────────────── */}
      {badge && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase",
              badge.classes
            )}
          >
            {badge.label}
          </span>
        </div>
      )}

      {/* ── Image container — 4:5 aspect ratio, no layout shift ─────────
          Using a position-relative wrapper with padding-bottom trick so the
          aspect ratio is reserved before the image loads.
      ──────────────────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${handle}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block w-full overflow-hidden"
        style={{ paddingBottom: "125%" /* 5/4 = 1.25 → 125% */ }}
      >
        <motion.div
          className="absolute inset-0 bg-[#FAF5EC]"
          animate={{ scale: imageScale }}
          transition={{ ease: WARM, duration: DUR.base }}
          style={{ transformOrigin: "center center" }}
        >
          {img ? (
            <Image
              src={img.url}
              alt={img.altText || title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-4"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-espresso/30 text-sm font-body">No image</span>
            </div>
          )}
        </motion.div>
      </Link>

      {/* ── Info block ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 px-4 pt-3 pb-3">
        {/* Product type / eyebrow */}
        {productType && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-marigold truncate">
            {productType}
          </p>
        )}

        {/* Title — links to PDP */}
        <Link
          href={`/products/${handle}`}
          className={cn(
            "font-display text-base font-semibold text-espresso leading-snug",
            "line-clamp-2 hover:text-clay transition-colors duration-200",
            "outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1 rounded-sm"
          )}
        >
          {title}
        </Link>

        {/* Price */}
        <p className="text-sm font-medium text-espresso mt-0.5">
          {priceDisplay}
          <span className="text-espresso/40 font-normal ml-1 text-xs">CAD</span>
        </p>
      </div>

      {/* ── Quick-add bar ─────────────────────────────────────────────────
          Strategy:
          - reduced-motion=true → always-visible, no animation
          - pointer:coarse (touch) → always-visible via CSS (pointer-coarse variant)
          - pointer:fine + motion ok → JS-hover animated slide-up

          We render two nodes and let CSS/JS decide which shows:
            1. Static node (always visible on touch + reduced-motion)
            2. Animated node (pointer:fine desktop, JS-hover controlled)
      ──────────────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        {reducedMotion ? (
          /* Reduced-motion: always visible, no animation */
          <QuickAddBar
            sizeValues={sizeValues}
            hasSwatches={hasSwatches}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            onAdd={handleAddClick}
          />
        ) : (
          <>
            {/* Touch devices (pointer:coarse): always visible, hidden on desktop */}
            <div className="pointer-fine:hidden">
              <QuickAddBar
                sizeValues={sizeValues}
                hasSwatches={hasSwatches}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
                onAdd={handleAddClick}
              />
            </div>

            {/* Desktop (pointer:fine): animated hover slide-up.
                The outer div reserves the exact height of the QuickAddBar
                (52px = py-2*2 + icon height) so non-hovered cards stay the
                same height as hovered cards and the grid never reflows. */}
            <div className="hidden pointer-fine:block" style={{ minHeight: "52px" }}>
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    key="quick-add-desktop"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ ease: WARM, duration: DUR.fast }}
                  >
                    <QuickAddBar
                      sizeValues={sizeValues}
                      hasSwatches={hasSwatches}
                      selectedSize={selectedSize}
                      onSizeChange={setSelectedSize}
                      onAdd={handleAddClick}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

// ── Quick-add bar — subtle glass surface with swatches + Add button ──────────
interface QuickAddBarProps {
  sizeValues: string[];
  hasSwatches: boolean;
  selectedSize: string;
  onSizeChange: (v: string) => void;
  onAdd: () => void;
}

function QuickAddBar({
  sizeValues,
  hasSwatches,
  selectedSize,
  onSizeChange,
  onAdd,
}: QuickAddBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2",
        // Subtle glass: cream/30 backdrop-blur-[4px] — matches glass README "subtle" variant
        "bg-[#F5ECDA]/30 backdrop-blur-[4px]",
        "border border-espresso/10",
      )}
    >
      {hasSwatches && (
        <VariantSwatch
          values={sizeValues}
          value={selectedSize}
          onChange={onSizeChange}
          className="flex-1 min-w-0"
        />
      )}
      <Button
        size="sm"
        variant="default"
        onClick={onAdd}
        className={cn(!hasSwatches && "flex-1", "shrink-0")}
        aria-label="Add to cart"
      >
        Add
      </Button>
    </div>
  );
}
