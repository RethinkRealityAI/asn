import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * The root layout defines `title.template = "%s — Shea Allnaturals"`, so Next.js
 * appends the brand to every page-level `title` automatically. Any page that
 * ALSO hard-codes the suffix renders it twice
 * ("Peppermint Essential oil — Shea Allnaturals — Shea Allnaturals").
 *
 * `openGraph.title` is exempt: the template does not apply there, so social
 * cards need the standalone brand suffix.
 */

const APP_DIR = path.resolve(process.cwd(), "app");
const SUFFIX = "— Shea Allnaturals";

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.endsWith(".tsx") || e.name.endsWith(".ts") ? [p] : [];
  });
}

/** Lines that set a metadata `title:` while sitting outside an openGraph/twitter block. */
function offendingTitleLines(source: string): string[] {
  const lines = source.split("\n");
  const bad: string[] = [];
  let socialDepth = 0; // >0 while inside an openGraph/twitter object

  for (const line of lines) {
    if (/\b(openGraph|twitter)\s*:\s*\{/.test(line)) socialDepth = 1;
    else if (socialDepth > 0) {
      socialDepth += (line.match(/\{/g)?.length ?? 0);
      socialDepth -= (line.match(/\}/g)?.length ?? 0);
      if (socialDepth <= 0) socialDepth = 0;
    }
    if (socialDepth === 0 && /^\s*title:/.test(line) && line.includes(SUFFIX)) {
      bad.push(line.trim());
    }
  }
  return bad;
}

describe("page titles vs the root title template", () => {
  const files = walk(APP_DIR);

  it("finds page files to check", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it("no page hard-codes the brand suffix in `title` (the template adds it)", () => {
    const offenders: Record<string, string[]> = {};
    for (const f of files) {
      // The root layout legitimately defines the template + default title.
      if (path.basename(f) === "layout.tsx" && path.dirname(f) === APP_DIR) continue;
      const bad = offendingTitleLines(fs.readFileSync(f, "utf-8"));
      if (bad.length) offenders[path.relative(process.cwd(), f)] = bad;
    }
    expect(offenders).toEqual({});
  });

  it("the root layout still defines the template", () => {
    const layout = fs.readFileSync(path.join(APP_DIR, "layout.tsx"), "utf-8");
    expect(layout).toContain("template:");
    expect(layout).toContain(SUFFIX);
  });
});
