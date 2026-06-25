/**
 * install-wave2.ts
 *
 * Wave 2-4 re-staged product images: 31 products.
 * For each {handle, url} in ../../.restage-preview/wave2-urls.json:
 *   1. Download image from CloudFront URL to a temp file.
 *   2. Resize to max 1200px long edge (no upscale), webp quality 82.
 *   3. Back up existing primary: public/media/<handle>/01.webp → 00-orig.webp
 *      (only if 00-orig.webp doesn't already exist).
 *   4. Overwrite public/media/<handle>/01.webp with the optimized re-staged image.
 *   5. Verify output is a valid WEBP (RIFF....WEBP header) and non-trivial size.
 *
 * Run: npx tsx scripts/install-wave2.ts
 */

import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import http from "http";
import sharp from "sharp";

const ROOT = path.resolve(__dirname, "..");
const URLS_PATH = path.resolve(ROOT, "../.restage-preview/wave2-urls.json");
const MEDIA_BASE = path.join(ROOT, "public/media");

type UrlMap = Record<string, string>;

function downloadToTemp(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith("https") ? https : http;

    function doRequest(targetUrl: string, redirectCount = 0): void {
      if (redirectCount > 5) {
        reject(new Error("Too many redirects"));
        return;
      }
      const mod = targetUrl.startsWith("https") ? https : http;
      mod.get(targetUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doRequest(res.headers.location, redirectCount + 1);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${targetUrl}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
        file.on("error", reject);
      }).on("error", reject);
    }

    doRequest(url);
  });
}

/** Verify output file starts with RIFF....WEBP */
function isValidWebP(filePath: string): boolean {
  try {
    const buf = Buffer.alloc(12);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    return (
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP"
    );
  } catch {
    return false;
  }
}

function sizeKB(filePath: string): number {
  return Math.round(fs.statSync(filePath).size / 1024);
}

async function main() {
  if (!fs.existsSync(URLS_PATH)) {
    console.error(`URL map not found: ${URLS_PATH}`);
    process.exit(1);
  }

  const urlMap: UrlMap = JSON.parse(fs.readFileSync(URLS_PATH, "utf-8"));
  const handles = Object.keys(urlMap);

  console.log(`Installing ${handles.length} Wave 2-4 re-staged images...\n`);

  let installed = 0;
  let totalBytesAfter = 0;
  const errors: string[] = [];

  for (const handle of handles) {
    const url = urlMap[handle];
    const outDir = path.join(MEDIA_BASE, handle);
    const outPath = path.join(outDir, "01.webp");
    const origPath = path.join(outDir, "00-orig.webp");

    if (!fs.existsSync(outDir)) {
      console.warn(`  WARN: media dir not found for ${handle}, creating it`);
      fs.mkdirSync(outDir, { recursive: true });
    }

    // 1. Download to temp file
    const tmpPath = path.join(os.tmpdir(), `wave2-${handle}-${Date.now()}.tmp`);
    try {
      process.stdout.write(`  [${handle}] Downloading...`);
      await downloadToTemp(url, tmpPath);
      process.stdout.write(" done. ");
    } catch (err) {
      console.error(`\n  ERROR downloading ${handle}: ${err}`);
      errors.push(handle);
      try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
      continue;
    }

    // 2. Optimize with sharp: resize to max 1200px long edge, webp quality 82
    const tmpOptPath = path.join(os.tmpdir(), `wave2-${handle}-opt-${Date.now()}.webp`);
    try {
      const img = sharp(tmpPath);
      const meta = await img.metadata();
      const w = meta.width ?? 0;
      const h = meta.height ?? 0;
      const longEdge = Math.max(w, h);

      let pipeline = img;
      if (longEdge > 1200) {
        const isLandscape = w >= h;
        pipeline = img.resize(
          isLandscape ? 1200 : undefined,
          isLandscape ? undefined : 1200,
          { withoutEnlargement: true }
        );
      }

      await pipeline.webp({ quality: 82 }).toFile(tmpOptPath);
      process.stdout.write(`Optimized (${w}x${h} → max 1200px). `);
    } catch (err) {
      console.error(`\n  ERROR optimizing ${handle}: ${err}`);
      errors.push(handle);
      try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
      try { fs.unlinkSync(tmpOptPath); } catch { /* ignore */ }
      continue;
    } finally {
      try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
    }

    // 3. Back up existing primary if not already backed up
    if (fs.existsSync(outPath) && !fs.existsSync(origPath)) {
      fs.copyFileSync(outPath, origPath);
      process.stdout.write(`Backed up 01→00-orig. `);
    } else if (fs.existsSync(origPath)) {
      process.stdout.write(`(backup exists). `);
    }

    // 4. Overwrite 01.webp with optimized re-staged image
    fs.copyFileSync(tmpOptPath, outPath);
    try { fs.unlinkSync(tmpOptPath); } catch { /* ignore */ }

    // 5. Verify output
    const valid = isValidWebP(outPath);
    const kb = sizeKB(outPath);
    const trivial = kb < 5;

    if (!valid) {
      console.error(`\n  ERROR: ${handle}/01.webp has invalid WEBP header!`);
      errors.push(handle);
      continue;
    }
    if (trivial) {
      console.warn(`\n  WARN: ${handle}/01.webp is only ${kb}KB (unusually small)`);
    }

    totalBytesAfter += fs.statSync(outPath).size;
    installed++;
    console.log(`Installed. [${kb}KB, WEBP OK]`);
  }

  // Summary
  console.log("\n─────────────────────────────────────────────");
  console.log(`Installed: ${installed} / ${handles.length}`);
  console.log(`Total size of installed files: ${Math.round(totalBytesAfter / 1024)}KB`);
  if (errors.length > 0) {
    console.error(`\nFailed handles (${errors.length}): ${errors.join(", ")}`);
    process.exit(1);
  } else {
    console.log("\nAll Wave 2-4 re-staged images installed successfully.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
