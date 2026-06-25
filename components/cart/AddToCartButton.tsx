"use client";

/**
 * AddToCartButton
 *
 * Adds a product/variant to the cart and opens the drawer.
 * Shows a brief "Added ✓" label as feedback.
 *
 * Wrapped in MagneticButton on pointer:fine + motion-ok devices.
 * Uses the clay Button for consistent styling. Never blue.
 */

import { useState, useCallback } from "react";
import type { Product, Variant } from "@/lib/shopify/types";
import { useCart } from "./CartProvider";
import { MagneticButton } from "@/components/chrome/MagneticButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: Product;
  variant: Variant;
  qty?: number;
  className?: string;
  label?: string;
}

/** Duration (ms) to show the "Added ✓" affordance */
const ADDED_DURATION = 1400;

export function AddToCartButton({
  product,
  variant,
  qty = 1,
  className,
  label = "Add to cart",
}: AddToCartButtonProps) {
  const { add, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = useCallback(() => {
    add(product, variant, qty);
    openCart();
    // Brief "Added ✓" affordance
    setAdded(true);
    const t = setTimeout(() => setAdded(false), ADDED_DURATION);
    return () => clearTimeout(t);
  }, [add, openCart, product, variant, qty]);

  return (
    <MagneticButton className={cn("w-full", className)}>
      <Button
        size="sm"
        variant="default"
        onClick={handleClick}
        aria-label={added ? `${label} — added` : label}
        className={cn(
          "w-full transition-all",
          added && "bg-leaf/80 hover:bg-leaf/80",
        )}
        disabled={!variant.available}
      >
        {added ? "Added ✓" : label}
      </Button>
    </MagneticButton>
  );
}
