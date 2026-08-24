/**
 * Canonical site identity — the single source of truth for the public origin.
 *
 * Everything that emits an absolute URL (canonicals, Open Graph, JSON-LD,
 * sitemap, robots) reads from here, so moving domains is a config change
 * rather than a code change.
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL (set it in Netlify →
 * Site configuration → Environment variables). Deploy previews get their own
 * origin automatically so previews never emit production canonicals.
 */

/**
 * Production origin — no trailing slash.
 *
 * Must match the Netlify project's PRIMARY domain (asn-shea →
 * https://www.allnaturalscosmetics.com). If this emits the apex while Netlify
 * serves www as primary, every canonical/OG/sitemap URL points at a redirect.
 */
const PRODUCTION_URL = "https://www.allnaturalscosmetics.com";

/** Hosts that are all "the real site" — apex and www are the same property. */
const PRODUCTION_HOSTS = new Set([
  "allnaturalscosmetics.com",
  "www.allnaturalscosmetics.com",
]);

function resolveSiteUrl(): string {
  // Explicit override always wins.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  // Netlify sets these automatically. On deploy previews / branch deploys we
  // want the preview's own origin so canonicals don't point at production.
  const ctx = process.env.CONTEXT; // "production" | "deploy-preview" | "branch-deploy"
  if (ctx && ctx !== "production") {
    const previewUrl = process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL;
    if (previewUrl) return previewUrl.replace(/\/+$/, "");
  }

  return PRODUCTION_URL;
}

/** Absolute origin for this deployment, no trailing slash. */
export const SITE_URL = resolveSiteUrl();

/**
 * True only for the real production domain — gates indexing in robots.ts.
 *
 * Compares HOSTS, not full strings: setting NEXT_PUBLIC_SITE_URL to the apex
 * (or adding a trailing slash) must never flip this false, or robots.txt would
 * quietly de-index production. Deploy previews still resolve to a
 * *.netlify.app host and correctly report false.
 */
export const IS_PRODUCTION_SITE = (() => {
  try {
    return PRODUCTION_HOSTS.has(new URL(SITE_URL).host);
  } catch {
    return false;
  }
})();

export const SITE_NAME = "Shea Allnaturals";
export const LEGAL_NAME = "All Naturals Cosmetics Inc.";

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
