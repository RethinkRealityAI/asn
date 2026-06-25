/**
 * import-product-images.ts
 *
 * For each of the 113 catalog handles:
 *  1. Try exact folder name == handle under product_images dir
 *  2. Try prefix match (folder starts with handle OR handle starts with folder)
 *  3. Fallback: xlsx manifest Handle → Image Folder
 * Optimize each image to WebP (long edge ≤ 1600px, quality 80).
 * Write to public/media/<handle>/01.webp, 02.webp, ...
 * Emit public/media/index.json = { [handle]: ["/media/<handle>/01.webp", ...] }
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import * as XLSX from "xlsx";

// ── Paths ──────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const PRODUCT_IMAGES_DIR = path.resolve(
  ROOT,
  "../../../../NEW DESIGN/all_naturals_assets/all_naturals_assets/product_images"
);
const MANIFEST_XLSX = path.resolve(
  ROOT,
  "../../../../NEW DESIGN/all_naturals_image_manifest.xlsx"
);
const MANIFEST_XLSX_ALT = path.resolve(
  ROOT,
  "../../../../NEW DESIGN/all_naturals_assets/all_naturals_assets/all_naturals_image_manifest.xlsx"
);
const CATALOG_PATH = path.resolve(ROOT, "lib/shopify/mock/catalog.json");
const OUTPUT_BASE = path.resolve(ROOT, "public/media");
const INDEX_PATH = path.join(OUTPUT_BASE, "index.json");

// ── Load catalog ────────────────────────────────────────────────────────────
const catalog: Array<{ handle: string; title: string }> = JSON.parse(
  fs.readFileSync(CATALOG_PATH, "utf-8")
);

// ── Load xlsx manifest (Handle → folder) ───────────────────────────────────
function loadXlsxManifest(): Map<string, string> {
  const map = new Map<string, string>();
  const xlsxPath = fs.existsSync(MANIFEST_XLSX)
    ? MANIFEST_XLSX
    : fs.existsSync(MANIFEST_XLSX_ALT)
    ? MANIFEST_XLSX_ALT
    : null;
  if (!xlsxPath) {
    console.log("No xlsx manifest found, skipping.");
    return map;
  }
  console.log(`Loading xlsx manifest from: ${xlsxPath}`);
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
  for (const row of rows) {
    const handle = (row["Handle"] ?? row["handle"] ?? "").trim();
    const folder = (row["Image Folder"] ?? row["image_folder"] ?? row["Folder"] ?? "").trim();
    if (handle && folder) map.set(handle, folder);
  }
  return map;
}

// ── List available folders ─────────────────────────────────────────────────
const availableFolders = fs
  .readdirSync(PRODUCT_IMAGES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const folderSet = new Set(availableFolders);

// ── Map handle → folder ────────────────────────────────────────────────────
function resolveFolder(handle: string, xlsxMap: Map<string, string>): string | null {
  // 1. Exact match
  if (folderSet.has(handle)) return handle;

  // 2. Prefix match: handle starts with folder OR folder starts with handle
  const prefix = availableFolders.find(
    (f) => handle.startsWith(f) || f.startsWith(handle)
  );
  if (prefix) return prefix;

  // 3. xlsx manifest
  const fromXlsx = xlsxMap.get(handle);
  if (fromXlsx && folderSet.has(fromXlsx)) return fromXlsx;

  return null;
}

// ── Image extensions to process ────────────────────────────────────────────
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".tiff", ".tif", ".avif"]);

function getImageFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort();
}

// ── Process one folder → WebP outputs ─────────────────────────────────────
async function processFolder(handle: string, folder: string): Promise<string[]> {
  const srcDir = path.join(PRODUCT_IMAGES_DIR, folder);
  const files = getImageFiles(srcDir);
  if (files.length === 0) return [];

  const outDir = path.join(OUTPUT_BASE, handle);
  fs.mkdirSync(outDir, { recursive: true });

  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const nn = String(i + 1).padStart(2, "0");
    const outFile = path.join(outDir, `${nn}.webp`);
    const srcFile = path.join(srcDir, files[i]);

    const img = sharp(srcFile);
    const meta = await img.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const longEdge = Math.max(w, h);

    let pipeline = img;
    if (longEdge > 1600) {
      const isLandscape = w >= h;
      pipeline = img.resize(
        isLandscape ? 1600 : undefined,
        isLandscape ? undefined : 1600,
        { withoutEnlargement: true }
      );
    }

    await pipeline
      .webp({ quality: 80 })
      .toFile(outFile);

    urls.push(`/media/${handle}/${nn}.webp`);
  }
  return urls;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUTPUT_BASE, { recursive: true });

  const xlsxMap = loadXlsxManifest();
  console.log(`Loaded xlsx manifest: ${xlsxMap.size} entries`);

  const index: Record<string, string[]> = {};
  let totalImages = 0;
  const noMatch: string[] = [];
  const processed: string[] = [];

  for (const { handle } of catalog) {
    const folder = resolveFolder(handle, xlsxMap);
    if (!folder) {
      noMatch.push(handle);
      console.warn(`  [NO MATCH] ${handle}`);
      continue;
    }

    const urls = await processFolder(handle, folder);
    if (urls.length > 0) {
      index[handle] = urls;
      totalImages += urls.length;
      processed.push(handle);
      console.log(`  v ${handle} (${folder}) -> ${urls.length} image(s)`);
    } else {
      noMatch.push(handle);
      console.warn(`  [EMPTY] ${handle} -> ${folder} (no image files)`);
    }
  }

  // Write index
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

  // Summary
  console.log("\n--- Summary ---");
  console.log(`Handles processed:      ${processed.length} / ${catalog.length}`);
  console.log(`Total webp images:      ${totalImages}`);
  console.log(`Handles with no images: ${noMatch.length}`);
  if (noMatch.length > 0) {
    console.log("  No-image handles:", noMatch.join(", "));
  }
  console.log(`Index written to:       ${INDEX_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
