/**
 * /products/[handle] — Product Detail Page (PDP)
 *
 * Server Component. Async params (Next 16).
 * Handles: generateMetadata, generateStaticParams, JSON-LD injection.
 * Layout: breadcrumb → 2-col (StickyGallery | ProductInfo) → accordions → RelatedProducts.
 *
 * Never blue. AA. No Instagram embed (PRD §13).
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { store } from "@/lib/shopify";
import { deriveCollections } from "@/lib/catalog/collections";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { StickyGallery } from "@/components/pdp/StickyGallery";
import { ProductInfo } from "@/components/pdp/ProductInfo";
import { MotionAccordion } from "@/components/pdp/MotionAccordion";
import type { AccordionItem } from "@/components/pdp/MotionAccordion";
import { RelatedProducts } from "@/components/pdp/RelatedProducts";

import { SITE_URL as SITE_ORIGIN } from "@/lib/seo/site";

// ── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const products = await store.getProducts();
  return products.map((p) => ({ handle: p.handle }));
}

// ── Metadata ─────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { handle } = await props.params;
  const product = await store.getProduct(handle);
  if (!product) return {};

  const description =
    product.descriptionHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) || undefined;

  const ogImage = product.images[0]?.url;
  const isRelativeImg = ogImage && ogImage.startsWith("/");
  const ogImageUrl = ogImage
    ? isRelativeImg
      ? `${SITE_ORIGIN}${ogImage}`
      : ogImage
    : undefined;

  return {
    title: `${product.title}`,
    description,
    openGraph: {
      title: `${product.title} — Shea Allnaturals`,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: "website",
    },
  };
}

// ── Accordion content builder ─────────────────────────────────────────────────

/**
 * Builds the three PDP accordion sections.
 * "Ingredients & INCI" and "How to use" pull from descriptionHtml where possible.
 * "Shipping & returns" uses brand-standard copy.
 */
function buildAccordionItems(descriptionHtml: string): AccordionItem[] {
  // Check if descriptionHtml contains ingredient-like keywords
  const lowerDesc = descriptionHtml.toLowerCase();
  const hasIngredients =
    lowerDesc.includes("inci") ||
    lowerDesc.includes("ingredient") ||
    lowerDesc.includes("shea butter") ||
    lowerDesc.includes("butyrospermum") ||
    lowerDesc.includes("cocos nucifera");

  const ingredientsContent = hasIngredients
    ? descriptionHtml
    : "<p>Natural botanical ingredients. Free from parabens, sulphates, mineral oils, artificial dyes, and synthetic fragrances. Cruelty-free and vegan.</p>";

  const howToUseContent =
    lowerDesc.includes("how to") || lowerDesc.includes("apply") || lowerDesc.includes("use")
      ? descriptionHtml
      : "<p>Apply a small amount to clean, dry skin. Warm between palms and work in gentle circular motions. Use daily for best results. For hair: apply to damp hair from mid-shaft to ends.</p>";

  return [
    {
      id: "ingredients",
      title: "Ingredients & INCI",
      htmlContent: ingredientsContent,
    },
    {
      id: "how-to-use",
      title: "How to use",
      htmlContent: howToUseContent,
    },
    {
      id: "shipping",
      title: "Shipping & returns",
      content:
        "Ships from Barrie, Ontario within 2–4 business days. Canada: standard shipping from $12, express from $20 — the exact rate depends on parcel weight and destination and is calculated at checkout. Local pickup at our Barrie studio is free. 30-day returns on unopened, unused items in original packaging.",
    },
  ];
}

// ── Page component ────────────────────────────────────────────────────────────

export default async function ProductPage(props: PageProps) {
  const { handle } = await props.params;
  const product = await store.getProduct(handle);

  if (!product) notFound();

  // Find first collection this product belongs to (for breadcrumb + related)
  const allProducts = await store.getProducts();
  const collections = deriveCollections(allProducts);
  const productCollection = collections.find((c) =>
    c.productHandles.includes(handle)
  );

  // Canonical URL
  const canonicalUrl = `${SITE_ORIGIN}/products/${handle}`;

  // JSON-LD
  const productLd = productJsonLd(product, canonicalUrl);
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: `${SITE_ORIGIN}/` },
    ...(productCollection
      ? [
          {
            name: productCollection.title,
            url: `${SITE_ORIGIN}/collections/${productCollection.handle}`,
          },
        ]
      : [{ name: "Shop", url: `${SITE_ORIGIN}/shop` }]),
    { name: product.title, url: canonicalUrl },
  ]);

  // Accordion sections
  const accordionItems = buildAccordionItems(product.descriptionHtml);

  return (
    <>
      {/* ── JSON-LD structured data ────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* pt clears the fixed header (promo bar + nav row) — without it the
          breadcrumb renders underneath the wordmark. */}
      <div className="min-h-screen bg-white pt-[calc(3.5rem+2rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

          {/* ── Breadcrumb ─────────────────────────────────────────────── */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1.5 text-xs text-espresso/50">
              <li>
                <Link
                  href="/"
                  className="hover:text-espresso transition-colors duration-150"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>

              {productCollection ? (
                <>
                  <li>
                    <Link
                      href={`/collections/${productCollection.handle}`}
                      className="hover:text-espresso transition-colors duration-150"
                    >
                      {productCollection.title}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/shop"
                      className="hover:text-espresso transition-colors duration-150"
                    >
                      Shop
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                </>
              )}

              <li
                aria-current="page"
                className="text-espresso/80 font-medium truncate max-w-[200px] sm:max-w-none"
              >
                {product.title}
              </li>
            </ol>
          </nav>

          {/* ── 2-column: gallery | info ──────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Sticky gallery */}
            <StickyGallery images={product.images} title={product.title} />

            {/* Product info */}
            <div className="flex flex-col gap-8">
              <ProductInfo product={product} />

              {/* ── Accordions ──────────────────────────────────────────── */}
              <MotionAccordion items={accordionItems} />
            </div>
          </div>

          {/* ── Related products ──────────────────────────────────────── */}
          <RelatedProducts
            currentHandle={handle}
            collectionHandle={productCollection?.handle}
          />
        </div>
      </div>
    </>
  );
}
