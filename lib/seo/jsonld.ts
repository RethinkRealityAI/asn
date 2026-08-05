/**
 * JSON-LD structured data builders for Shea Allnaturals.
 * Pure functions — no side effects, no React imports.
 * All schemas follow https://schema.org spec.
 */

import type { Product } from "@/lib/shopify/types";
import { SITE_URL, SITE_NAME, LEGAL_NAME } from "./site";

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
 * Schema.org Organization for Shea Allnaturals / All Naturals Cosmetics Inc.
 *
 * This is the entity record search and AI engines read to understand who the
 * business is, so it carries the real address, contact details, founding date
 * and social profiles rather than a stub.
 */
export function organizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    alternateName: ["All Naturals Cosmetics", "Shea All Naturals", "ANCI"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/brand/wordmark-horizontal.png`,
    },
    image: `${SITE_URL}/brand/wordmark-horizontal.png`,
    description:
      "Canadian manufacturer of natural and organic personal care — shea butter, argan oil, black soap and cold-pressed botanical oils. Founded 2002 in Barrie, Ontario. Also a private-label contract manufacturer operating under GMP and Health Canada regulations.",
    foundingDate: "2002",
    foundingLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: "Barrie", addressRegion: "ON", addressCountry: "CA" },
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "220 Bayview Dr. Unit #18",
      addressLocality: "Barrie",
      addressRegion: "ON",
      postalCode: "L4N 4Y8",
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: 44.3581283, longitude: -79.6837872 },
    telephone: "+1-705-719-2750",
    email: "allnaturals@allnaturalscosmetics.ca",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+1-705-719-2750",
        email: "allnaturals@allnaturalscosmetics.ca",
        areaServed: "CA",
        availableLanguage: "English",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        name: "Private label & contract manufacturing",
        email: "privatelabel@allnaturalscosmetics.ca",
        areaServed: "CA",
        availableLanguage: "English",
      },
    ],
    sameAs: [
      "https://www.instagram.com/allnaturalscosmetics/",
      "https://www.facebook.com/allnaturalscosmetics/",
      "https://www.youtube.com/channel/UC1aT0ORc_29IknBKscpqT7A",
      "https://twitter.com/allnaturallabel",
    ],
  };
}

/**
 * Schema.org WebSite — names the site as an entity and declares the search
 * endpoint, which is how engines (and AI assistants) learn they can query it.
 */
export function webSiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-CA",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Schema.org LocalBusiness — the Barrie studio, including pickup hours. Feeds
 * map/local results and "where can I buy this" style AI answers.
 */
export function localBusinessJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    url: SITE_URL,
    telephone: "+1-705-719-2750",
    email: "allnaturals@allnaturalscosmetics.ca",
    address: {
      "@type": "PostalAddress",
      streetAddress: "220 Bayview Dr. Unit #18",
      addressLocality: "Barrie",
      addressRegion: "ON",
      postalCode: "L4N 4Y8",
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: 44.3581283, longitude: -79.6837872 },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "16:00",
      },
    ],
    currenciesAccepted: "CAD",
    areaServed: { "@type": "Country", name: "Canada" },
  };
}
