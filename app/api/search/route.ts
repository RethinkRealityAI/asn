/**
 * GET /api/search?q=... — live-typing suggestions for the header search.
 *
 * Always searches the FULL catalog via store.getProducts() — never scoped by
 * whatever collection/category the visitor last clicked, so results here
 * can't inherit a stale filter from another page (the bug this route exists
 * to prevent). Returns a small, lightweight result set for a dropdown.
 */

import { NextResponse } from "next/server";
import { store } from "@/lib/shopify";
import { applyFilters } from "@/lib/catalog/filters";
import { toSearchHit } from "@/lib/catalog/search-hit";

const MAX_RESULTS = 6;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ hits: [] });
  }

  const allProducts = await store.getProducts();
  const matches = applyFilters(allProducts, { q });
  const hits = matches.slice(0, MAX_RESULTS).map(toSearchHit);

  return NextResponse.json({ hits, total: matches.length });
}
