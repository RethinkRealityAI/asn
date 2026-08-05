"use client";

/**
 * PLPClient — client wrapper for Product Listing Pages.
 *
 * Owns FilterState in local state (URL sync deferred to v2 — local state is
 * sufficient for v1). Passes `collections` as required 3rd arg to applyFilters
 * so category filtering works correctly.
 *
 * Layout: a single flex container, column on mobile / row on desktop.
 *   FilterRail is mounted EXACTLY ONCE — it already renders both its mobile
 *   trigger+sheet AND its desktop sticky sidebar internally (via its own
 *   `lg:hidden` / `hidden lg:flex` classes), so wrapping it in additional
 *   responsive divs here would double-mount it (two live `filters` controls,
 *   duplicate `aria-pressed` chips, duplicate `id="filter-sheet"` — a real
 *   bug fixed 2026-07-10). ProductGrid is likewise mounted once.
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
  /** Hide the filter rail entirely (e.g. wholesale, where facets don't apply). */
  hideFilters?: boolean;
  /** Hide the built-in PLP header (when the page supplies its own PageHeader). */
  hideHeader?: boolean;
  /** Collection pages: category chips navigate between collections instead of filtering. */
  categoryNav?: { activeHandle: string };
}

export function PLPClient({
  products,
  collections,
  facets,
  initial,
  title,
  subtitle,
  breadcrumb,
  hideFilters = false,
  hideHeader = false,
  categoryNav,
}: PLPClientProps) {
  const [filters, setFilters] = useState<FilterState>(initial ?? {});

  // Apply category + price + concern filters (sort is owned by ProductGrid)
  const filtered = useMemo(
    () => applyFilters(products, filters, collections),
    [products, filters, collections]
  );

  return (
    <>
      {/* Header renders with the live post-filter count (unless the page supplies its own) */}
      {!hideHeader && (
        <PLPHeader
          title={title}
          subtitle={subtitle}
          count={filtered.length}
          breadcrumb={breadcrumb}
        />
      )}

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {hideFilters ? (
          /* No filters (e.g. wholesale) — grid spans the full width */
          <ProductGrid products={filtered} className="w-full" />
        ) : (
          // Single mount: column on mobile (trigger above grid), row on desktop
          // (sticky sidebar beside grid) — FilterRail handles the breakpoint itself.
          <div className="flex flex-col gap-5 lg:flex-row lg:gap-8 lg:items-start">
            <FilterRail facets={facets} value={filters} onChange={setFilters} categoryNav={categoryNav} />
            <ProductGrid products={filtered} className="w-full lg:flex-1 lg:min-w-0" />
          </div>
        )}
      </div>
    </>
  );
}
