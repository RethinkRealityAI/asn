"use client";

/**
 * GlassCard — ported from glasscn-components.vercel.app/r/glass-card.json
 * Brand-tinted for Shea Allnaturals (cream/marigold, never blue).
 *
 * Usage:
 *   import { GlassCard, GlassCardFooter } from "@/components/glass/glass-card"
 *
 *   <GlassCard glassVariant="frosted">…</GlassCard>
 *
 * Variants: "clear" | "frosted" | "subtle" | "liquid" | "liquid-refract"
 * For overlay chrome ONLY (nav, cart drawer, hero CTA, filter chips, toasts).
 * Never apply to warm content surfaces or product imagery.
 */

import React from "react";

import {
  Card,
  CardFooter,
} from "@/components/ui/card";
import {
  type FrostGlassVariant,
  type FrostGlassVariantProp,
  glassVariantStyles,
} from "@/lib/glass-variants";
import { cn } from "@/lib/utils";

import { LiquidGlass, type LiquidGlassProps } from "./liquid-glass";

type GlassCardProps = React.ComponentProps<typeof Card> &
  FrostGlassVariantProp & {
    liquidProps?: Omit<LiquidGlassProps, "children">;
    surfaceClassName?: string;
  };

type GlassCardFooterProps = React.ComponentProps<typeof CardFooter> & FrostGlassVariantProp;

function GlassCard({
  className,
  glassVariant = "liquid-refract",
  liquidProps,
  surfaceClassName,
  ...props
}: GlassCardProps) {
  if (glassVariant === "liquid-refract") {
    return (
      <LiquidGlass
        {...liquidProps}
        className={cn("rounded-2xl", surfaceClassName, liquidProps?.className)}
      >
        <Card
          data-slot="glass-card"
          data-glass-variant={glassVariant}
          className={cn("bg-transparent border-0 shadow-none ring-0", className)}
          {...props}
        />
      </LiquidGlass>
    );
  }

  return (
    <Card
      data-slot="glass-card"
      data-glass-variant={glassVariant}
      className={cn(glassVariantStyles[glassVariant], className)}
      {...props}
    />
  );
}

/** Footer variant styles — warm-tinted to match the card surface */
const footerVariantStyles: Record<FrostGlassVariant, string> = {
  clear: "bg-[#F5ECDA]/10 dark:bg-[#2A1E14]/10",
  frosted: "bg-[#F5ECDA]/20 dark:bg-[#2A1E14]/20",
  subtle: "bg-[#F5ECDA]/15 dark:bg-[#F5ECDA]/04",
  liquid:
    "bg-[#F5ECDA]/15 dark:bg-[#F5ECDA]/06 [box-shadow:inset_0_1px_0_0_rgba(245,236,218,0.45)]",
  "liquid-refract": "bg-[#F5ECDA]/10 dark:bg-[#F5ECDA]/04",
};

function GlassCardFooter({
  className,
  glassVariant = "liquid-refract",
  ...props
}: GlassCardFooterProps) {
  return (
    <CardFooter
      data-glass-variant={glassVariant}
      className={cn(footerVariantStyles[glassVariant], className)}
      {...props}
    />
  );
}

export { GlassCard, GlassCardFooter };
