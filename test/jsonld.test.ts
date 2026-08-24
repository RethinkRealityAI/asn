import { describe, it, expect } from "vitest";
import { productJsonLd, breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo/jsonld";
import type { Product } from "@/lib/shopify/types";

// ── Minimal product fixture ───────────────────────────────────────────────────
const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  handle: "shea-butter-250ml",
  title: "100% Pure Shea Butter",
  descriptionHtml: "<p>Pure shea butter handcrafted in Barrie, Ontario.</p>",
  vendor: "Shea Allnaturals",
  productType: "Butters & Moisturizers",
  tags: ["bestseller"],
  options: [{ name: "Size", values: ["250ml", "500ml"] }],
  variants: [
    {
      id: "v1",
      title: "250ml",
      sku: "SB-250",
      price: { amount: 14.99, currencyCode: "CAD" },
      compareAtPrice: { amount: 18.99, currencyCode: "CAD" },
      available: true,
      selectedOptions: [{ name: "Size", value: "250ml" }],
      weightGrams: 250,
    },
    {
      id: "v2",
      title: "500ml",
      sku: "SB-500",
      price: { amount: 24.99, currencyCode: "CAD" },
      compareAtPrice: null,
      available: true,
      selectedOptions: [{ name: "Size", value: "500ml" }],
      weightGrams: 250,
    },
  ],
  images: [
    { url: "/media/shea-butter-250ml/01.webp", altText: "Shea Butter" },
    { url: "/media/shea-butter-250ml/02.webp", altText: "Shea Butter 2" },
  ],
  priceRange: {
    min: { amount: 14.99, currencyCode: "CAD" },
    max: { amount: 24.99, currencyCode: "CAD" },
  },
  ...overrides,
});

const SITE_URL = "https://www.allnaturalscosmetics.com";

// ── productJsonLd ─────────────────────────────────────────────────────────────
describe("productJsonLd", () => {
  it("has @context and @type Product", () => {
    const ld = productJsonLd(makeProduct(), `${SITE_URL}/products/shea-butter-250ml`) as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Product");
  });

  it("includes a non-empty name", () => {
    const ld = productJsonLd(makeProduct(), `${SITE_URL}/products/shea-butter-250ml`) as Record<string, unknown>;
    expect(typeof ld["name"]).toBe("string");
    expect((ld["name"] as string).length).toBeGreaterThan(0);
  });

  it("includes at least one image URL", () => {
    const ld = productJsonLd(makeProduct(), `${SITE_URL}/products/shea-butter-250ml`) as Record<string, unknown>;
    const images = ld["image"] as string[];
    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBeGreaterThan(0);
  });

  it("has offers with priceCurrency CAD", () => {
    const ld = productJsonLd(makeProduct(), `${SITE_URL}/products/shea-butter-250ml`) as Record<string, unknown>;
    const offers = ld["offers"] as Record<string, unknown>;
    expect(offers).toBeDefined();
    expect(offers["priceCurrency"]).toBe("CAD");
  });

  it("has a numeric price matching the product min price", () => {
    const product = makeProduct();
    const ld = productJsonLd(product, `${SITE_URL}/products/shea-butter-250ml`) as Record<string, unknown>;
    const offers = ld["offers"] as Record<string, unknown>;
    // AggregateOffer uses lowPrice; Offer uses price
    const price = (offers["lowPrice"] ?? offers["price"]) as number;
    expect(typeof price).toBe("number");
    expect(price).toBe(product.priceRange.min.amount);
  });

  it("includes a description", () => {
    const ld = productJsonLd(makeProduct(), `${SITE_URL}/products/shea-butter-250ml`) as Record<string, unknown>;
    expect(typeof ld["description"]).toBe("string");
    expect((ld["description"] as string).length).toBeGreaterThan(0);
  });

  it("includes a brand object", () => {
    const ld = productJsonLd(makeProduct(), `${SITE_URL}/products/shea-butter-250ml`) as Record<string, unknown>;
    expect(ld["brand"]).toBeDefined();
  });

  it("works for a single-variant product with no compareAtPrice", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          title: "Default Title",
          sku: null,
          price: { amount: 9.99, currencyCode: "CAD" },
          compareAtPrice: null,
          available: true,
          selectedOptions: [],
          weightGrams: 250,
        },
      ],
      priceRange: {
        min: { amount: 9.99, currencyCode: "CAD" },
        max: { amount: 9.99, currencyCode: "CAD" },
      },
    });
    const ld = productJsonLd(product, `${SITE_URL}/products/shea-butter-250ml`) as Record<string, unknown>;
    expect(ld["offers"]).toBeDefined();
  });
});

// ── breadcrumbJsonLd ──────────────────────────────────────────────────────────
describe("breadcrumbJsonLd", () => {
  it("has @context and @type BreadcrumbList", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Butters & Moisturizers", url: `${SITE_URL}/collections/butters-moisturizers` },
      { name: "100% Pure Shea Butter", url: `${SITE_URL}/products/shea-butter-250ml` },
    ]) as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("BreadcrumbList");
  });

  it("has ordered itemListElement with correct positions", () => {
    const items = [
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Shop", url: `${SITE_URL}/shop` },
      { name: "Product", url: `${SITE_URL}/products/p` },
    ];
    const ld = breadcrumbJsonLd(items) as Record<string, unknown>;
    const elements = ld["itemListElement"] as Array<Record<string, unknown>>;
    expect(Array.isArray(elements)).toBe(true);
    expect(elements.length).toBe(3);
    elements.forEach((el, i) => {
      expect(el["position"]).toBe(i + 1);
      expect(el["name"]).toBe(items[i].name);
    });
  });
});

// ── organizationJsonLd ────────────────────────────────────────────────────────
describe("organizationJsonLd", () => {
  it("has @context and @type Organization", () => {
    const ld = organizationJsonLd() as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Organization");
  });

  it("has name 'Shea Allnaturals'", () => {
    const ld = organizationJsonLd() as Record<string, unknown>;
    expect(ld["name"]).toBe("Shea Allnaturals");
  });

  it("has a url field", () => {
    const ld = organizationJsonLd() as Record<string, unknown>;
    expect(typeof ld["url"]).toBe("string");
  });
});
