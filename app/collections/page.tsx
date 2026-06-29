/**
 * /collections — Collections index.
 *
 * Server Component. Each collection renders as a premium CategoryCard with a
 * representative product photo + frosted-glass label. Bulk & Wholesale is
 * listed separately. Botanical corner accents tie it to the site. Never blue.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { store } from "@/lib/shopify";
import { CategoryCard } from "@/components/plp/CategoryCard";
import { AccentCorners } from "@/components/motion/AccentCorners";
import type { AccentDecor } from "@/components/motion/AccentCorners";

export const metadata: Metadata = {
  title: "Collections — Shea Allnaturals",
  description:
    "Browse Shea Allnaturals collections — shea butter, argan oil, black soap, hair care, body care, and more. Handcrafted botanical skincare from Barrie, Ontario.",
};

const ACCENTS: AccentDecor[] = ["argan", "castor", "shea"];

export default async function CollectionsPage() {
  const allCollections = await store.getCollections();
  const allProducts = await store.getProducts();

  // handle → first image url
  const coverByHandle = new Map<string, string | undefined>(
    allProducts.map((p) => [p.handle, p.images[0]?.url])
  );
  const coverFor = (handles: string[]): string | null => {
    for (const h of handles) {
      const url = coverByHandle.get(h);
      if (url) return url;
    }
    return null;
  };

  const retail = allCollections.filter((c) => !/bulk|wholesale/i.test(c.handle));
  const bulk = allCollections.filter((c) => /bulk|wholesale/i.test(c.handle));

  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2rem)]">
      {/* Page header */}
      <header className="relative w-full overflow-hidden border-b border-espresso/08 bg-cream px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <AccentCorners corners={{ tl: "argan", br: "castor" }} size={150} opacity={0.1} />
        <div className="relative z-10 mx-auto flex max-w-screen-xl flex-col gap-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-espresso/50">
              <li><Link href="/" className="transition-colors hover:text-espresso">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-espresso/80">Collections</li>
            </ol>
          </nav>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-marigold">
            {retail.length} collection{retail.length !== 1 ? "s" : ""}
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-espresso sm:text-4xl lg:text-5xl">
            Shop by collection.
          </h1>
          <p className="max-w-2xl font-body text-base leading-relaxed text-espresso/65 sm:text-lg">
            From shea butter and argan oil to hair care, body care and more —
            find your ritual.
          </p>
        </div>
      </header>

      {/* Collections grid */}
      <main className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {retail.map((col, i) => (
            <li key={col.handle}>
              <CategoryCard
                href={`/collections/${col.handle}`}
                title={col.title}
                count={col.productHandles.length}
                cover={coverFor(col.productHandles)}
                accent={ACCENTS[i % ACCENTS.length]}
                priority={i < 4}
              />
            </li>
          ))}
        </ul>

        {/* Bulk & Wholesale */}
        {bulk.length > 0 && (
          <section className="mt-16 border-t border-espresso/10 pt-12">
            <h2 className="mb-6 font-display text-xl font-semibold text-espresso">Wholesale &amp; bulk</h2>
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {bulk.map((col, i) => (
                <li key={col.handle}>
                  <CategoryCard
                    href={`/collections/${col.handle}`}
                    title={col.title}
                    count={col.productHandles.length}
                    cover={coverFor(col.productHandles)}
                    accent={ACCENTS[i % ACCENTS.length]}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
