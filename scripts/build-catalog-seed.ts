import fs from "fs";
import path from "path";
import { loadCatalog } from "../lib/shopify/mock/seed";

const CSV = path.resolve(__dirname, "../data/source/all_naturals_shopify_products.csv");
const OUT = path.resolve(__dirname, "../lib/shopify/mock/catalog.json");

async function main() {
  console.log("Loading catalog from:", CSV);
  const products = await loadCatalog(CSV);
  console.log(`Parsed ${products.length} products`);

  const totalVariants = products.reduce((n, p) => n + p.variants.length, 0);
  const totalImages = products.reduce((n, p) => n + p.images.length, 0);
  console.log(`Total variants: ${totalVariants}`);
  console.log(`Total images: ${totalImages}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(products, null, 2), "utf8");
  console.log("Written to:", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
