"use client";

/**
 * FilterRail
 *
 * Desktop: sticky left sidebar with category / concern / price chip sections.
 * Mobile: a "Filters" button that opens a slide-over sheet.
 *
 * Props:
 *  - facets:   Derived facets (categories, priceBuckets, concerns)
 *  - value:    Current FilterState (category/price/concern — NOT sort, that's in ProductGrid)
 *  - onChange: Callback when the user changes a filter
 *
 * Selected chips: clay/marigold background.
 * Keyboard accessible: aria-pressed on each chip.
 * Never blue. Reduced-motion safe.
 * AA contrast: all text on glass surfaces meets 4.5:1 vs cream/espresso backgrounds.
 */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import type { Facets, FilterState } from "@/lib/catalog/filters";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterRailProps {
  facets: Facets;
  value: FilterState;
  onChange: (f: FilterState) => void;
  /**
   * When set, the Category section becomes NAVIGATION between collections
   * (chips are links to /collections/<handle>, the active one highlighted)
   * instead of an intersect-filter. Use on /collections/[handle] pages where
   * intersecting the current collection with another almost always yields
   * an empty result.
   */
  categoryNav?: { activeHandle: string };
}

// ── Chip component ────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  count: number;
  selected: boolean;
  onClick?: () => void;
  /** Render as a navigation link instead of a toggle button. */
  href?: string;
}

function Chip({ label, count, selected, onClick, href }: ChipProps) {
  const className = cn(
    // max-w-full + min-w-0 keep long labels inside the rail — never overflow
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full max-w-full",
    "text-sm font-body transition-colors duration-150 ease-[--ease-warm]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1",
    selected
      ? // Selected: green — natural-credentials colour, AA on white
        "bg-green/10 border border-green/50 text-green font-semibold"
      : // Unselected: clean white chip
        "bg-white border border-espresso/15 text-espresso/80 hover:border-green/40 hover:bg-green/05"
  );

  const inner = (
    <>
      <span className="truncate min-w-0">{label}</span>
      <span
        className={cn(
          "shrink-0 text-[11px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
          selected ? "bg-green/15 text-green" : "bg-espresso/08 text-espresso/50"
        )}
      >
        {count}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-current={selected ? "page" : undefined} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

// ── Search box ────────────────────────────────────────────────────────────────

function SearchBox({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  return (
    <div className="relative">
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40 pointer-events-none"
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        role="searchbox"
        aria-label="Search products"
        placeholder="Search products…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full pl-9 pr-3 py-2 rounded-xl",
          "bg-white border border-espresso/15",
          "font-body text-sm text-espresso placeholder:text-espresso/40",
          "hover:border-green/40 focus:border-green/60",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1",
          "transition-colors duration-150"
        )}
      />
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-marigold mb-2">
      {children}
    </h3>
  );
}

// ── Filter panel (shared between desktop rail + mobile drawer) ────────────────

interface FilterPanelProps {
  facets: Facets;
  value: FilterState;
  onChange: (f: FilterState) => void;
  onClearAll: () => void;
  categoryNav?: { activeHandle: string };
}

function FilterPanel({ facets, value, onChange, onClearAll, categoryNav }: FilterPanelProps) {
  const hasActive = !!(value.category || value.price || value.concern || value.q?.trim());

  return (
    <div className="flex flex-col gap-6">
      {/* ── Search ────────────────────────────────────────────────────── */}
      <SearchBox value={value.q ?? ""} onChange={(q) => onChange({ ...value, q })} />

      {/* Clear all */}
      {hasActive && (
        <button
          onClick={onClearAll}
          className={cn(
            "self-start text-xs font-semibold text-clay underline underline-offset-2",
            "hover:text-orange transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1 rounded-sm"
          )}
        >
          Clear all filters
        </button>
      )}

      {/* ── Category ──────────────────────────────────────────────────── */}
      {facets.categories.length > 0 && (
        <section aria-label={categoryNav ? "Browse collections" : "Filter by category"}>
          <SectionHeading>{categoryNav ? "Collections" : "Category"}</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {facets.categories.map((cat) =>
              categoryNav ? (
                // Navigation mode (collection pages): chips link between
                // collections — intersect-filtering another collection against
                // this page's products would almost always be empty.
                <Chip
                  key={cat.handle}
                  label={cat.title}
                  count={cat.count}
                  selected={categoryNav.activeHandle === cat.handle}
                  href={`/collections/${cat.handle}`}
                />
              ) : (
                <Chip
                  key={cat.handle}
                  label={cat.title}
                  count={cat.count}
                  selected={value.category === cat.handle}
                  onClick={() =>
                    onChange({
                      ...value,
                      category:
                        value.category === cat.handle ? undefined : cat.handle,
                    })
                  }
                />
              )
            )}
          </div>
        </section>
      )}

      {/* ── Concern ──────────────────────────────────────────────────── */}
      {facets.concerns.length > 0 && (
        <section aria-label="Filter by concern">
          <SectionHeading>Concern</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {facets.concerns.map((c) => (
              <Chip
                key={c.tag}
                label={c.tag}
                count={c.count}
                selected={value.concern === c.tag}
                onClick={() =>
                  onChange({
                    ...value,
                    concern: value.concern === c.tag ? undefined : c.tag,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Price ────────────────────────────────────────────────────── */}
      {facets.priceBuckets.length > 0 && (
        <section aria-label="Filter by price">
          <SectionHeading>Price</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {facets.priceBuckets
              .filter((b) => b.count > 0)
              .map((b) => (
                <Chip
                  key={b.id}
                  label={b.label}
                  count={b.count}
                  selected={value.price === b.id}
                  onClick={() =>
                    onChange({
                      ...value,
                      price: value.price === b.id ? undefined : b.id,
                    })
                  }
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FilterRail({ facets, value, onChange, categoryNav }: FilterRailProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount = [value.category, value.price, value.concern, value.q?.trim()].filter(
    Boolean
  ).length;

  function handleClearAll() {
    onChange({ sort: value.sort }); // preserve sort, clear everything else (incl. q)
  }

  // ── Mobile drawer (< lg) ─────────────────────────────────────────────────
  const mobileDrawer = (
    <>
      {/* Trigger button — only visible on mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          aria-controls="filter-sheet"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            "border border-espresso/20 bg-white shadow-sm",
            "font-body text-sm font-medium text-espresso",
            "hover:bg-green/05 hover:border-green/40",
            "transition-colors duration-200 ease-[--ease-warm]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
          )}
        >
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-clay text-cream text-[11px] font-semibold px-1.5 py-0.5 min-w-[20px] text-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Sheet overlay */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : DUR.fast }}
              className="fixed inset-0 z-40 bg-espresso/30 lg:hidden"
              onClick={() => setSheetOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-over panel */}
            <motion.aside
              key="sheet"
              id="filter-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                ease: WARM,
                duration: reducedMotion ? 0 : DUR.base,
              }}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw]",
                "flex flex-col lg:hidden",
                // Clean white sheet — cream glass read as bland tan on white pages
                "bg-white shadow-2xl border-r border-espresso/10",
                "rounded-r-[var(--radius-card)]"
              )}
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-espresso/10">
                <span className="font-display text-base font-semibold text-espresso">
                  Filters
                </span>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close filters"
                  className={cn(
                    "p-1.5 rounded-lg text-espresso/60 hover:text-espresso",
                    "hover:bg-espresso/08 transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
                  )}
                >
                  {/* × icon — no external icon library */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4L4 12M4 4l8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Sheet body */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <FilterPanel
                  facets={facets}
                  value={value}
                  onChange={onChange}
                  onClearAll={handleClearAll}
                  categoryNav={categoryNav}
                />
              </div>

              {/* Sheet footer: Done button */}
              <div className="px-5 py-4 border-t border-espresso/10">
                <button
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "w-full py-2.5 rounded-xl",
                    "bg-espresso text-cream font-body text-sm font-semibold",
                    "hover:bg-espresso/85 transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
                  )}
                >
                  Done
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  // ── Desktop sidebar (>= lg) ───────────────────────────────────────────────
  const desktopRail = (
    <aside
      className={cn(
        "hidden lg:flex flex-col gap-1",
        "sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto",
        "w-56 shrink-0",
        "pr-1" // breathing room from scrollbar
      )}
      aria-label="Product filters"
    >
      <div
        className={cn(
          // Clean white card — matches product cards; cream glass read as tan
          "rounded-[var(--radius-card)] p-4",
          "bg-white border border-espresso/10",
          "shadow-[0_2px_12px_rgba(42,30,20,0.06)]"
        )}
      >
        <FilterPanel
          facets={facets}
          value={value}
          onChange={onChange}
          onClearAll={handleClearAll}
          categoryNav={categoryNav}
        />
      </div>
    </aside>
  );

  return (
    <>
      {mobileDrawer}
      {desktopRail}
    </>
  );
}
