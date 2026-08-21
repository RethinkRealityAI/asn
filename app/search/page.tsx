/**
 * /search?q=... — global search results.
 *
 * Always builds from the FULL catalog (store.getProducts()), never a
 * collection-scoped subset — so results here are independent of whatever
 * page or category the visitor was previously browsing. The full FilterRail
 * (including the search box) is still available so results can be further
 * refined by category/price.
 *
 * Next.js 16: searchParams is a Promise.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { store } from "@/lib/shopify";
import { deriveCollections } from "@/lib/catalog/collections";
import { deriveFacets } from "@/lib/catalog/filters";
import { PLPClient } from "@/components/plp/PLPClient";

export async function generateMetadata(props: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await props.searchParams;
  return {
    title: q ? `“${q}” — Search results` : "Search",
    robots: { index: false }, // search result pages: no need to index
  };
}

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await props.searchParams;

  // Always the full catalog — a global search must never inherit a category
  // or collection scope from wherever the visitor came from.
  const allProducts = await store.getProducts();
  const collections = deriveCollections(allProducts);
  const facets = deriveFacets(allProducts, collections);

  const breadcrumb = (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs text-espresso/50">
        <li>
          <Link href="/" className="hover:text-espresso transition-colors">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-espresso/80 font-medium">
          Search
        </li>
      </ol>
    </nav>
  );

  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2rem)]">
      <PLPClient
        products={allProducts}
        collections={collections}
        facets={facets}
        initial={{ q }}
        title={q ? `Results for “${q}”` : "Search"}
        subtitle={q ? undefined : "Type a product name, ingredient, or category above."}
        breadcrumb={breadcrumb}
      />
    </div>
  );
}
