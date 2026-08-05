import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OG = path.resolve(process.cwd(), "public/og.jpg");

describe("social sharing / OG image", () => {
  it("exists at public/og.jpg", () => {
    expect(fs.existsSync(OG)).toBe(true);
  });

  it("is exactly 1200×628 (OG recommended size)", async () => {
    const meta = await sharp(OG).metadata();
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(628);
  });

  it("is a reasonable file size (under 1.5 MB)", () => {
    expect(fs.statSync(OG).size).toBeLessThan(1.5 * 1024 * 1024);
  });

  it("is declared in the root layout metadata", () => {
    const layout = fs.readFileSync(path.resolve(process.cwd(), "app/layout.tsx"), "utf-8");
    expect(layout).toContain("openGraph");
    expect(layout).toContain("/og.jpg");
  });
});
