/**
 * About Us content-model tests.
 *
 * The About section is data-driven — the sub-nav, hub cards, subpages and the
 * searchable ingredient index all read from lib/content/about.ts,
 * lib/content/ingredients-inci.ts and lib/content/private-label.ts. These
 * tests guard the integrity of that data so a broken slug, a dangling header
 * image or an empty INCI row can't ship silently.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import {
  ABOUT_SECTIONS,
  getAboutSection,
  STORY,
  MISSION,
  BELIEFS,
  AWARDS,
  MAKING_A_DIFFERENCE,
} from "@/lib/content/about";
import {
  INGREDIENTS,
  INGREDIENT_CATEGORIES,
  INGREDIENTS_INTRO,
} from "@/lib/content/ingredients-inci";
import {
  PRIVATE_LABEL,
  PRODUCT_CATEGORIES,
  INQUIRY_FIELDS,
  PRIVATE_LABEL_EMAIL,
} from "@/lib/content/private-label";

const ROOT = path.resolve(__dirname, "..");
const pub = (...parts: string[]) => path.join(ROOT, "public", ...parts);

// ── About sections (sub-nav) ──────────────────────────────────────────────────

describe("ABOUT_SECTIONS", () => {
  it("has the six sub-menu sections", () => {
    expect(ABOUT_SECTIONS).toHaveLength(6);
  });

  it("expected slugs are present", () => {
    const slugs = ABOUT_SECTIONS.map((s) => s.slug);
    for (const slug of [
      "our-story",
      "our-mission",
      "our-beliefs",
      "awards",
      "our-ingredients",
      "making-a-difference",
    ]) {
      expect(slugs).toContain(slug);
    }
  });

  it("slugs are unique and URL-safe", () => {
    const slugs = ABOUT_SECTIONS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("every section has a label, teaser and botanical decor", () => {
    for (const s of ABOUT_SECTIONS) {
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.teaser.length).toBeGreaterThan(0);
      expect(["argan", "castor", "shea"]).toContain(s.decor);
    }
  });

  it("any header image referenced actually exists on disk", () => {
    for (const s of ABOUT_SECTIONS) {
      if (!s.image) continue;
      expect(s.image.startsWith("/")).toBe(true);
      expect(fs.existsSync(pub(s.image.replace(/^\//, "")))).toBe(true);
    }
  });

  it("getAboutSection resolves a known slug and rejects unknown", () => {
    expect(getAboutSection("our-story")?.label).toBe("Our story");
    expect(getAboutSection("nope")).toBeUndefined();
  });
});

// ── Narrative content ─────────────────────────────────────────────────────────

describe("About narrative content", () => {
  it("story has a lede and multiple paragraphs", () => {
    expect(STORY.lede.length).toBeGreaterThan(0);
    expect(STORY.paragraphs.length).toBeGreaterThanOrEqual(3);
    expect(STORY.values.length).toBe(3);
  });

  it("mission has a statement and points", () => {
    expect(MISSION.statement).toMatch(/green ingredients/i);
    expect(MISSION.points.length).toBeGreaterThanOrEqual(3);
  });

  it("beliefs carries the six stated beliefs", () => {
    expect(BELIEFS.items).toHaveLength(6);
    for (const b of BELIEFS.items) expect(b.toLowerCase()).toContain("we believe");
  });

  it("awards lists recognitions attributed to a recipient", () => {
    expect(AWARDS.awards.length).toBeGreaterThanOrEqual(5);
    for (const a of AWARDS.awards) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.detail.length).toBeGreaterThan(0);
      expect(a.who.length).toBeGreaterThan(0);
    }
  });

  it("making-a-difference has dated initiatives", () => {
    expect(MAKING_A_DIFFERENCE.initiatives.length).toBeGreaterThanOrEqual(3);
    for (const i of MAKING_A_DIFFERENCE.initiatives) {
      expect(i.title.length).toBeGreaterThan(0);
      expect(i.detail.length).toBeGreaterThan(0);
    }
  });
});

// ── Ingredients / INCI index ──────────────────────────────────────────────────

describe("INGREDIENTS (INCI index)", () => {
  it("carries the full authoritative list", () => {
    expect(INGREDIENTS.length).toBeGreaterThanOrEqual(300);
  });

  it("has no exact duplicate (common + INCI) rows", () => {
    const keys = INGREDIENTS.map((i) => `${i.common.toLowerCase()}¦${i.inci.toLowerCase()}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every ingredient has a common name, an INCI name and a known category", () => {
    for (const ing of INGREDIENTS) {
      expect(ing.common.length).toBeGreaterThan(0);
      expect(ing.inci.length).toBeGreaterThan(0);
      expect(INGREDIENT_CATEGORIES).toContain(ing.category);
    }
  });

  it("every category chip is actually used by at least one ingredient", () => {
    for (const cat of INGREDIENT_CATEGORIES) {
      expect(INGREDIENTS.some((i) => i.category === cat)).toBe(true);
    }
  });

  it("covers the brand's hero botanicals", () => {
    const inci = INGREDIENTS.map((i) => i.inci.toLowerCase()).join(" | ");
    for (const hero of ["butyrospermum parkii", "argania spinosa", "theobroma cacao", "ricinus communis", "cocos nucifera"]) {
      expect(inci).toContain(hero);
    }
  });

  it("intro copy is the brand's own and lists what the range is free from", () => {
    expect(INGREDIENTS_INTRO.lede).toMatch(/vegan, Halal, and Kosher/);
    expect(INGREDIENTS_INTRO.freeFrom.length).toBeGreaterThanOrEqual(4);
  });
});

// ── Private label ─────────────────────────────────────────────────────────────

describe("Private label content", () => {
  it("intro references the 2002 founding and ANCI", () => {
    expect(PRIVATE_LABEL.lede).toMatch(/2002/);
    expect(PRIVATE_LABEL.lede).toMatch(/ANCI/);
  });

  it("has face / body / hair product categories, each with products", () => {
    const names = PRODUCT_CATEGORIES.map((c) => c.name.toLowerCase());
    expect(names).toContain("face care");
    expect(names).toContain("body care");
    expect(names).toContain("hair care");
    for (const c of PRODUCT_CATEGORIES) expect(c.products.length).toBeGreaterThan(0);
  });

  it("inquiry form collects the required lead fields", () => {
    const fieldNames = INQUIRY_FIELDS.map((f) => f.name);
    for (const req of ["business", "country", "email", "phone", "products", "quantities"]) {
      expect(fieldNames).toContain(req);
    }
    expect(PRIVATE_LABEL_EMAIL).toMatch(/@/);
  });
});
