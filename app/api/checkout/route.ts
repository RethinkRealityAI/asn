import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/shopify/storefront/checkout";
import { isShopifyConfigured, ShopifyError } from "@/lib/shopify/storefront/client";
import type { CartLine } from "@/lib/shopify/types";

/**
 * POST /api/checkout
 *
 * Body: { lines: [{ variantId, quantity }] }
 * Returns: { url } — the Shopify hosted checkout to redirect to.
 *
 * Runs server-side so SHOPIFY_STOREFRONT_TOKEN is never exposed to the client.
 */

export const dynamic = "force-dynamic";

/** Reject absurd payloads before they reach Shopify. */
const MAX_LINES = 100;
const MAX_QTY = 999;

function parseLines(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_LINES) return null;

  const lines: CartLine[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) return null;
    const { variantId, quantity } = raw as Record<string, unknown>;
    if (typeof variantId !== "string" || !variantId) return null;
    if (typeof quantity !== "number" || !Number.isFinite(quantity)) return null;
    if (quantity < 1 || quantity > MAX_QTY) return null;
    lines.push({ variantId, quantity: Math.floor(quantity) });
  }
  return lines;
}

export async function POST(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { error: "Checkout is not available yet — the store is not connected." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lines = parseLines((body as { lines?: unknown } | null)?.lines);
  if (!lines) {
    return NextResponse.json({ error: "Invalid cart contents." }, { status: 400 });
  }

  try {
    const url = await createCheckout(lines);
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof ShopifyError) {
      // Log the detail server-side; return a safe message to the client.
      console.error("[checkout] Shopify error:", err.message, err.detail);
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("[checkout] Unexpected error:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
