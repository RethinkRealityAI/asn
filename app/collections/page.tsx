/**
 * /collections — Collections index.
 *
 * Server Component. Each collection renders as a premium CategoryCard with a
 * representative product photo + frosted-glass label. Bulk & Wholesale is
 * listed separately. Botanical corner accents tie it to the site. Never blue.
 */

import type { Metadata } from "next";

import { store } from "@/lib/shopify";
import { CategoryCard } from "@/components/plp/CategoryCard";
import { PageHeader } from "@/components/chrome/PageHeader";
import type { AccentDecor } from "@/components/motion/AccentCorners";

export const metadata: Metadata = {
  title: "Collections",
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
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Collections" }]}
        eyebrow={`${retail.length} collection${retail.length !== 1 ? "s" : ""}`}
        title="Shop by collection."
        subtitle="From shea butter and argan oil to hair care, body care and more — find your ritual."
        products={[
          { src: "/hero/shea-butter.webp", alt: "Shea Allnaturals shea butter", style: { position: "absolute", right: "12%", bottom: "-6%", width: "20%", maxWidth: "220px", zIndex: 2 } },
          { src: "/hero/argan.webp", alt: "Shea Allnaturals argan oil", style: { position: "absolute", right: "27%", bottom: "0%", width: "9%", maxWidth: "104px", zIndex: 1 } },
          { src: "/decor/shea-nuts.webp", alt: "", style: { position: "absolute", right: "31%", bottom: "-3%", width: "11%", maxWidth: "120px", zIndex: 0 } },
        ]}
      />

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
