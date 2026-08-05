/**
 * lib/redirects/resolve.ts
 *
 * Edge-safe redirect lookup — zero dependencies (no csv-parse, no fs), so it
 * can be imported into proxy.ts which runs in the Edge runtime.
 */

/** Strip a trailing slash (except for root "/"). */
export function normalizePath(p: string): string {
  if (!p) return "";
  if (p.length > 1 && p.endsWith("/")) return p.replace(/\/+$/, "");
  return p;
}

/** Look up the redirect target for an incoming request path, or null. */
export function resolveRedirect(pathname: string, map: Record<string, string>): string | null {
  const key = normalizePath(pathname);
  if (!key || key === "/") return null;
  return map[key] ?? null;
}
