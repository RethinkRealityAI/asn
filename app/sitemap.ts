import type { MetadataRoute } from "next";
import { store } from "@/lib/shopify";
import { SITE_URL } from "@/lib/seo/site";
import { ABOUT_SECTIONS } from "@/lib/content/about";

/**
 * sitemap.xml — every indexable route, generated from real catalogue data so
 * new products and collections appear automatically.
 *
 * priority/changeFrequency are hints: commerce surfaces (shop, collections,
 * products) rank above evergreen brand pages, which rank above legal.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
      { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
      { url: `${SITE_URL}/collections`, changeFrequency: "weekly", priority: 0.8 },
      
      { url: `${SITE_URL}/private-label`, changeFrequency: "monthly", priority: 0.8 },
      { url: `${SITE_URL}/wholesale`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${SITE_URL}/where-to-buy`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${SITE_URL}/media`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
      { url: `${SITE_URL}/policies`, changeFrequency: "yearly", priority: 0.3 },
    ] satisfies MetadataRoute.Sitemap
  ).map((r) => ({ ...r, lastModified: now }));

  // About subpages (our story, mission, beliefs, awards, ingredients, impact)
  const aboutRoutes: MetadataRoute.Sitemap = ABOUT_SECTIONS.map((s) => ({
    url: `${SITE_URL}/about/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    // The INCI index is a genuine reference resource — worth ranking.
    priority: s.slug === "our-ingredients" ? 0.8 : 0.6,
  }));

  const [products, collections] = await Promise.all([
    store.getProducts(),
    store.getCollections(),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.handle}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/collections/${c.handle}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...aboutRoutes, ...collectionRoutes, ...productRoutes];
}
