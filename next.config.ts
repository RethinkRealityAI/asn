import type { NextConfig } from "next";

/**
 * Legacy → new URL map.
 *
 * allnaturalscosmetics.com previously ran WordPress/WooCommerce, so those URLs
 * are indexed and linked from the wild. These 301s carry that ranking equity
 * across to the rebuild instead of serving a wall of 404s at launch.
 *
 * WooCommerce used /product/<slug>/ and /product-category/<slug>/; editorial
 * posts used the dated /YYYY/MM/DD/<slug>/ form.
 */
const legacyRedirects = [
  // ── Brand / company pages ────────────────────────────────────────────────
  { source: "/about_anc", destination: "/about", permanent: true },
  { source: "/about-anc", destination: "/about", permanent: true },
  { source: "/about-us", destination: "/about", permanent: true },
  { source: "/services", destination: "/private-label", permanent: true },
  { source: "/private-labeling", destination: "/private-label", permanent: true },
  { source: "/ingredients-inci", destination: "/about/our-ingredients", permanent: true },

  // ── Dated editorial posts ────────────────────────────────────────────────
  { source: "/2021/10/27/ingredients-inci", destination: "/about/our-ingredients", permanent: true },
  { source: "/2021/08/03/making-a-difference", destination: "/about/making-a-difference", permanent: true },
  {
    source: "/2021/07/14/meet-lanre-the-president-and-ceo-of-all-naturals-cosmetics-inc",
    destination: "/about/our-story",
    permanent: true,
  },
  // Any other dated post → the About hub rather than a 404.
  { source: "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug", destination: "/about", permanent: true },

  // ── WooCommerce storefront ───────────────────────────────────────────────
  { source: "/product/:slug", destination: "/products/:slug", permanent: true },
  { source: "/product-category/:slug", destination: "/collections/:slug", permanent: true },
  { source: "/product-category/:parent/:slug", destination: "/collections/:slug", permanent: true },
  { source: "/shop/page/:page", destination: "/shop", permanent: true },
  { source: "/my-account", destination: "/contact", permanent: true },
  { source: "/checkout", destination: "/cart", permanent: true },

  // ── Legacy misc ──────────────────────────────────────────────────────────
  { source: "/where-to-buy-2", destination: "/where-to-buy", permanent: true },
  { source: "/contact-us", destination: "/contact", permanent: true },
  { source: "/blog", destination: "/media", permanent: true },
  { source: "/feed", destination: "/sitemap.xml", permanent: true },
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Long-lived cache for the immutable static asset folders.
        source: "/:dir(media|decor|hero|brand|badges|headers)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
