"use client";

/**
 * CheckoutButton — starts a real Shopify checkout.
 *
 * Posts the cart lines to /api/checkout, which creates a Shopify cart
 * server-side and returns the hosted checkout URL, then redirects there.
 * Shopify handles payment, tax, shipping and order confirmation.
 *
 * States: idle → submitting → redirecting, or an inline error the customer can
 * act on. Never silently fails.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  /** Full-width block button (cart page / drawer footer). */
  className?: string;
}

export function CheckoutButton({ className }: CheckoutButtonProps) {
  const { items } = useCart();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  const disabled = status === "loading" || items.length === 0;

  async function handleCheckout() {
    if (disabled) return;
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });

      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Could not start checkout. Please try again.");
        setStatus("idle");
        return;
      }

      // Hand off to Shopify's hosted checkout. Keep the button in its loading
      // state — the page is on its way out.
      window.location.assign(data.url);
    } catch {
      setError("Network error — please check your connection and try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleCheckout}
        disabled={disabled}
        size="lg"
        aria-busy={status === "loading"}
        className={cn(
          "w-full rounded-full bg-clay font-semibold text-cream hover:bg-orange",
          "disabled:cursor-not-allowed disabled:opacity-70",
          className,
        )}
      >
        {status === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 animate-spin motion-reduce:animate-none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Starting checkout…
          </span>
        ) : (
          "Checkout"
        )}
      </Button>

      {error && (
        <p role="alert" className="text-xs leading-relaxed text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
