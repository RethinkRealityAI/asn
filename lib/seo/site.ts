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

/** Production origin — no trailing slash. */
const PRODUCTION_URL = "https://allnaturalscosmetics.com";

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

/** True only for the real production domain — gates indexing. */
export const IS_PRODUCTION_SITE = SITE_URL === PRODUCTION_URL;

export const SITE_NAME = "Shea Allnaturals";
export const LEGAL_NAME = "All Naturals Cosmetics Inc.";

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
