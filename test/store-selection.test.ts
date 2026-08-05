import { describe, it, expect } from "vitest";
import { resolveStoreClient } from "@/lib/shopify/index";
import { mockClient } from "@/lib/shopify/mock/adapter";

describe("resolveStoreClient", () => {
  it("uses the mock adapter when no Storefront token is set", () => {
    const { client, source } = resolveStoreClient({});
    expect(source).toBe("mock");
    expect(client).toBe(mockClient);
  });

  it("uses the Storefront adapter when token + domain are both set", () => {
    const { source } = resolveStoreClient({
      SHOPIFY_STOREFRONT_TOKEN: "tok",
      SHOPIFY_STORE_DOMAIN: "shea-allnaturals.myshopify.com",
    });
    expect(source).toBe("storefront");
  });

  it("falls back to the mock when the token is set but the domain is missing", () => {
    const { source, client } = resolveStoreClient({ SHOPIFY_STOREFRONT_TOKEN: "tok" });
    expect(source).toBe("mock");
    expect(client).toBe(mockClient);
  });
});
