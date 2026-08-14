import { describe, it, expect, vi } from "vitest";
import { createStorefrontClient } from "@/lib/shopify/storefront/adapter";

// ── A realistic Storefront API product node (what the GraphQL API returns) ──────
const SF_PRODUCT = {
  handle: "peppermint-essential-oil",
  title: "Peppermint Essential oil",
  descriptionHtml: "<p>Cooling peppermint.</p>",
  vendor: "Shea Allnaturals",
  productType: "Essential Oil",
  tags: ["oil", "peppermint"],
  options: [{ name: "Size", values: ["10ml", "30ml"] }],
  priceRange: {
    minVariantPrice: { amount: "12.50", currencyCode: "CAD" },
    maxVariantPrice: { amount: "24.00", currencyCode: "CAD" },
  },
  variants: {
    edges: [
      {
        node: {
          id: "gid://shopify/ProductVariant/1",
          title: "10ml",
          sku: "PEP-10",
          availableForSale: true,
          price: { amount: "12.50", currencyCode: "CAD" },
          compareAtPrice: { amount: "15.00", currencyCode: "CAD" },
          selectedOptions: [{ name: "Size", value: "10ml" }],
          weight: 250,
          weightUnit: "GRAMS",
        },
      },
      {
        node: {
          id: "gid://shopify/ProductVariant/2",
          title: "30ml",
          sku: null,
          availableForSale: false,
          price: { amount: "24.00", currencyCode: "CAD" },
          compareAtPrice: null,
          selectedOptions: [{ name: "Size", value: "30ml" }],
          weight: 25,
          weightUnit: "POUNDS",
        },
      },
    ],
  },
  images: {
    edges: [
      { node: { url: "https://cdn.shopify.com/pep.jpg", altText: "Peppermint", width: 800, height: 800 } },
      { node: { url: "https://cdn.shopify.com/pep2.jpg", altText: null, width: 800, height: 800 } },
    ],
  },
};

/** Build a fetch stub that resolves once with the given JSON body. */
function stubFetch(body: unknown, opts: { ok?: boolean; status?: number } = {}) {
  return vi.fn(async () => ({
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    json: async () => body,
  })) as unknown as typeof fetch;
}

const CONFIG = {
  domain: "shea-allnaturals.myshopify.com",
  token: "test-storefront-token",
  apiVersion: "2025-01",
};

describe("StorefrontClient.getProduct — request shape", () => {
  it("POSTs to the versioned Storefront GraphQL endpoint with the access-token header", async () => {
    const fetchImpl = stubFetch({ data: { product: SF_PRODUCT } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    await client.getProduct("peppermint-essential-oil");

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe("https://shea-allnaturals.myshopify.com/api/2025-01/graphql.json");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Shopify-Storefront-Access-Token"]).toBe("test-storefront-token");
    expect(headers["Content-Type"]).toBe("application/json");

    const parsed = JSON.parse(init.body as string);
    expect(parsed.variables).toEqual({ handle: "peppermint-essential-oil" });
    expect(parsed.query).toContain("product");
  });
});

describe("StorefrontClient.getProduct — response mapping", () => {
  it("maps a Storefront product into the domain Product shape", async () => {
    const fetchImpl = stubFetch({ data: { product: SF_PRODUCT } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const p = await client.getProduct("peppermint-essential-oil");

    expect(p).not.toBeNull();
    expect(p!.handle).toBe("peppermint-essential-oil");
    expect(p!.title).toBe("Peppermint Essential oil");
    expect(p!.descriptionHtml).toBe("<p>Cooling peppermint.</p>");
    expect(p!.vendor).toBe("Shea Allnaturals");
    expect(p!.productType).toBe("Essential Oil");
    expect(p!.tags).toEqual(["oil", "peppermint"]);
    expect(p!.options).toEqual([{ name: "Size", values: ["10ml", "30ml"] }]);
  });

  it("converts money amounts from string to number and keeps CAD", async () => {
    const fetchImpl = stubFetch({ data: { product: SF_PRODUCT } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const p = await client.getProduct("peppermint-essential-oil");

    expect(p!.variants[0].price).toEqual({ amount: 12.5, currencyCode: "CAD" });
    expect(typeof p!.variants[0].price.amount).toBe("number");
    expect(p!.variants[0].compareAtPrice).toEqual({ amount: 15, currencyCode: "CAD" });
    expect(p!.priceRange.min).toEqual({ amount: 12.5, currencyCode: "CAD" });
    expect(p!.priceRange.max).toEqual({ amount: 24, currencyCode: "CAD" });
  });

  it("maps variant availability, null sku, and null compareAtPrice", async () => {
    const fetchImpl = stubFetch({ data: { product: SF_PRODUCT } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const p = await client.getProduct("peppermint-essential-oil");

    expect(p!.variants[0].available).toBe(true);
    expect(p!.variants[1].available).toBe(false);
    expect(p!.variants[1].sku).toBeNull();
    expect(p!.variants[1].compareAtPrice).toBeNull();
    expect(p!.variants[0].selectedOptions).toEqual([{ name: "Size", value: "10ml" }]);
  });

  it("normalises variant weight to grams whatever unit Shopify reports", async () => {
    const fetchImpl = stubFetch({ data: { product: SF_PRODUCT } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const p = await client.getProduct("peppermint-essential-oil");
    expect(p!.variants[0].weightGrams).toBe(250); // already grams
    expect(p!.variants[1].weightGrams).toBe(11340); // 25 lb → 11.34 kg
  });

  it("flattens image edges and falls back to the product title for missing altText", async () => {
    const fetchImpl = stubFetch({ data: { product: SF_PRODUCT } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const p = await client.getProduct("peppermint-essential-oil");

    expect(p!.images).toHaveLength(2);
    expect(p!.images[0]).toEqual({
      url: "https://cdn.shopify.com/pep.jpg",
      altText: "Peppermint",
      width: 800,
      height: 800,
    });
    expect(p!.images[1].altText).toBe("Peppermint Essential oil");
  });
});

describe("StorefrontClient.getProduct — edge cases", () => {
  it("returns null when the product does not exist", async () => {
    const fetchImpl = stubFetch({ data: { product: null } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });
    expect(await client.getProduct("nope")).toBeNull();
  });

  it("throws when the API returns GraphQL errors", async () => {
    const fetchImpl = stubFetch({ errors: [{ message: "Throttled" }] });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });
    await expect(client.getProduct("x")).rejects.toThrow(/Throttled/);
  });

  it("throws on a non-2xx HTTP response", async () => {
    const fetchImpl = stubFetch({}, { ok: false, status: 401 });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });
    await expect(client.getProduct("x")).rejects.toThrow(/401/);
  });
});

function bodyOf(fetchImpl: unknown) {
  const init = (fetchImpl as { mock: { calls: [string, RequestInit][] } }).mock.calls[0][1];
  return JSON.parse(init.body as string);
}

describe("StorefrontClient.getProducts", () => {
  it("queries products(first:) with the limit and maps the nodes", async () => {
    const fetchImpl = stubFetch({
      data: { products: { edges: [{ node: SF_PRODUCT }], pageInfo: { hasNextPage: false, endCursor: null } } },
    });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const list = await client.getProducts({ limit: 5 });

    const parsed = bodyOf(fetchImpl);
    expect(parsed.variables.first).toBe(5);
    expect(parsed.query).toContain("products");
    expect(list).toHaveLength(1);
    expect(list[0].handle).toBe("peppermint-essential-oil");
    expect(list[0].variants[0].price.amount).toBe(12.5);
  });

  it("queries collection(handle:).products when a collection is given", async () => {
    const fetchImpl = stubFetch({
      data: { collection: { products: { edges: [{ node: SF_PRODUCT }], pageInfo: { hasNextPage: false, endCursor: null } } } },
    });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const list = await client.getProducts({ collection: "essential-oils", limit: 3 });

    const parsed = bodyOf(fetchImpl);
    expect(parsed.variables.handle).toBe("essential-oils");
    expect(parsed.variables.first).toBe(3);
    expect(parsed.query).toContain("collection");
    expect(list).toHaveLength(1);
    expect(list[0].handle).toBe("peppermint-essential-oil");
  });

  it("forwards the pagination cursor as `after`", async () => {
    const fetchImpl = stubFetch({
      data: { products: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } } },
    });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    await client.getProducts({ cursor: "abc123" });

    expect(bodyOf(fetchImpl).variables.after).toBe("abc123");
  });

  it("returns [] when the collection does not exist", async () => {
    const fetchImpl = stubFetch({ data: { collection: null } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });
    expect(await client.getProducts({ collection: "nope" })).toEqual([]);
  });
});

describe("StorefrontClient.getCollections", () => {
  it("excludes Shopify's built-in 'frontpage' collection", async () => {
    const fetchImpl = stubFetch({
      data: {
        collections: {
          edges: [
            { node: { handle: "frontpage", title: "Home page", products: { edges: [{ node: { handle: "x" } }] } } },
            { node: { handle: "scrubs", title: "Scrubs", products: { edges: [{ node: { handle: "y" } }] } } },
          ],
        },
      },
    });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });
    const cols = await client.getCollections();
    expect(cols.map((c) => c.handle)).toEqual(["scrubs"]);
  });

  it("maps collections with their product handles", async () => {
    const fetchImpl = stubFetch({
      data: {
        collections: {
          edges: [
            {
              node: {
                handle: "essential-oils",
                title: "Essential Oils",
                products: { edges: [{ node: { handle: "peppermint-essential-oil" } }, { node: { handle: "lavender-oil" } }] },
              },
            },
          ],
        },
      },
    });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const cols = await client.getCollections();

    expect(cols).toHaveLength(1);
    expect(cols[0]).toEqual({
      handle: "essential-oils",
      title: "Essential Oils",
      productHandles: ["peppermint-essential-oil", "lavender-oil"],
    });
  });
});

describe("StorefrontClient — local image overlay", () => {
  it("replaces product images with curated local /media images when the index has the handle", async () => {
    const fetchImpl = stubFetch({ data: { product: SF_PRODUCT } });
    const client = createStorefrontClient({
      ...CONFIG,
      fetch: fetchImpl,
      localImages: { "peppermint-essential-oil": ["/media/peppermint-essential-oil/01.webp", "/media/peppermint-essential-oil/02.webp"] },
    });

    const p = await client.getProduct("peppermint-essential-oil");

    expect(p!.images).toEqual([
      { url: "/media/peppermint-essential-oil/01.webp", altText: "Peppermint Essential oil" },
      { url: "/media/peppermint-essential-oil/02.webp", altText: "Peppermint Essential oil" },
    ]);
  });

  it("keeps Shopify CDN images when the handle is not in the index", async () => {
    const fetchImpl = stubFetch({ data: { product: SF_PRODUCT } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl, localImages: {} });
    const p = await client.getProduct("peppermint-essential-oil");
    expect(p!.images[0].url).toBe("https://cdn.shopify.com/pep.jpg");
  });

  it("overlays list results too", async () => {
    const fetchImpl = stubFetch({
      data: { products: { edges: [{ node: SF_PRODUCT }], pageInfo: { hasNextPage: false, endCursor: null } } },
    });
    const client = createStorefrontClient({
      ...CONFIG,
      fetch: fetchImpl,
      localImages: { "peppermint-essential-oil": ["/media/peppermint-essential-oil/01.webp"] },
    });
    const list = await client.getProducts({ limit: 1 });
    expect(list[0].images[0].url).toBe("/media/peppermint-essential-oil/01.webp");
  });
});

describe("StorefrontClient.getCollection", () => {
  it("maps a single collection by handle", async () => {
    const fetchImpl = stubFetch({
      data: {
        collection: {
          handle: "essential-oils",
          title: "Essential Oils",
          products: { edges: [{ node: { handle: "peppermint-essential-oil" } }] },
        },
      },
    });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });

    const col = await client.getCollection("essential-oils");

    expect(col).toEqual({
      handle: "essential-oils",
      title: "Essential Oils",
      productHandles: ["peppermint-essential-oil"],
    });
    expect(bodyOf(fetchImpl).variables.handle).toBe("essential-oils");
  });

  it("returns null when the collection does not exist", async () => {
    const fetchImpl = stubFetch({ data: { collection: null } });
    const client = createStorefrontClient({ ...CONFIG, fetch: fetchImpl });
    expect(await client.getCollection("nope")).toBeNull();
  });
});
