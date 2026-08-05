/**
 * lib/catalog/card-cta.ts
 *
 * Decides what a product card's call-to-action should do.
 *
 * Why this exists: cards show `priceRange.min` ("From $85") but used to
 * blind-add `variants[0]`. For bulk items the first variant is often the
 * LARGEST size, so a card advertising "From $85" silently added a $250 pail.
 * Multi-variant products must therefore send the shopper to the PDP to pick a
 * size (where the variant picker and quantity stepper live) rather than
 * guessing on their behalf.
 */

import type { Product } from "@/lib/shopify/types";

export type CardCta =
  /** Exactly one variant — safe to quick-add straight from the card. */
  | { kind: "add"; variantId: string }
  /** Several variants — link to the PDP so the shopper chooses. */
  | { kind: "choose"; optionLabel: string };

/** Shopify's placeholder option name for single-variant products. */
const PLACEHOLDER_OPTION = "title";

export function resolveCardCta(product: Product): CardCta | null {
  const variants = product.variants ?? [];
  if (variants.length === 0) return null;
  if (variants.length === 1) return { kind: "add", variantId: variants[0].id };

  const rawName = product.options?.[0]?.name?.trim() ?? "";
  const name = rawName.toLowerCase();
  const optionLabel = !name || name === PLACEHOLDER_OPTION ? "options" : name;

  return { kind: "choose", optionLabel };
}
