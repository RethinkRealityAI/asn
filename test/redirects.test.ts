import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseRedirects, resolveRedirect } from "@/lib/redirects/manifest";
import { buildRedirectMap } from "@/lib/redirects/build";
import { REDIRECTS } from "@/lib/redirects/redirects.generated";

const csv = fs.readFileSync(
  path.resolve(process.cwd(), "data/source/all_naturals_site_manifest.csv"),
  "utf-8"
);
const map = parseRedirects(csv);
// The full pipeline: manifest + site changes, chains flattened.
const built = buildRedirectMap(csv);

describe("parseRedirects — spot-check 5 known old URLs", () => {
  it("maps a product URL: /product/<slug>/ → /products/<slug>", () => {
    expect(map["/product/peppermint-essential-oil"]).toBe("/products/peppermint-essential-oil");
  });

  it("maps a product category: /product-category/<slug>/ → /collections/<slug>", () => {
    expect(map["/product-category/hair-care"]).toBe("/collections/hair-care");
  });

  it("maps a legacy page: /about_anc/ → /about", () => {
    expect(map["/about_anc"]).toBe("/about");
  });

  it("maps the account page: /my-account/ → /account", () => {
    expect(map["/my-account"]).toBe("/account");
  });

  it("maps a dated blog post: /YYYY/MM/DD/<slug>/ → /blog/<slug>", () => {
    expect(map["/2021/06/10/what-is-shea-butter"]).toBe("/blog/what-is-shea-butter");
  });
});

describe("parseRedirects — cleaning + exclusions", () => {
  it("strips parenthetical annotations from proposed_route", () => {
    // "/shop-2022" → "/shop  (301 → /shop)" → "/shop"
    expect(map["/shop-2022"]).toBe("/shop");
  });

  it("excludes identity redirects even when annotated (prevents 301 loops)", () => {
    // "/checkout/" → "/checkout  (Shopify-hosted checkout)" cleans to "/checkout" === from → dropped
    expect(map["/checkout"]).toBeUndefined();
  });

  it("excludes rows marked (internal / not migrated)", () => {
    expect(map["/product-tag/front_spec_may2022"]).toBeUndefined();
  });

  it("never redirects the site root", () => {
    expect(map["/"]).toBeUndefined();
    expect(map[""]).toBeUndefined();
  });

  it("does not create identity redirects (old === new)", () => {
    for (const [from, to] of Object.entries(map)) {
      expect(from).not.toBe(to);
    }
  });
});

describe("resolveRedirect", () => {
  it("resolves a request path with a trailing slash", () => {
    expect(resolveRedirect("/product/peppermint-essential-oil/", map)).toBe(
      "/products/peppermint-essential-oil"
    );
  });

  it("resolves a request path without a trailing slash", () => {
    expect(resolveRedirect("/about_anc", map)).toBe("/about");
  });

  it("returns null for an unmapped path", () => {
    expect(resolveRedirect("/something-new", map)).toBeNull();
  });

  it("returns null for the root path", () => {
    expect(resolveRedirect("/", map)).toBeNull();
  });
});

describe("public/_redirects (Netlify CDN redirects)", () => {
  const redirectsFile = fs.readFileSync(path.resolve(process.cwd(), "public/_redirects"), "utf-8");
  const lines = redirectsFile.split("\n").filter((l) => l.trim() && !l.startsWith("#"));

  it("contains every mapped redirect as a 301", () => {
    expect(lines.length).toBe(Object.keys(built).length);
    for (const [from, to] of Object.entries(built)) {
      expect(redirectsFile).toContain(`${from} ${to} 301`);
    }
  });

  it("spot-checks legacy URLs in Netlify format", () => {
    expect(lines).toContain("/product/peppermint-essential-oil /products/peppermint-essential-oil 301");
    expect(lines).toContain("/product-category/hair-care /collections/hair-care 301");
    expect(lines).toContain("/my-account /account 301");
  });
});

describe("generated redirect map (build-time source)", () => {
  it("is in sync with the build pipeline — run `npm run redirects` if this fails", () => {
    expect(REDIRECTS).toEqual(built);
  });

  it("resolves the same targets the proxy will use", () => {
    expect(resolveRedirect("/product/peppermint-essential-oil/", REDIRECTS)).toBe(
      "/products/peppermint-essential-oil"
    );
  });
});

// ── Redirect chains + site-change redirects ─────────────────────────────────

describe("redirect map has no chains", () => {
  it("never redirects to a path that is itself a redirect key", () => {
    const chained = Object.entries(REDIRECTS).filter(
      ([, to]) => REDIRECTS[to] !== undefined
    );
    // A chained 301 costs an extra round-trip and is discounted by search
    // engines. scripts/build-redirects.ts flattens these at generation time.
    expect(chained).toEqual([]);
  });

  it("never redirects a path to itself", () => {
    const selfRefs = Object.entries(REDIRECTS).filter(([from, to]) => from === to);
    expect(selfRefs).toEqual([]);
  });
});

describe("site-change redirects are present", () => {
  it("routes the retired and renamed URLs to live destinations", () => {
    expect(REDIRECTS["/collections/men-s-care"]).toBe("/shop");
    expect(REDIRECTS["/collections/hair-oils-lotions-sprays"]).toBe(
      "/collections/hair-oils-balm"
    );
    expect(REDIRECTS["/products/combo-12-body-oils"]).toBe(
      "/products/combo-1-simply-loving-oils"
    );
  });
});
