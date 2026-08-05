"use client";

/**
 * CheckoutButton — the real checkout handoff.
 *
 * When Shopify is wired (NEXT_PUBLIC_SHOPIFY_* present at build), clicking
 * creates a Shopify cart from the local cart and redirects to the hosted
 * secure checkout (cart.checkoutUrl). Without Shopify config (design
 * preview), it explains checkout isn't live yet — no fake payment.
 *
 * Two visual variants match their hosts: "drawer" (glass drawer) and
 * "page" (cart page summary). Never blue. AA contrast. aria-busy while
 * the cart is being created.
 */

import { useState, useCallback } from "react";
import { useCart } from "./CartProvider";
import { startCheckout, resolvePublicShopifyConfig } from "@/lib/cart/checkout";
import { cn } from "@/lib/utils";

// Statically referenced so Next.js inlines them into the client bundle.
const SHOPIFY_CONFIG = resolvePublicShopifyConfig({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION,
});

export function CheckoutButton({ variant = "page" }: { variant?: "drawer" | "page" }) {
  const { items } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const live = SHOPIFY_CONFIG !== null;
  const disabled = busy || items.length === 0;

  const onCheckout = useCallback(async () => {
    if (!SHOPIFY_CONFIG || items.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const url = await startCheckout(items, SHOPIFY_CONFIG);
      window.location.assign(url);
      // Keep busy=true — we're navigating away.
    } catch {
      setBusy(false);
      setError("We couldn't start checkout. Please try again in a moment.");
    }
  }, [items]);

  if (!live) {
    // Design-preview fallback: honest, no fake payment.
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          aria-label="Checkout (not yet available)"
          className={cn(
            "w-full py-3 px-6 rounded-full font-semibold text-sm",
            "bg-espresso/20 text-espresso/50 cursor-not-allowed"
          )}
        >
          Checkout
        </button>
        <p className="text-center text-[11px] text-espresso/50 font-body">
          Secure checkout arrives with Shopify — coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onCheckout}
        disabled={disabled}
        aria-busy={busy}
        aria-label={busy ? "Preparing secure checkout" : "Proceed to secure checkout"}
        className={cn(
          "w-full py-3 px-6 rounded-full font-semibold text-sm",
          "transition-[transform,box-shadow,background-color] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2",
          disabled
            ? "bg-clay/60 text-cream/80 cursor-wait"
            : "bg-clay text-cream hover:bg-clay/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
          variant === "drawer" && "shadow-md"
        )}
      >
        {busy ? "Preparing secure checkout…" : "Checkout"}
      </button>
      {error ? (
        <p role="alert" className="text-center text-[11px] text-leaf font-body">
          {error}
        </p>
      ) : (
        <p className="text-center text-[11px] text-espresso/50 font-body">
          Secure checkout by Shopify · All prices in CAD
        </p>
      )}
    </div>
  );
}
