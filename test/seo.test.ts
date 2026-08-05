/**
 * SEO / crawlability tests.
 *
 * The live domain, the sitemap and the AI-crawler allowances are launch-critical
 * and easy to break silently, so they're guarded here: a wrong origin would emit
 * bad canonicals across 150+ pages, and a dropped crawler rule would quietly cost
 * AI-search visibility.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { SITE_URL, IS_PRODUCTION_SITE, absoluteUrl, SITE_NAME } from "@/lib/seo/site";
import { organizationJsonLd, webSiteJsonLd, localBusinessJsonLd } from "@/lib/seo/jsonld";
import sitemap from "@/app/sitemap";

const ROOT = path.resolve(__dirname, "..");

describe("site origin", () => {
  it("points at the real brand domain over https, with no trailing slash", () => {
    expect(SITE_URL).toBe("https://allnaturalscosmetics.com");
    expect(SITE_URL.endsWith("/")).toBe(false);
    expect(IS_PRODUCTION_SITE).toBe(true);
  });

  it("no netlify.app origin is hardcoded anywhere in app/ or lib/", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (/\.tsx?$/.test(entry.name)) {
          if (/https:\/\/[a-z0-9-]*\.netlify\.app/i.test(fs.readFileSync(p, "utf8"))) {
            offenders.push(path.relative(ROOT, p));
          }
        }
      }
    };
    walk(path.join(ROOT, "app"));
    walk(path.join(ROOT, "lib"));
    expect(offenders).toEqual([]);
  });

  it("absoluteUrl builds well-formed absolute URLs", () => {
    expect(absoluteUrl("/shop")).toBe(`${SITE_URL}/shop`);
    expect(absoluteUrl("shop")).toBe(`${SITE_URL}/shop`);
  });
});

describe("sitemap", () => {
  it("includes every key surface and all catalogue pages", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    // Catalogue is 113 products + 22 collections + static/about pages.
    expect(urls.length).toBeGreaterThan(140);

    for (const p of ["/", "/shop", "/collections", "/about", "/private-label", "/about/our-ingredients"]) {
      expect(urls).toContain(`${SITE_URL}${p}`);
    }
    expect(urls.some((u) => u.startsWith(`${SITE_URL}/products/`))).toBe(true);
    expect(urls.some((u) => u.startsWith(`${SITE_URL}/collections/`))).toBe(true);
  });

  it("every entry is absolute, on the canonical origin, and unique", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    for (const u of urls) expect(u.startsWith(`${SITE_URL}/`)).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("does not advertise private or stateful routes", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    for (const bad of ["/cart", "/api"]) {
      expect(urls.some((u) => u === `${SITE_URL}${bad}`)).toBe(false);
    }
  });
});

describe("robots — AI crawler access", () => {
  const src = fs.readFileSync(path.join(ROOT, "app", "robots.ts"), "utf8");

  it("explicitly names the major AI/answer-engine crawlers", () => {
    for (const bot of [
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "ClaudeBot",
      "PerplexityBot",
      "Google-Extended",
      "Applebot-Extended",
      "CCBot",
    ]) {
      expect(src).toContain(bot);
    }
  });

  it("publishes the sitemap and blocks non-production origins", () => {
    expect(src).toContain("sitemap");
    expect(src).toContain("IS_PRODUCTION_SITE");
  });
});

describe("structured data", () => {
  it("Organization carries real identity and contact facts", () => {
    const org = organizationJsonLd() as Record<string, unknown>;
    expect(org["@type"]).toBe("Organization");
    expect(org.url).toBe(SITE_URL);
    expect(org.name).toBe(SITE_NAME);
    expect(org.foundingDate).toBe("2002");
    expect(JSON.stringify(org)).toContain("Barrie");
    expect((org.sameAs as string[]).length).toBeGreaterThan(0);
  });

  it("Organization logo points at an asset that exists", () => {
    const org = JSON.stringify(organizationJsonLd());
    const match = org.match(new RegExp(`${SITE_URL}(/[^"]+\\.(?:png|webp|jpg|svg))`));
    expect(match).not.toBeNull();
    expect(fs.existsSync(path.join(ROOT, "public", match![1]))).toBe(true);
  });

  it("WebSite declares a search action", () => {
    const site = webSiteJsonLd() as Record<string, unknown>;
    expect(site["@type"]).toBe("WebSite");
    expect(JSON.stringify(site.potentialAction)).toContain("SearchAction");
  });

  it("LocalBusiness carries address, geo and opening hours", () => {
    const biz = JSON.stringify(localBusinessJsonLd());
    expect(biz).toContain("PostalAddress");
    expect(biz).toContain("GeoCoordinates");
    expect(biz).toContain("OpeningHoursSpecification");
  });
});

describe("legacy redirects", () => {
  const src = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");

  it("maps the known legacy WordPress/WooCommerce URLs", () => {
    for (const legacy of ["/about_anc", "/services", "/product/:slug", "/product-category/:slug"]) {
      expect(src).toContain(legacy);
    }
  });

  it("uses permanent (301) redirects so ranking equity transfers", () => {
    expect(src).toContain("permanent: true");
    expect(src).not.toContain("permanent: false");
  });
});
