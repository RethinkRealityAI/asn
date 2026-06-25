"use client";

/**
 * GlassPopoverContent — ported from glasscn-components.vercel.app/r/glass-popover.json
 * Brand-tinted for Shea Allnaturals (cream/marigold, never blue).
 *
 * Usage:
 *   import { GlassPopoverContent } from "@/components/glass/glass-popover"
 *   import { Popover } from "@/components/ui/popover"
 *
 *   <Popover>
 *     <Popover.Trigger>…</Popover.Trigger>
 *     <GlassPopoverContent glassVariant="frosted">…</GlassPopoverContent>
 *   </Popover>
 *
 * Variants: "clear" | "frosted" | "subtle" | "liquid" | "liquid-refract"
 * For overlay chrome ONLY (filter chips, cart hints, tooltips).
 */

import React from "react";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { PopoverContent } from "@/components/ui/popover";
import { type FrostGlassVariantProp, glassVariantStyles } from "@/lib/glass-variants";
import { cn } from "@/lib/utils";

import { LiquidGlass } from "./liquid-glass";

type GlassPopoverContentProps = React.ComponentProps<typeof PopoverContent> &
  FrostGlassVariantProp;

function GlassPopoverContent({
  className,
  glassVariant = "liquid-refract",
  ...props
}: GlassPopoverContentProps) {
  if (glassVariant === "liquid-refract") {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          align={props.align}
          alignOffset={props.alignOffset}
          side={props.side}
          sideOffset={props.sideOffset}
          className="isolate z-50"
        >
          <LiquidGlass className="rounded-lg">
            <PopoverPrimitive.Popup
              data-slot="glass-popover-content"
              data-glass-variant={glassVariant}
              className={cn(
                "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg p-2.5 text-sm text-espresso outline-hidden duration-100 bg-transparent shadow-none ring-0 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                className,
              )}
              {...props}
            />
          </LiquidGlass>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    );
  }

  return (
    <PopoverContent
      data-slot="glass-popover-content"
      data-glass-variant={glassVariant}
      className={cn("text-espresso", glassVariantStyles[glassVariant], className)}
      {...props}
    />
  );
}

export { GlassPopoverContent };
