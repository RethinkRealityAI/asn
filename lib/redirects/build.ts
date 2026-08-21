/**
 * lib/redirects/build.ts
 *
 * The single redirect-map pipeline, shared by scripts/build-redirects.ts and
 * the tests so the generated artifacts can never drift from what is asserted.
 *
 *   legacy manifest CSV  +  hand-maintained site changes  →  flatten chains
 */

import { parseRedirects } from "./manifest";
import { SITE_CHANGE_REDIRECTS } from "./site-changes";

/**
 * Collapse redirect chains to their final destination.
 *
 * A legacy entry can point at a route that SITE_CHANGE_REDIRECTS has since
 * moved again (e.g. /product-category/hair-oils-lotions-sprays →
 * /collections/hair-oils-lotions-sprays → /collections/hair-oils-balm).
 * Netlify serves that as two round-trips and search engines discount chained
 * 301s, so every chain is flattened at generation time.
 */
export function flattenChains(input: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [from, to] of Object.entries(input)) {
    let target = to;
    const seen = new Set([from]);
    while (input[target] !== undefined && !seen.has(target)) {
      seen.add(target);
      target = input[target];
    }
    // Self-referential or cyclic entries are no-op redirects — drop them.
    if (target !== from) out[from] = target;
  }
  return out;
}

/** Build the complete redirect map from the legacy manifest CSV. */
export function buildRedirectMap(csv: string): Record<string, string> {
  return flattenChains({ ...parseRedirects(csv), ...SITE_CHANGE_REDIRECTS });
}
