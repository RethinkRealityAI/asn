"use client";

/**
 * ProductGrid
 *
 * Renders a responsive product grid with:
 *  - Sort <select> (Featured / Price ↑ / Price ↓ / A–Z) — client-only state
 *  - "Load more" pagination (12 per page) with motion reveal of new rows
 *  - Skeleton shimmer placeholders for the initial paint
 *  - Empty state when filtered to zero products
 *
 * Receives a `products` array (already filtered by category/price/concern from
 * the parent). Handles sort + pagination internally.
 *
 * Never blue. Honors prefers-reduced-motion.
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { Product } from "@/lib/shopify/types";
import { applyFilters } from "@/lib/catalog/filters";
import type { SortKey } from "@/lib/catalog/filters";
import { ProductCard } from "@/components/product/ProductCard";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured",  label: "Featured" },
  { value: "price-asc", label: "Price ↑"  },
  { value: "price-desc",label: "Price ↓"  },
  { value: "title",     label: "A – Z"    },
];

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className={cn(
        // White card surface + layered shadow to match ProductCard skeleton
        "rounded-[--radius-card] bg-white overflow-hidden",
        "shadow-[var(--shadow-card)]",
        "animate-pulse"
      )}
      aria-hidden="true"
    >
      {/* Image placeholder — 4:5 ratio */}
      <div className="w-full bg-espresso/08" style={{ paddingBottom: "125%" }} />
      {/* Text placeholders */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
        <div className="h-2 w-16 rounded bg-espresso/10" />
        <div className="h-4 w-3/4 rounded bg-espresso/10" />
        <div className="h-3 w-1/3 rounded bg-espresso/10 mt-1" />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-3 text-center">
      <p className="font-display text-xl text-espresso/60">
        No products match these filters.
      </p>
      <p className="text-sm text-espresso/40 font-body">
        Try adjusting or clearing your filters.
      </p>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ProductGridProps {
  /** Pre-filtered product list (category/price/concern already applied by parent) */
  products: Product[];
  /** Whether to show skeletons for initial paint — set true on first server render */
  loading?: boolean;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductGrid({
  products,
  loading = false,
  className,
}: ProductGridProps) {
  const reducedMotion = usePrefersReducedMotion();

  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);

  // Re-start pagination when the products input changes (new filter applied)
  useEffect(() => {
    setPage(1);
  }, [products]);

  // Sort the products
  const sorted = useMemo(
    () => applyFilters(products, { sort }),
    [products, sort]
  );

  // Slice to current page
  const visible = useMemo(() => sorted.slice(0, page * PAGE_SIZE), [sorted, page]);
  const hasMore = visible.length < sorted.length;
  const count = sorted.length;

  function handleLoadMore() {
    setPage((p) => p + 1);
  }

  // ── Skeleton initial render ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ── Toolbar: count + sort ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-espresso/60 font-body">
          {count === 0
            ? "No products"
            : `${count} product${count === 1 ? "" : "s"}`}
        </p>
        <label className="flex items-center gap-2 text-sm font-body text-espresso/70">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={cn(
              "rounded-lg border border-espresso/20 bg-cream px-3 py-1.5",
              "text-sm text-espresso font-body",
              "focus:outline-none focus:ring-2 focus:ring-marigold focus:ring-offset-1",
              "cursor-pointer"
            )}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {visible.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            visible.map((product, idx) => {
              const isFirstRow = idx < 4; // first row gets priority image loading
              const isNew = idx >= (page - 1) * PAGE_SIZE; // newly loaded items

              if (reducedMotion || !isNew) {
                return (
                  <ProductCard
                    key={product.handle}
                    product={product}
                    priority={isFirstRow}
                  />
                );
              }

              return (
                <motion.div
                  key={product.handle}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ease: WARM,
                    duration: DUR.fast,
                    delay: Math.min((idx % PAGE_SIZE) * 0.03, 0.24),
                  }}
                >
                  <ProductCard
                    product={product}
                    priority={isFirstRow}
                  />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── Load more ────────────────────────────────────────────────── */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            className={cn(
              "px-8 py-3 rounded-xl border border-espresso/20 bg-cream",
              "font-body text-sm font-medium text-espresso",
              "hover:bg-marigold/10 hover:border-marigold/40",
              "transition-colors duration-200 ease-[--ease-warm]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
            )}
          >
            Load more
            <span className="ml-2 text-espresso/40 text-xs">
              ({sorted.length - visible.length} remaining)
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
