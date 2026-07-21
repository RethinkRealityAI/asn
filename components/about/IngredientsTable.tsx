"use client";

/**
 * IngredientsTable — the interactive, searchable common-name ↔ INCI index.
 *
 * Search matches either column; category chips narrow the list; a live count
 * shows how many of the full roster are visible. Renders as a clean two-column
 * table on desktop and stacked cards on mobile. White cards on white ground —
 * no glass over content — warm palette, AA contrast, reduced-motion safe.
 */

import { useMemo, useState, useId } from "react";
import {
  INGREDIENTS,
  INGREDIENT_CATEGORIES,
  type IngredientCategory,
} from "@/lib/content/ingredients-inci";
import { cn } from "@/lib/utils";

type Filter = IngredientCategory | "All";

export function IngredientsTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const searchId = useId();

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    return INGREDIENTS.filter((ing) => {
      if (filter !== "All" && ing.category !== filter) return false;
      if (!q) return true;
      return (
        ing.common.toLowerCase().includes(q) || ing.inci.toLowerCase().includes(q)
      );
    });
  }, [q, filter]);

  // Only offer category chips that exist in the data.
  const categories = useMemo<Filter[]>(
    () => ["All", ...INGREDIENT_CATEGORIES.filter((c) => INGREDIENTS.some((i) => i.category === c))],
    [],
  );

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-espresso/40"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <label htmlFor={searchId} className="sr-only">
            Search ingredients by common or INCI name
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a common name or INCI name…"
            className="w-full rounded-full border border-espresso/15 bg-white py-3.5 pl-12 pr-4 text-base text-espresso placeholder:text-espresso/40 outline-none transition-colors focus:border-marigold focus:ring-2 focus:ring-marigold/30"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(cat)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-green text-cream"
                    : "border border-espresso/12 bg-white text-espresso/65 hover:border-green/40 hover:text-espresso",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count / status */}
      <p aria-live="polite" className="mt-5 text-sm text-espresso/55">
        Showing <span className="font-semibold text-espresso">{results.length}</span> of{" "}
        {INGREDIENTS.length} ingredients
        {filter !== "All" && <> in <span className="font-medium text-green">{filter}</span></>}
        {q && <> matching “{query.trim()}”</>}
      </p>

      {/* Results */}
      {results.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-espresso/10 bg-[#FCFAF6] px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-espresso">No matches</p>
          <p className="mt-1.5 text-sm text-espresso/55">
            Try a different spelling, or{" "}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("All");
              }}
              className="font-semibold text-clay underline-offset-2 hover:underline"
            >
              clear the filters
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-3xl border border-espresso/10 sm:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FCFAF6] text-xs font-semibold uppercase tracking-wider text-espresso/55">
                  <th scope="col" className="w-[34%] px-6 py-3.5">Common name</th>
                  <th scope="col" className="px-6 py-3.5">INCI nomenclature</th>
                  <th scope="col" className="w-[1%] whitespace-nowrap px-6 py-3.5 text-right">Category</th>
                </tr>
              </thead>
              <tbody>
                {results.map((ing, i) => (
                  <tr
                    key={`${ing.common}-${ing.inci}-${i}`}
                    className="border-t border-espresso/08 transition-colors hover:bg-marigold/5"
                  >
                    <td className="px-6 py-3.5 align-top font-display text-[0.95rem] font-semibold text-espresso">
                      {ing.common}
                    </td>
                    <td className="px-6 py-3.5 align-top text-sm italic leading-relaxed text-espresso/70">
                      {ing.inci}
                    </td>
                    <td className="px-6 py-3.5 align-top text-right">
                      <span className="inline-block whitespace-nowrap rounded-full bg-green/10 px-2.5 py-1 text-[0.65rem] font-semibold text-green">
                        {ing.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-6 grid gap-3 sm:hidden">
            {results.map((ing, i) => (
              <li
                key={`${ing.common}-${ing.inci}-${i}`}
                className="rounded-2xl border border-espresso/10 bg-white p-4 shadow-[0_8px_20px_-14px_rgba(42,30,20,0.25)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-base font-semibold text-espresso">{ing.common}</p>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-green/10 px-2.5 py-1 text-[0.6rem] font-semibold text-green">
                    {ing.category}
                  </span>
                </div>
                <p className="mt-1.5 text-sm italic leading-relaxed text-espresso/70">{ing.inci}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
