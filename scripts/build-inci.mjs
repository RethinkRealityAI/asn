/**
 * build-inci.mjs — regenerate lib/content/ingredients-inci.ts from the
 * authoritative common-name ↔ INCI CSV supplied by All Naturals Cosmetics Inc.
 *
 * Usage:  node scripts/build-inci.mjs
 *
 * `common` and `inci` are kept verbatim; `category` is derived by a keyword
 * classifier purely to drive the filter chips on the ingredients page.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV = path.join(__dirname, "data", "inci.csv");
const OUT = path.join(__dirname, "..", "lib", "content", "ingredients-inci.ts");

// ── minimal CSV parser (handles quoted fields w/ commas) ──────────────────────
function parseCSV(text) {
  const rows = [];
  let field = "", row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ── classifier keyword sets ───────────────────────────────────────────────────
const ESSENTIAL = ["lavender","peppermint","spearmint","tea tree","eucalyptus","lemon","lime","orange","bergamot","grapefruit","mandarin","tangerine","rosemary","sage","thyme","oregano","basil","clove","cinnamon","geranium","ylang","patchouli","sandalwood","cedarwood","frankincense","myrrh","chamomile","lemongrass","palmarosa","vetiver","ginger","black pepper","juniper","cypress","pine ","scotch pine","spruce","fir needle","fennel","anise","dill","marjoram","melissa","myrtle","niaouli","cajeput","manuka","ravensara","rosewood","neroli","petitgrain","jasmine","rose otto","rose absolute","helichrysum","galbanum","elemi","catnip","mugwort","hyssop","valerian","camphor","birch","litsea","may chang","vanilla","oakmoss","garlic","parsley","cade","nutmeg","menthol","cananga"];
const CARRIER = ["argan","coconut","olive","jojoba","almond oil","castor","avocado oil","grape seed","hemp","sunflower","safflower","sesame","baobab","neem","apricot","macadamia","kukui","marula","moringa","rice bran","wheatgerm","evening primrose","borage","rose hip","rosehip","pumpkin","chia","flax","linseed","meadowfoam","camellia oil","peanut","canola oil","soybean","babassu","sea buckthorn","tamanu","andiroba","abyssinian","hazel nut oil","broccolli","broccoli","black cumin","carrot oil","carrot seed","emu oil","st. john","poppyseed","persea gratissima"];
const BUTTER = ["butter"];
const WAX_EMUL = ["wax","cetyl alcohol","stearyl alcohol","stearic acid","emulsifying","polysorbate","tween","lecithin","glyceryl","ceteareth","cremophor","polawax","iselux","sulfosuccinate","tego","eucarol","varisoft","quaternium","isopropyl myristate","distearoyl","cocamidopropyl","sulfated","turkey red","guar","xanthan","carbomer","carbopol","methylcellulose","cellosize","chitosan","hydroxyethyl","caprylic/capric"];
const SOAP = ["soap","cocoate","olivate","palmate","tallowate","sodium stearate","kernelate","canolate","castorate","babassuate","avocadate","seedate","lardate","butterate","apricot kernelate","rosinate","sodium beeswax"];
const ACTIVE = ["ascorbic","vitamin c","vitamin e","tocopherol","panthenol","allantoin","glycolic","citric acid","silk amino","msm","dimethyl sulfone","glycerin","propanediol","propylene glycol","hyaluronic","niacinamide","salicylic","lactose","honey","aloe","seaweed extract"];
const PRESERV = ["sodium benzoate","potassium sorbate","bht","tetrasodium edta","edta","benzyl benzoate","rosmarinus officinalis (rosemary) leaf extract"];
const MINERAL = ["clay","kaolin","bentonite","mica","iron oxide","titanium dioxide","zinc oxide","salt","magnesium","calcium carbonate","calamine","manganese","pumice","sodium bicarbonate","baking soda","soda ash","carbonate","glitter","colour","color","yellow 6","cornstarch","arrowroot","montmorillonite","lithothamnium","zea mays","bicarbonate","chloride","nitrate","epsom","ferric","chromium","sea salt","glacial"];
const EXTRACT = ["extract","powder","distillate","flower water","milk","buttermilk","goat","banana","spinach","nettle","alfalfa","comfrey","stevia","saffron","kelp","dulse","laminaria","bladderwrack","oatmeal","oat","rice powder","beet","lard","tallow","water","juice","meal"];
const FRAGRANCE = ["fragrance","flavor","flavour","essential oil(s)"];

function classify(common, inci) {
  const c = (common + " ¦ " + inci).toLowerCase();
  const has = (arr) => arr.some((k) => c.includes(k));
  if (has(BUTTER)) return "Butters";
  if (has(PRESERV)) return "Preservatives";
  if (has(SOAP)) return "Soap bases";
  if (has(FRAGRANCE)) return "Fragrance & flavour";
  if (has(WAX_EMUL)) return "Waxes & emulsifiers";
  if (has(MINERAL)) return "Minerals & clays";
  if (has(CARRIER)) return "Carrier oils";
  if (has(ESSENTIAL)) return "Essential oils";
  if (has(ACTIVE)) return "Actives & acids";
  if (has(EXTRACT)) return "Extracts & botanicals";
  if (/\boil\b/i.test(common)) return "Essential oils";
  return "Other";
}

const CATS = ["Butters","Carrier oils","Essential oils","Extracts & botanicals","Actives & acids","Soap bases","Waxes & emulsifiers","Minerals & clays","Preservatives","Fragrance & flavour","Other"];

// ── build + dedupe ────────────────────────────────────────────────────────────
const rows = parseCSV(fs.readFileSync(CSV, "utf8")).slice(1);
const norm = (s) => s.trim().replace(/\.+$/, "").replace(/\s+/g, " ").toLowerCase();
const seen = new Set();
const out = [];
for (const [commonRaw, inciRaw] of rows) {
  if (!commonRaw || !inciRaw) continue;
  const common = commonRaw.trim();
  const inci = inciRaw.trim().replace(/\.+$/, "");
  const key = norm(common) + "¦" + norm(inci);
  if (seen.has(key)) continue;
  seen.add(key);
  out.push({ common, inci, category: classify(common, inci) });
}

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const unionType = CATS.map((c) => `  | "${c}"`).join("\n");
const chips = CATS.map((c) => `  "${c}",`).join("\n");
const body = out.map((o) => `  { common: "${esc(o.common)}", inci: "${esc(o.inci)}", category: "${o.category}" },`).join("\n");

const file = `/**
 * Ingredients — common names & corresponding INCI nomenclature.
 *
 * The brand's own reference: the common name printed on a label paired with its
 * International Nomenclature of Cosmetic Ingredients (INCI) name. This is the
 * authoritative list supplied by All Naturals Cosmetics Inc. (${out.length} entries),
 * rebuilt as typed data to power an interactive, searchable ingredient index.
 *
 * \`category\` is derived to enable filtering; \`common\` and \`inci\` are verbatim
 * from the source CSV. GENERATED by scripts/build-inci.mjs — do not edit by hand;
 * run \`node scripts/build-inci.mjs\` to regenerate from scripts/data/inci.csv.
 */

export type IngredientCategory =
${unionType};

export interface Ingredient {
  /** Everyday name as printed on the front of a label (verbatim) */
  common: string;
  /** International Nomenclature of Cosmetic Ingredients name (verbatim) */
  inci: string;
  /** Derived grouping, for the filter chips */
  category: IngredientCategory;
}

/** Display order for the category filter chips. */
export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
${chips}
];

export const INGREDIENTS_INTRO = {
  eyebrow: "Our ingredients",
  title: "Common names, decoded to INCI.",
  lede:
    "At All Naturals Cosmetics Inc., we pride ourselves on using clean, natural, vegan, Halal, and Kosher ingredients – and being transparent about how we use them. On this page, you can find the common names & corresponding INCI names for some of the ingredients used in All Naturals Cosmetics Inc. cosmetics, beauty products, personal care products & soaps.",
  freeFrom: ["Parabens", "Sulphates (SLS/SLES)", "Mineral oils", "Artificial dyes", "Synthetic fragrance", "Animal testing"],
} as const;

export const INGREDIENTS: Ingredient[] = [
${body}
];
`;

fs.writeFileSync(OUT, file);
const counts = {};
for (const o of out) counts[o.category] = (counts[o.category] || 0) + 1;
console.log(`Wrote ${out.length} ingredients to ${path.relative(process.cwd(), OUT)}`);
console.log(counts);
