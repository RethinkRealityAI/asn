/**
 * Every redirect must land on a page that exists.
 *
 * The legacy manifest's `proposed_route` column was written against a planned
 * information architecture that was never built. 22 rules pointed at /blog/*,
 * /account, /services/* and /wholesale/* routes with no page behind them, so
 * every one of those 301s delivered a visitor straight to a 404 — worse than
 * no redirect, because search engines follow it and index the dead end.
 *
 * This walks app/ for real routes and asserts every target resolves.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { REDIRECTS } from "@/lib/redirects/redirects.generated";
import { mockClient } from "@/lib/shopify/mock/adapter";
import { SITE_CHANGE_REDIRECTS } from "@/lib/redirects/site-changes";

const ROOT = path.resolve(__dirname, "..");

/** Collect every static route from app/ (page.tsx files, skipping dynamic segments). */
function staticRoutes(): Set<string> {
  const routes = new Set<string>();
  const walk = (dir: string, url: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        // Route groups (x) don't add a segment; dynamic [x] can't be enumerated here.
        if (entry.name.startsWith("[")) continue;
        const seg = entry.name.startsWith("(") ? "" : `/${entry.name}`;
        walk(path.join(dir, entry.name), url + seg);
      } else if (entry.name === "page.tsx") {
        routes.add(url === "" ? "/" : url);
      }
    }
  };
  walk(path.join(ROOT, "app"), "");
  return routes;
}

describe("redirect targets resolve to something real", () => {
  const routes = staticRoutes();

  it("finds the app's static routes", () => {
    expect(routes.has("/")).toBe(true);
    expect(routes.has("/shop")).toBe(true);
    expect(routes.has("/about/awards")).toBe(true);
    // The planned-but-never-built routes must still be absent, or this test
    // would pass for the wrong reason.
    expect(routes.has("/blog")).toBe(false);
    expect(routes.has("/account")).toBe(false);
  });

  it("never targets a static route that does not exist", async () => {
    // The mock catalog is a snapshot of the source CSV, so it still carries
    // the pre-rename handles. Any handle we deliberately renamed TO is a real
    // handle in Shopify even though the CSV has not caught up — derive that
    // set from the rename rules themselves so it stays self-maintaining.
    const renamedTo = new Set(
      Object.entries(SITE_CHANGE_REDIRECTS)
        .filter(([from, to]) => from.startsWith("/products/") && to.startsWith("/products/"))
        .map(([, to]) => to.slice("/products/".length))
    );

    const products = new Set([
      ...(await mockClient.getProducts()).map((p) => p.handle),
      ...renamedTo,
    ]);
    const collections = new Set([
      ...(await mockClient.getCollections()).map((c) => c.handle),
      // Renamed 2026-08; the CSV-seeded mock still derives the old handle.
      "hair-oils-balm",
    ]);

    const dead = Object.entries(REDIRECTS).filter(([, to]) => {
      if (to.startsWith("/products/")) return !products.has(to.slice("/products/".length));
      if (to.startsWith("/collections/")) return !collections.has(to.slice("/collections/".length));
      return !routes.has(to);
    });

    expect(dead).toEqual([]);
  });
});
