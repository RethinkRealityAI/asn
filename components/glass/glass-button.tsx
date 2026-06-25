"use client";

/**
 * GlassButton — ported from glasscn-components.vercel.app/r/glass-button.json
 * Brand-tinted for Shea Allnaturals (cream/marigold, never blue).
 *
 * Usage:
 *   import { GlassButton } from "@/components/glass/glass-button"
 *
 *   <GlassButton glassVariant="frosted">Add to Cart</GlassButton>
 *
 * Variants: "clear" | "frosted" | "subtle" | "liquid" | "liquid-refract"
 * For overlay chrome ONLY (hero CTA, nav actions, floating buttons).
 * Never on standard content surfaces.
 */

import React from "react";

import { Button } from "@/components/ui/button";
import { type FrostGlassVariantProp, glassVariantStyles } from "@/lib/glass-variants";
import { cn } from "@/lib/utils";

import { LiquidGlass } from "./liquid-glass";

type GlassButtonProps = React.ComponentProps<typeof Button> & FrostGlassVariantProp;

function GlassButton({
  className,
  glassVariant = "liquid-refract",
  ...props
}: GlassButtonProps) {
  if (glassVariant === "liquid-refract") {
    return (
      <LiquidGlass>
        <Button
          data-slot="glass-button"
          data-glass-variant={glassVariant}
          className={cn(
            "text-espresso cursor-pointer bg-transparent border-0 shadow-none",
            className,
          )}
          {...props}
        />
      </LiquidGlass>
    );
  }

  return (
    <Button
      data-slot="glass-button"
      data-glass-variant={glassVariant}
      className={cn(
        "text-espresso cursor-pointer",
        glassVariantStyles[glassVariant],
        className,
      )}
      {...props}
    />
  );
}

export { GlassButton };
