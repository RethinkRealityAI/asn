/**
 * JSON-LD structured data builders for Shea Allnaturals.
 * Pure functions — no side effects, no React imports.
 * All schemas follow https://schema.org spec.
 */

import type { Product } from "@/lib/shopify/types";

const SITE_NAME = "Shea Allnaturals";
const SITE_URL = "https://asn-shea.netlify.app";

/** Strip HTML tags to get plain text for description fields. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Schema.org Product with AggregateOffer (multi-variant) or single Offer.
 * priceCurrency is always "CAD".
 */
export function productJsonLd(p: Product, url: string): object {
  const description = stripHtml(p.descriptionHtml);

  // Image URLs — use absolute URLs when possible
  const images = p.images.map((img) => {
    if (img.url.startsWith("http")) return img.url;
    return `${SITE_URL}${img.url}`;
  });

  const minPrice = p.priceRange.min.amount;
  const maxPrice = p.priceRange.max.amount;

  let offers: object;

  if (p.variants.length > 1 && minPrice !== maxPrice) {
    // Multiple price points → AggregateOffer
    offers = {
      "@type": "AggregateOffer",
      priceCurrency: "CAD",
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: p.variants.length,
      offers: p.variants.map((v) => ({
        "@type": "Offer",
        priceCurrency: "CAD",
        price: v.price.amount,
        availability: v.available
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url,
        sku: v.sku ?? undefined,
        name: v.title !== "Default Title" ? v.title : undefined,
      })),
    };
  } else {
    // Single variant (or all same price)
    const variant = p.variants[0];
    offers = {
      "@type": "Offer",
      priceCurrency: "CAD",
      price: minPrice,
      availability: variant?.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
      sku: variant?.sku ?? undefined,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: description || undefined,
    image: images,
    brand: {
      "@type": "Brand",
      name: p.vendor || SITE_NAME,
    },
    offers,
  };
}

/**
 * Schema.org BreadcrumbList.
 * items: ordered array from root → current page.
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Schema.org Organization for Shea Allnaturals.
 */
export function organizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "CA",
      availableLanguage: "English",
    },
    sameAs: [],
  };
}
