/**
 * lib/redirects/manifest.ts
 *
 * Builds the 301 redirect map from the legacy allnaturalscosmetics.com site
 * manifest (data/source/all_naturals_site_manifest.csv, column `proposed_route`).
 *
 * Pure + string-in/map-out so it's unit-testable and can be run at build time
 * to emit a static, edge-safe map for proxy.ts.
 */

import { parse } from "csv-parse/sync";
import { normalizePath } from "./resolve";

// Re-export the edge-safe lookup so callers/tests have one entry point.
export { normalizePath, resolveRedirect } from "./resolve";

type ManifestRow = {
  section: string;
  name: string;
  old_url: string;
  proposed_route: string;
};

/** "/shop  (301 → /shop)" → "/shop"; "/about" → "/about". */
function cleanProposed(proposed: string): string {
  return proposed.split(/\s*\(/)[0].trim();
}

/**
 * Parse the manifest CSV into an { oldPath → newPath } map.
 * Excludes internal/not-migrated rows, the site root, and identity redirects.
 */
export function parseRedirects(csvText: string): Record<string, string> {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as ManifestRow[];

  const map: Record<string, string> = {};

  for (const row of rows) {
    const proposedRaw = (row.proposed_route ?? "").trim();
    // "(internal / not migrated)" and friends are annotations, not routes.
    if (!proposedRaw || proposedRaw.startsWith("(")) continue;

    const to = cleanProposed(proposedRaw);
    if (!to.startsWith("/")) continue;

    let fromPath: string;
    try {
      fromPath = new URL(row.old_url).pathname;
    } catch {
      continue; // malformed / query-only URL
    }

    const from = normalizePath(fromPath);
    if (!from || from === "/") continue; // never redirect the homepage
    if (from === to) continue; // identity redirect — no-op

    map[from] = to;
  }

  return map;
}
