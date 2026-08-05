import { describe, it, expect, vi } from "vitest";
import { createCartClient, type ShopifyCart } from "@/lib/shopify/storefront/cart";

// A realistic Storefront Cart node.
const SF_CART = {
  id: "gid://shopify/Cart/abc123",
  checkoutUrl: "https://shea-allnaturals.myshopify.com/cart/c/abc123",
  totalQuantity: 3,
  cost: { subtotalAmount: { amount: "49.50", currencyCode: "CAD" } },
  lines: {
    edges: [
      { node: { id: "gid://shopify/CartLine/1", quantity: 2, merchandise: { id: "gid://shopify/ProductVariant/1" } } },
      { node: { id: "gid://shopify/CartLine/2", quantity: 1, merchandise: { id: "gid://shopify/ProductVariant/2" } } },
    ],
  },
};

function stubFetch(body: unknown, opts: { ok?: boolean; status?: number } = {}) {
  return vi.fn(async () => ({
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    json: async () => body,
  })) as unknown as typeof fetch;
}

function bodyOf(fetchImpl: unknown) {
  const init = (fetchImpl as { mock: { calls: [string, RequestInit][] } }).mock.calls[0][1];
  return JSON.parse(init.body as string);
}

const CONFIG = { domain: "shea-allnaturals.myshopify.com", token: "t", apiVersion: "2025-01" };

describe("CartClient.create", () => {
  it("calls cartCreate and maps the cart incl. checkoutUrl", async () => {
    const fetchImpl = stubFetch({ data: { cartCreate: { cart: SF_CART, userErrors: [] } } });
    const client = createCartClient({ ...CONFIG, fetch: fetchImpl });

    const cart = await client.create([{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 2 }]);

    const parsed = bodyOf(fetchImpl);
    expect(parsed.query).toContain("cartCreate");
    expect(parsed.variables.input.lines).toEqual([{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 2 }]);

    expect(cart.id).toBe("gid://shopify/Cart/abc123");
    expect(cart.checkoutUrl).toBe("https://shea-allnaturals.myshopify.com/cart/c/abc123");
    expect(cart.subtotal).toEqual({ amount: 49.5, currencyCode: "CAD" });
    expect(cart.totalQuantity).toBe(3);
    expect(cart.lines).toEqual([
      { id: "gid://shopify/CartLine/1", variantId: "gid://shopify/ProductVariant/1", quantity: 2 },
      { id: "gid://shopify/CartLine/2", variantId: "gid://shopify/ProductVariant/2", quantity: 1 },
    ]);
  });

  it("creates an empty cart when no lines are given", async () => {
    const fetchImpl = stubFetch({ data: { cartCreate: { cart: SF_CART, userErrors: [] } } });
    const client = createCartClient({ ...CONFIG, fetch: fetchImpl });
    await client.create();
    expect(bodyOf(fetchImpl).variables.input.lines).toEqual([]);
  });
});

describe("CartClient.addLines", () => {
  it("calls cartLinesAdd with cartId + lines", async () => {
    const fetchImpl = stubFetch({ data: { cartLinesAdd: { cart: SF_CART, userErrors: [] } } });
    const client = createCartClient({ ...CONFIG, fetch: fetchImpl });

    await client.addLines("gid://shopify/Cart/abc123", [{ merchandiseId: "v3", quantity: 1 }]);

    const parsed = bodyOf(fetchImpl);
    expect(parsed.query).toContain("cartLinesAdd");
    expect(parsed.variables.cartId).toBe("gid://shopify/Cart/abc123");
    expect(parsed.variables.lines).toEqual([{ merchandiseId: "v3", quantity: 1 }]);
  });
});

describe("CartClient.updateLines", () => {
  it("calls cartLinesUpdate with cartId + line updates", async () => {
    const fetchImpl = stubFetch({ data: { cartLinesUpdate: { cart: SF_CART, userErrors: [] } } });
    const client = createCartClient({ ...CONFIG, fetch: fetchImpl });

    await client.updateLines("cartX", [{ id: "line1", quantity: 5 }]);

    const parsed = bodyOf(fetchImpl);
    expect(parsed.query).toContain("cartLinesUpdate");
    expect(parsed.variables.cartId).toBe("cartX");
    expect(parsed.variables.lines).toEqual([{ id: "line1", quantity: 5 }]);
  });
});

describe("CartClient.removeLines", () => {
  it("calls cartLinesRemove with cartId + lineIds", async () => {
    const fetchImpl = stubFetch({ data: { cartLinesRemove: { cart: SF_CART, userErrors: [] } } });
    const client = createCartClient({ ...CONFIG, fetch: fetchImpl });

    await client.removeLines("cartX", ["line1", "line2"]);

    const parsed = bodyOf(fetchImpl);
    expect(parsed.query).toContain("cartLinesRemove");
    expect(parsed.variables.cartId).toBe("cartX");
    expect(parsed.variables.lineIds).toEqual(["line1", "line2"]);
  });
});

describe("CartClient — Shopify userErrors", () => {
  it("throws when a mutation returns userErrors", async () => {
    const fetchImpl = stubFetch({
      data: { cartLinesAdd: { cart: null, userErrors: [{ field: ["lines"], message: "Invalid merchandise" }] } },
    });
    const client = createCartClient({ ...CONFIG, fetch: fetchImpl });
    await expect(client.addLines("cartX", [{ merchandiseId: "bad", quantity: 1 }])).rejects.toThrow(/Invalid merchandise/);
  });
});

describe("CartClient.addVariant — line merging", () => {
  const base: ShopifyCart = {
    id: "cartX",
    checkoutUrl: "https://x/checkout",
    totalQuantity: 0,
    subtotal: { amount: 0, currencyCode: "CAD" },
    lines: [],
  };

  it("adds a new line (cartLinesAdd) when the variant is not in the cart", async () => {
    const fetchImpl = stubFetch({ data: { cartLinesAdd: { cart: SF_CART, userErrors: [] } } });
    const client = createCartClient({ ...CONFIG, fetch: fetchImpl });

    await client.addVariant(base, "vNEW", 1);

    const parsed = bodyOf(fetchImpl);
    expect(parsed.query).toContain("cartLinesAdd");
    expect(parsed.variables.lines).toEqual([{ merchandiseId: "vNEW", quantity: 1 }]);
  });

  it("merges into the existing line (cartLinesUpdate, summed qty) when the variant is already present", async () => {
    const fetchImpl = stubFetch({ data: { cartLinesUpdate: { cart: SF_CART, userErrors: [] } } });
    const client = createCartClient({ ...CONFIG, fetch: fetchImpl });
    const cart: ShopifyCart = {
      ...base,
      totalQuantity: 2,
      lines: [{ id: "line-1", variantId: "vEXIST", quantity: 2 }],
    };

    await client.addVariant(cart, "vEXIST", 3);

    const parsed = bodyOf(fetchImpl);
    expect(parsed.query).toContain("cartLinesUpdate");
    expect(parsed.variables.lines).toEqual([{ id: "line-1", quantity: 5 }]);
  });
});
