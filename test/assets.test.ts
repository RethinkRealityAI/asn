/**
 * Asset-existence smoke tests.
 *
 * Catches missing or renamed files before they reach production.
 * Covers brand logos, hero pails, and decorative cut-outs introduced
 * during the 2026-06 redesign pass.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const pub  = (...parts: string[]) => path.join(ROOT, "public", ...parts);

// Helper: file must exist and be non-empty
function assetExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).size > 0;
  } catch {
    return false;
  }
}

// ── Brand logos ───────────────────────────────────────────────────────────────

describe("brand logos", () => {
  const logos = [
    "brand/logo-blue-horizontal.png",
    "brand/logo-blue-stacked.png",
    "brand/wordmark-horizontal.png",
    "brand/wordmark-stacked.png",
  ];

  for (const logo of logos) {
    it(`${logo} exists and is non-empty`, () => {
      expect(assetExists(pub(logo))).toBe(true);
    });
  }
});

// ── Wholesale pail hero images ────────────────────────────────────────────────

describe("wholesale pail images", () => {
  const pails = [
    "hero/pail-shea-butter.webp",
    "hero/pail-cocoa-shea.webp",
    "hero/pail-argan-body.webp",
  ];

  for (const pail of pails) {
    it(`${pail} exists and is non-empty`, () => {
      expect(assetExists(pub(pail))).toBe(true);
    });
  }

  it("all three pails are larger than 30 KB (full 1024×1024 source, quality-92 webp)", () => {
    for (const pail of pails) {
      const size = fs.statSync(pub(pail)).size;
      expect(size).toBeGreaterThan(30_000);
    }
  });
});

// ── Hero product cutouts ──────────────────────────────────────────────────────

describe("hero product cutouts", () => {
  const cutouts = [
    "hero/argan.webp",
    "hero/cocoa.webp",
    "hero/shea-butter.webp",
    "hero/peppermint.webp",
  ];

  for (const cutout of cutouts) {
    it(`${cutout} exists`, () => {
      expect(assetExists(pub(cutout))).toBe(true);
    });
  }
});

// ── Decorative assets ─────────────────────────────────────────────────────────

describe("decorative assets", () => {
  const decor = [
    "decor/cloth2.webp",
    "decor/cloth.webp",
    "decor/mudcloth.webp",
    "decor/leaves.webp",
    "decor/shea-nuts.webp",
  ];

  for (const asset of decor) {
    it(`${asset} exists`, () => {
      expect(assetExists(pub(asset))).toBe(true);
    });
  }

  it("cloth2.webp is the new mudcloth — larger than 100 KB", () => {
    expect(fs.statSync(pub("decor/cloth2.webp")).size).toBeGreaterThan(100_000);
  });
});
