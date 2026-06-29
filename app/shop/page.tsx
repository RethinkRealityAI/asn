/**
 * /shop — All retail products PLP
 *
 * Server Component: fetches all products, derives collections,
 * builds the retail set (products NOT in the bulk-wholesale collection),
 * then hands off to PLPClient for filtering/sorting/pagination.
 *
 * "Bulk & Wholesale" products are excluded from the retail view.
 * Their collection handle derived by deriveCollections is "bulk-wholesale".
 *
 * Never blue. AA contrast.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { store } from "@/lib/shopify";
import { deriveCollections } from "@/lib/catalog/collections";
import { deriveFacets } from "@/lib/catalog/filters";
import { PLPClient } from "@/components/plp/PLPClient";
import { PageHeader } from "@/components/chrome/PageHeader";

export const metadata: Metadata = {
  title: "Shop — Shea Allnaturals",
  description:
    "Browse the full Shea Allnaturals retail range — pure botanical skincare, cold-pressed oils, shea butters, black soap, and more. Handcrafted in Barrie, Ontario.",
};

export default async function ShopPage() {
  // 1. Fetch all products + derive collections from them
  const allProducts = await store.getProducts();
  const collections = deriveCollections(allProducts);

  // 2. Identify the bulk-wholesale collection's handles (exclude from retail view)
  const bulkCol = collections.find((c) => /bulk|wholesale/i.test(c.handle));
  const bulkHandles = new Set(bulkCol?.productHandles ?? []);

  // 3. Retail = everything NOT in the bulk-wholesale bucket
  const retail = allProducts.filter((p) => !bulkHandles.has(p.handle));

  // 4. Derive facets scoped to the retail set
  const facets = deriveFacets(retail, collections);

  // 5. Breadcrumb
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
          Shop
        </li>
      </ol>
    </nav>
  );

  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2rem)]">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        eyebrow={`${retail.length} products`}
        title="Shop all"
        subtitle="Pure botanicals, cold-pressed oils and shea butter — made the old way, for skin that remembers."
        products={[
          { src: "/hero/cocoa.webp", alt: "Shea Allnaturals cocoa-shea butter", style: { position: "absolute", right: "12%", bottom: "-6%", width: "19%", maxWidth: "206px", zIndex: 1 } },
          { src: "/hero/castor.webp", alt: "Shea Allnaturals castor oil", style: { position: "absolute", right: "27%", bottom: "0%", width: "9%", maxWidth: "104px", zIndex: 2 } },
          { src: "/decor/argan.webp", alt: "", style: { position: "absolute", right: "30%", bottom: "-3%", width: "12%", maxWidth: "138px", zIndex: 0 } },
        ]}
      />
      <PLPClient
        products={retail}
        collections={collections}
        facets={facets}
        title="Shop all"
        subtitle="Pure botanicals, cold-pressed oils and shea butter — made the old way, for skin that remembers."
        breadcrumb={breadcrumb}
        hideHeader
      />
    </div>
  );
}
