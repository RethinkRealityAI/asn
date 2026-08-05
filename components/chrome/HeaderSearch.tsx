"use client";

/**
 * HeaderSearch — the nav search icon's actual functionality.
 *
 * Click the icon → an inline search box drops down from the header with
 * live results (debounced fetch to /api/search, which always queries the
 * FULL catalog — never scoped to whatever category/collection the visitor
 * was last browsing). Enter or "View all results" navigates to /search?q=.
 * Escape or an outside click closes it.
 *
 * Never blue. Reduced-motion safe (no animation gate needed — this is a
 * simple show/hide, not a physics-driven motion).
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { SearchHit } from "@/lib/catalog/search-hit";
import { cn } from "@/lib/utils";

const cadFmt = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
  }, []);

  // Focus the input as soon as the box opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, closeSearch]);

  // Debounced live search — always hits the global (unscoped) API route.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setHits([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setHits(data.hits ?? []);
        setTotal(data.total ?? 0);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  function goToResults() {
    const q = query.trim();
    if (!q) return;
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      goToResults();
    } else if (e.key === "Escape") {
      closeSearch();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={open ? "Close search" : "Search products"}
        aria-expanded={open}
        onClick={() => (open ? closeSearch() : openSearch())}
        className={cn(
          "hidden sm:flex p-2 rounded-full",
          "text-espresso/70 hover:text-espresso hover:bg-espresso/8",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
          "transition-colors"
        )}
      >
        {open ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Search products"
          className={cn(
            "absolute right-0 top-full mt-2 w-[22rem] max-w-[90vw]",
            "rounded-2xl bg-white border border-espresso/10 shadow-2xl",
            "p-3 z-50"
          )}
        >
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40 pointer-events-none" width="14" height="14">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              role="searchbox"
              aria-label="Search products"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-xl",
                "bg-cream/40 border border-espresso/15",
                "font-body text-sm text-espresso placeholder:text-espresso/40",
                "focus:outline-none focus:border-green/60"
              )}
            />
          </div>

          {/* Results */}
          <div className="mt-2 max-h-96 overflow-y-auto">
            {loading && <p className="px-2 py-3 text-xs text-espresso/50">Searching…</p>}

            {!loading && query.trim() && hits.length === 0 && (
              <p className="px-2 py-3 text-xs text-espresso/50">No products match &ldquo;{query.trim()}&rdquo;.</p>
            )}

            {!loading &&
              hits.map((hit) => (
                <Link
                  key={hit.handle}
                  href={`/products/${hit.handle}`}
                  onClick={closeSearch}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-green/05 transition-colors"
                >
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-cream/60">
                    {hit.image && (
                      <Image src={hit.image} alt="" fill sizes="44px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-espresso">{hit.title}</p>
                    <p className="text-xs text-espresso/55">{cadFmt.format(hit.price)}</p>
                  </div>
                </Link>
              ))}

            {!loading && total > hits.length && (
              <button
                type="button"
                onClick={goToResults}
                className="mt-1 w-full rounded-xl py-2 text-center text-xs font-semibold text-green hover:bg-green/05 transition-colors"
              >
                View all {total} results →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
