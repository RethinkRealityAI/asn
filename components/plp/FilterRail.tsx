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
import { motion, AnimatePresence } from "framer-motion";

import type { Facets, FilterState } from "@/lib/catalog/filters";
import { glassVariantStyles } from "@/lib/glass-variants";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterRailProps {
  facets: Facets;
  value: FilterState;
  onChange: (f: FilterState) => void;
}

// ── Chip component ────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}

function Chip({ label, count, selected, onClick }: ChipProps) {
  return (
    <button
      role="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "text-sm font-body transition-colors duration-150 ease-[--ease-warm]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1",
        selected
          ? // Selected: clay surface — warm + AA contrast
            "bg-clay/15 border border-clay/40 text-clay font-semibold"
          : // Unselected: cream ghost chip
            "bg-cream/60 border border-espresso/15 text-espresso/80 hover:border-marigold/40 hover:bg-marigold/08"
      )}
    >
      <span className="truncate max-w-[140px]">{label}</span>
      <span
        className={cn(
          "text-[11px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
          selected
            ? "bg-clay/20 text-clay"
            : "bg-espresso/08 text-espresso/50"
        )}
      >
        {count}
      </span>
    </button>
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
}

function FilterPanel({ facets, value, onChange, onClearAll }: FilterPanelProps) {
  const hasActive = !!(value.category || value.price || value.concern);

  return (
    <div className="flex flex-col gap-6">
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
        <section aria-label="Filter by category">
          <SectionHeading>Category</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {facets.categories.map((cat) => (
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
            ))}
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

export function FilterRail({ facets, value, onChange }: FilterRailProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount = [value.category, value.price, value.concern].filter(
    Boolean
  ).length;

  function handleClearAll() {
    onChange({ sort: value.sort }); // preserve sort, clear everything else
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
            "border border-espresso/20 bg-cream",
            "font-body text-sm font-medium text-espresso",
            "hover:bg-marigold/10 hover:border-marigold/30",
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
                glassVariantStyles.frosted,
                "rounded-r-[--radius-card]"
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
          "rounded-[var(--radius-card)] p-4",
          glassVariantStyles.subtle
        )}
      >
        <FilterPanel
          facets={facets}
          value={value}
          onChange={onChange}
          onClearAll={handleClearAll}
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
