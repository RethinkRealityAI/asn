/**
 * /collections/[handle] — Per-collection PLP
 *
 * Server Component with async params (Next.js 16 requirement).
 *
 * Strategy:
 *  1. await props.params to get the handle (Next 16 async params)
 *  2. Fetch collection via store.getCollection(handle) — notFound() if missing
 *  3. Build the product list with a single collection-scoped query
 *  4. Derive collections from all products (needed for category facet resolution)
 *  5. Derive facets scoped to this collection's products
 *  6. Render PLPClient
 *
 * generateStaticParams: pre-generates all collection routes at build time.
 * generateMetadata: per-collection title/description.
 *
 * Never blue. AA contrast.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { store } from "@/lib/shopify";
import { deriveCollections } from "@/lib/catalog/collections";
import { deriveFacets } from "@/lib/catalog/filters";
import { PLPClient } from "@/components/plp/PLPClient";

// ── Static params: pre-build all collection routes ────────────────────────────

export async function generateStaticParams() {
  const collections = await store.getCollections();
  return collections.map((c) => ({ handle: c.handle }));
}

// ── Per-collection metadata ───────────────────────────────────────────────────

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await props.params;
  const col = await store.getCollection(handle);

  if (!col) {
    return {
      title: "Collection not found",
    };
  }

  return {
    title: col.title,
    description: `Shop ${col.title} from Shea Allnaturals. Pure botanical skincare handcrafted in Barrie, Ontario.`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CollectionPage(props: {
  params: Promise<{ handle: string }>;
}) {
  // Next.js 16: params is a Promise
  const { handle } = await props.params;

  // Fetch the collection — 404 if it doesn't exist
  const col = await store.getCollection(handle);
  if (!col) notFound();

  // Fetch this collection's products in ONE query.
  //
  // This used to map over col.productHandles calling getProduct() per handle —
  // 48 round-trips for Bulk & Wholesale — and swallowed failures with
  // `.filter(p => p != null)`. Because these pages are statically generated,
  // any partial failure at build time baked a short or empty grid into the
  // deployed HTML, which is what surfaced as "no products match these filters".
  const [products, allProducts] = await Promise.all([
    store.getProducts({ collection: handle }),
    store.getProducts(),
  ]);

  // Derive all collections (needed so category filter can resolve productHandles)
  const collections = deriveCollections(allProducts);

  // Derive facets scoped to this collection's products
  const facets = deriveFacets(products, collections);

  // Breadcrumb
  const breadcrumb = (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs text-espresso/50">
        <li>
          <Link href="/" className="hover:text-espresso transition-colors">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/shop" className="hover:text-espresso transition-colors">
            Shop
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-espresso/80 font-medium">
          {col.title}
        </li>
      </ol>
    </nav>
  );

  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2rem)]">
      <PLPClient
        products={products}
        collections={collections}
        facets={facets}
        title={col.title}
        subtitle={`Explore our ${col.title} range — pure botanicals made the old way.`}
        breadcrumb={breadcrumb}
        hideFilters={/bulk|wholesale/i.test(handle)}
        categoryNav={{ activeHandle: handle }}
      />
    </div>
  );
}
