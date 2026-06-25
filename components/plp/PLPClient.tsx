"use client";

/**
 * PLPClient — client wrapper for Product Listing Pages.
 *
 * Owns FilterState in local state (URL sync deferred to v2 — local state is
 * sufficient for v1). Passes `collections` as required 3rd arg to applyFilters
 * so category filtering works correctly.
 *
 * Layout:
 *   Desktop (lg+): flex row — FilterRail sticky sidebar (224px) | ProductGrid (flex-1)
 *   Mobile: FilterRail renders its own slide-over trigger button; ProductGrid stacks below
 *
 * Note: FilterRail internally renders:
 *   - A trigger button (< lg) for the mobile slide-over sheet
 *   - A sticky sidebar (>= lg) for desktop
 *
 * We mount ONE FilterRail instance. The mobile trigger sits above the grid;
 * the desktop sidebar flows in the flex row. Both are controlled by the
 * same FilterRail component via its internal `lg:hidden` / `hidden lg:flex` classes.
 *
 * Never blue. Honors prefers-reduced-motion.
 */

import { useState, useMemo } from "react";

import type { Product, Collection } from "@/lib/shopify/types";
import type { Facets, FilterState } from "@/lib/catalog/filters";
import { applyFilters } from "@/lib/catalog/filters";
import { FilterRail } from "@/components/plp/FilterRail";
import { ProductGrid } from "@/components/plp/ProductGrid";
import { PLPHeader } from "@/components/plp/PLPHeader";

export interface PLPClientProps {
  /** Products to display (already scoped — retail-only or collection-scoped) */
  products: Product[];
  /** All derived collections — needed for category filter resolution */
  collections: Collection[];
  /** Pre-derived facets for this product set */
  facets: Facets;
  /** Initial filter state */
  initial?: FilterState;
  /** PLP header props */
  title: string;
  subtitle?: string;
  breadcrumb?: React.ReactNode;
}

export function PLPClient({
  products,
  collections,
  facets,
  initial,
  title,
  subtitle,
  breadcrumb,
}: PLPClientProps) {
  const [filters, setFilters] = useState<FilterState>(initial ?? {});

  // Apply category + price + concern filters (sort is owned by ProductGrid)
  const filtered = useMemo(
    () => applyFilters(products, filters, collections),
    [products, filters, collections]
  );

  return (
    <>
      {/* Header renders with the live post-filter count */}
      <PLPHeader
        title={title}
        subtitle={subtitle}
        count={filtered.length}
        breadcrumb={breadcrumb}
      />

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Mobile: filter trigger is visible < lg via FilterRail's own lg:hidden div.
            We pull it out of the flex row so it sits above the grid on mobile. */}
        <div className="mb-5 lg:hidden">
          {/* FilterRail renders only its mobile trigger button here (lg:hidden
              inside FilterRail means the desktop aside is suppressed) */}
          <FilterRail facets={facets} value={filters} onChange={setFilters} />
        </div>

        {/* Desktop: flex row — sidebar | grid */}
        <div className="hidden lg:flex gap-8 items-start">
          <FilterRail facets={facets} value={filters} onChange={setFilters} />
          <ProductGrid
            products={filtered}
            className="flex-1 min-w-0"
          />
        </div>

        {/* Mobile: just the grid (filter trigger is above) */}
        <div className="lg:hidden">
          <ProductGrid
            products={filtered}
            className="w-full"
          />
        </div>
      </div>
    </>
  );
}
