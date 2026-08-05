/**
 * scripts/make-social-image.ts
 *
 * Builds the 1200×628 social sharing image (Shopify Online Store →
 * Preferences → Social sharing image + general OG use):
 *   - Backdrop: AI-generated warm still life (arg 1)
 *   - Foreground: the REAL hero product cutouts (public/hero/{argan,shea-butter,cocoa}.webp)
 *   - Branding: the ACTUAL site logo (public/brand/logo-blue-horizontal.png)
 *     on a soft white pill, upper-left
 *
 * Usage: npx tsx scripts/make-social-image.ts <backdrop-image>
 * Output: social-share-1200x628.png (project root)
 */

import sharp from "sharp";
import path from "path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: npx tsx scripts/make-social-image.ts <backdrop-image>");
  process.exit(1);
}

const ROOT = process.cwd();
const OUT = path.resolve(ROOT, "social-share-1200x628.png");
const LOGO = path.resolve(ROOT, "public/brand/logo-blue-horizontal.png");
const HERO = (f: string) => path.resolve(ROOT, "public/hero", f);

const W = 1200;
const H = 628;

/** Resize a cutout to a target height, return buffer + dimensions. */
async function cutout(file: string, height: number) {
  const buf = await sharp(file).resize({ height }).toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, w: meta.width ?? 0, h: meta.height ?? 0 };
}

async function main() {
  // 1. Backdrop at exact OG size.
  const base = await sharp(input).resize(W, H, { fit: "cover", position: "centre" }).toBuffer();

  // 2. Real products, baseline-aligned near the bottom-left (the backdrop's
  //    still life sits right-of-centre, so the cluster owns the left half).
  const BASELINE = H - 34;
  const shea = await cutout(HERO("shea-butter.webp"), 250);
  const argan = await cutout(HERO("argan.webp"), 330);
  const cocoa = await cutout(HERO("cocoa.webp"), 250);

  const sheaLeft = 60;
  const arganLeft = sheaLeft + shea.w - 40; // slight overlap, argan in front-centre
  const cocoaLeft = arganLeft + argan.w - 36;

  // 3. Actual logo on a soft white pill, upper-left.
  const logo = await sharp(LOGO).resize({ width: 380 }).toBuffer();
  const lMeta = await sharp(logo).metadata();
  const lw = lMeta.width ?? 380;
  const lh = lMeta.height ?? 90;
  const padX = 30;
  const padY = 18;
  const pill = Buffer.from(
    `<svg width="${lw + padX * 2}" height="${lh + padY * 2}">
       <rect x="0" y="0" width="${lw + padX * 2}" height="${lh + padY * 2}" rx="${(lh + padY * 2) / 2}"
             fill="white" fill-opacity="0.94"/>
     </svg>`
  );

  await sharp(base)
    .composite([
      // products (shea behind, argan front-centre, cocoa behind-right)
      { input: shea.buf, top: BASELINE - shea.h, left: sheaLeft },
      { input: cocoa.buf, top: BASELINE - cocoa.h, left: cocoaLeft },
      { input: argan.buf, top: BASELINE - argan.h, left: arganLeft },
      // branding
      { input: pill, top: 40, left: 44 },
      { input: logo, top: 40 + padY, left: 44 + padX },
    ])
    .png()
    .toFile(OUT);

  console.log(`Wrote ${OUT} (${W}×${H})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
