import { store } from "@/lib/shopify";
import { SITE_URL } from "@/lib/seo/site";
import { ABOUT_SECTIONS } from "@/lib/content/about";
import { INGREDIENTS } from "@/lib/content/ingredients-inci";

export const dynamic = "force-static";

/**
 * /llms.txt — the emerging convention (llmstxt.org) for handing LLMs a clean,
 * plain-text map of a site instead of making them infer it from rendered HTML.
 *
 * Assistants that support it use this to answer questions about the brand
 * accurately and to cite the right page, so it carries the facts we most want
 * quoted correctly: what we make, where we're based, and the key URLs.
 */
export async function GET() {
  const [products, collections] = await Promise.all([
    store.getProducts(),
    store.getCollections(),
  ]);

  const aboutLinks = ABOUT_SECTIONS.map(
    (s) => `- [${s.label}](${SITE_URL}/about/${s.slug}): ${s.teaser}`,
  ).join("\n");

  const collectionLinks = collections
    .map((c) => `- [${c.title}](${SITE_URL}/collections/${c.handle})`)
    .join("\n");

  // Catalogue is long — link every product so an assistant can cite exact pages.
  const productLinks = products
    .map((p) => `- [${p.title}](${SITE_URL}/products/${p.handle})`)
    .join("\n");

  const body = `# Shea Allnaturals (All Naturals Cosmetics Inc.)

> Canadian manufacturer of natural and organic personal care products — raw shea
> butter, argan oil, African black soap and cold-pressed botanical oils. Founded
> in 2002 by Lanre and Elder Timothy Tunji-Ajayi and based in Barrie, Ontario,
> the brand was the first Black Canadian-owned product line sold nationally in
> Walmart, Shoppers Drug Mart and Canadian health-food stores. All Naturals
> Cosmetics Inc. is also a private-label contract manufacturer operating under
> Good Manufacturing Practices (GMP) and Health Canada regulations.

Key facts:
- Founded: 2002, Barrie, Ontario, Canada
- Address: 220 Bayview Dr. Unit #18, Barrie, ON L4N 4Y8, Canada
- Phone: 705-719-2750 · Email: allnaturals@allnaturalscosmetics.ca
- Private label enquiries: privatelabel@allnaturalscosmetics.ca
- Ingredients standard: clean, natural, vegan, Halal and Kosher; free from
  parabens, sulphates, mineral oils, artificial dyes and synthetic fragrance;
  never tested on animals.
- Shea butter is unrefined and unbleached, ethically sourced from women-run
  cooperatives in Apaola, Nigeria and in Ghana.
- Sold at Walmart, Shoppers Drug Mart, Jean Coutu and Rexall across Canada.
- Local pickup available at the Barrie studio on Fridays (call ahead).

## About
${aboutLinks}
- [Private label & contract manufacturing](${SITE_URL}/private-label): End-to-end natural personal-care manufacturing — formulation, production, packaging, warehousing and distribution.
- [Ingredient index (common name to INCI)](${SITE_URL}/about/our-ingredients): Searchable reference of ${INGREDIENTS.length} ingredients with their INCI nomenclature.

## Shop
- [All products](${SITE_URL}/shop)
- [All collections](${SITE_URL}/collections)

### Collections
${collectionLinks}

## Company
- [Where to buy](${SITE_URL}/where-to-buy)
- [Wholesale & bulk](${SITE_URL}/wholesale)
- [Media & press](${SITE_URL}/media)
- [Contact](${SITE_URL}/contact)
- [Policies](${SITE_URL}/policies)

## Products
${productLinks}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
