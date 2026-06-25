/**
 * RelatedProducts
 *
 * "Pairs well with" section — Server Component.
 * Fetches up to 4 products from the same collection, falling back to
 * 4 random retail products (excluding self and bulk).
 *
 * Renders via ProductCard. RevealText heading.
 * Never blue. AA.
 */

import { store } from "@/lib/shopify";
import { deriveCollections } from "@/lib/catalog/collections";
import { ProductCard } from "@/components/product/ProductCard";
import { RevealText } from "@/components/motion/RevealText";

interface RelatedProductsProps {
  currentHandle: string;
  collectionHandle?: string;
}

export async function RelatedProducts({
  currentHandle,
  collectionHandle,
}: RelatedProductsProps) {
  const allProducts = await store.getProducts();
  const collections = deriveCollections(allProducts);

  // Identify bulk handles to exclude
  const bulkCol = collections.find((c) => /bulk|wholesale/i.test(c.handle));
  const bulkHandles = new Set(bulkCol?.productHandles ?? []);

  let related = allProducts.filter(
    (p) => p.handle !== currentHandle && !bulkHandles.has(p.handle)
  );

  // Prefer products from the same collection
  if (collectionHandle) {
    const sameCol = collections.find((c) => c.handle === collectionHandle);
    if (sameCol) {
      const sameColHandles = new Set(sameCol.productHandles);
      const fromSameCol = related.filter(
        (p) => sameColHandles.has(p.handle)
      );
      if (fromSameCol.length >= 2) {
        related = fromSameCol;
      }
    }
  }

  // Take first 4
  const picks = related.slice(0, 4);

  if (picks.length === 0) return null;

  return (
    <section aria-label="Pairs well with" className="mt-16 md:mt-24">
      <RevealText
        as="h2"
        className="font-display text-2xl md:text-3xl font-bold text-espresso mb-8"
      >
        Pairs well with
      </RevealText>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {picks.map((product, i) => (
          <ProductCard key={product.handle} product={product} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
