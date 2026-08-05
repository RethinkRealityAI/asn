"use client";

/**
 * ProductCard — premium liquid-glass product card.
 *
 * - Squarer footprint: square image zone, compact info, one Add button.
 * - Surface: translucent liquid glass (white→faint-green) with an inner
 *   highlight, soft green hairline, and a layered float shadow; hover lifts it.
 * - Badge: solid green pill, white text.
 * - One clean clay "Add" button (no cream container, no inline swatches —
 *   size selection lives on the PDP).
 * - Entire card keyboard-navigable; image zoom on hover (reduced-motion safe).
 *
 * Never blue. Honors prefers-reduced-motion.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { Product } from "@/lib/shopify/types";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/useCart";
import { resolveCardCta } from "@/lib/catalog/card-cta";

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

// ── Badge derivation — solid pills, white text ───────────────────────────────
const GREEN = "bg-green text-white";
const BADGE_KEYWORDS: { keyword: string; label: string; classes: string }[] = [
  { keyword: "bestseller", label: "Bestseller", classes: GREEN },
  { keyword: "best seller", label: "Bestseller", classes: GREEN },
  { keyword: "new", label: "New", classes: "bg-clay text-white" },
  { keyword: "sale", label: "Sale", classes: "bg-orange text-white" },
  { keyword: "popular", label: "Popular", classes: GREEN },
  { keyword: "featured", label: "Featured", classes: GREEN },
  { keyword: "natural", label: "Natural", classes: GREEN },
  { keyword: "organic", label: "Organic", classes: GREEN },
];

function deriveBadge(tags: string[]): { label: string; classes: string } | null {
  const lower = tags.map((t) => t.toLowerCase());
  for (const { keyword, label, classes } of BADGE_KEYWORDS) {
    if (lower.some((t) => t.includes(keyword))) return { label, classes };
  }
  return null;
}

// ── Props ───────────────────────────────────────────────────────────────────
export interface ProductCardProps {
  product: Product;
  priority?: boolean;
  /** Override badge label + style; supersedes tag-derived badge. */
  badgeOverride?: { label: string; classes: string };
}

// ── Component ───────────────────────────────────────────────────────────────
export function ProductCard({ product, priority = false, badgeOverride }: ProductCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [hovered, setHovered] = useState(false);
  const { add, openCart } = useCart();

  const { priceRange, title, handle, images, productType, tags } = product;
  const badge = deriveBadge(tags) ?? badgeOverride ?? null;

  const minAmt = priceRange.min.amount;
  const maxAmt = priceRange.max.amount;
  const priceDisplay = minAmt === maxAmt ? formatMoney(minAmt) : `From ${formatMoney(minAmt)}`;

  const img = images[0];

  // Multi-variant products (e.g. bulk sizes: 8.8lbs / 25lbs / 50lbs) must not be
  // quick-added — the card advertises the cheapest size but variants[0] is often
  // the largest. Those route to the PDP to choose. See lib/catalog/card-cta.ts.
  const cta = resolveCardCta(product);

  function handleAdd() {
    if (cta?.kind !== "add") return;
    const variant = product.variants.find((v) => v.id === cta.variantId);
    if (variant) {
      add(product, variant, 1);
      openCart();
    }
  }

  const imageScale = !reducedMotion && hovered ? 1.05 : 1;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[var(--radius-card)] overflow-hidden",
        // glasscn liquid-glass surface — beveled inset edges + warm sheen + soft float.
        // (No backdrop-blur: over a flat white section it shows nothing but costs GPU.)
        "border border-white/70",
        "bg-white [background-image:radial-gradient(125%_80%_at_15%_4%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0)_55%),radial-gradient(120%_95%_at_88%_106%,rgba(235,165,44,0.16)_0%,rgba(255,255,255,0)_58%),linear-gradient(180deg,#ffffff_0%,#FBF6EE_100%)]",
        "[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.95),inset_0_-14px_30px_-12px_rgba(235,165,44,0.18),inset_1px_0_0_0_rgba(255,255,255,0.6),inset_-1px_0_0_0_rgba(255,255,255,0.5),0_20px_48px_-16px_rgba(42,30,20,0.22)]",
        "motion-safe:transition-[transform,box-shadow] motion-reduce:transition-shadow duration-300 ease-[--ease-warm]",
        !reducedMotion && "hover:-translate-y-1.5",
        "hover:[box-shadow:inset_0_1px_0_0_rgba(255,255,255,1),inset_0_-16px_34px_-12px_rgba(235,165,44,0.24),inset_1px_0_0_0_rgba(255,255,255,0.7),inset_-1px_0_0_0_rgba(255,255,255,0.6),0_30px_62px_-16px_rgba(42,30,20,0.3)]",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-marigold focus-within:ring-offset-2",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Badge — solid green pill ─────────────────────────────────────── */}
      {badge && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
              badge.classes
            )}
          >
            {badge.label}
          </span>
        </div>
      )}

      {/* ── Image — square, object-contain ───────────────────────────────── */}
      <Link
        href={`/products/${handle}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block w-full overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: imageScale }}
          transition={{ ease: WARM, duration: DUR.base }}
          style={{ transformOrigin: "center center" }}
        >
          {img ? (
            <Image
              src={img.url}
              alt={img.altText || title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-espresso/30 text-sm font-body">No image</span>
            </div>
          )}
        </motion.div>
      </Link>

      {/* ── Info ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 px-4 pt-3 pb-2">
        {productType && (
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-green">
            {productType}
          </p>
        )}
        <Link
          href={`/products/${handle}`}
          className={cn(
            "font-display text-base font-semibold text-espresso leading-snug",
            "line-clamp-2 hover:text-clay transition-colors duration-200",
            "outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1 rounded-sm",
            "[min-height:2.75rem]"
          )}
        >
          {title}
        </Link>
        <p className="mt-0.5 text-sm font-medium text-espresso">
          {priceDisplay}
          <span className="ml-1 text-xs font-normal text-espresso/40">CAD</span>
        </p>
      </div>

      {/* ── CTA — quick-add only when there's a single variant ───────────── */}
      <div className="mt-auto px-4 pb-4">
        {cta?.kind === "choose" ? (
          <Link
            href={`/products/${handle}`}
            aria-label={`Choose ${cta.optionLabel} for ${title}`}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold",
              "border border-clay text-clay bg-transparent",
              "transition-colors duration-200 hover:bg-clay hover:text-cream",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
            )}
          >
            Choose {cta.optionLabel}
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <button
            onClick={handleAdd}
            disabled={!cta}
            aria-label={`Add ${title} to cart`}
            className={cn(
              "w-full rounded-full bg-clay py-2.5 text-sm font-semibold text-cream",
              "transition-colors duration-200 hover:bg-orange",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
            )}
          >
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}
