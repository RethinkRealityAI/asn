# Glass Layer — Shea Allnaturals

Glassmorphism component layer, ported from [glasscn](https://glasscn-components.vercel.app/) (MIT).
Brand-tinted for the Shea Allnaturals "Sun & Soil" palette: cream/marigold/espresso — **never blue**.

---

## Installed components

| File | Export(s) | Source registry item |
|---|---|---|
| `components/glass/glass-card.tsx` | `GlassCard`, `GlassCardFooter` | `@glasscn/glass-card` |
| `components/glass/glass-button.tsx` | `GlassButton` | `@glasscn/glass-button` |
| `components/glass/glass-popover.tsx` | `GlassPopoverContent` | `@glasscn/glass-popover` |
| `components/glass/liquid-glass.tsx` | `LiquidGlass` | `@glasscn/liquid-glass` |
| `lib/glass-variants.ts` | `glassVariantStyles`, `FrostGlassVariant` | `@glasscn/glass-variants` |

A base `components/ui/card.tsx` (pure div, no Radix) was added as a dependency of `GlassCard`.

---

## Five variants

All variants are available via the `glassVariant` prop:

| Variant | Effect | Brand tint |
|---|---|---|
| `frosted` | Strong `backdrop-blur-[16px]`, warm cream panel | `bg-[#F5ECDA]/55` — flagship for nav/drawer/modal |
| `clear` | Minimal `backdrop-blur-[2px]` | `bg-[#F5ECDA]/25` — lightest chrome |
| `subtle` | Light `backdrop-blur-[4px]` | `bg-[#F5ECDA]/30` — filter chips, toasts |
| `liquid` | Animated `backdrop-blur-[12px]` + marigold bottom glow | `bg-[#F5ECDA]/10` + marigold radial bottom gradient |
| `liquid-refract` | SVG `feDisplacementMap` refractive lens (Chromium) | Cream bevel via `LiquidGlass` wrapper |

Default variant: `liquid-refract`.

---

## Brand-tint approach

The upstream glasscn library uses cold white/black semi-transparent fills and (in the `liquid` variant) a pink bottom tint. We override every fill with brand-warm values:

- **Base tint:** `#F5ECDA` (cream) at varying opacities instead of `rgba(255,255,255,…)`
- **Dark tint:** `#2A1E14` (espresso) instead of `rgba(0,0,0,…)`
- **Liquid bottom glow:** `rgba(235,165,44,…)` (marigold) replaces the upstream pink `rgba(255,210,230,…)`
- **Bevel shadows:** warm espresso `rgba(42,30,20,…)` replaces cold slate `rgba(15,23,42,…)`
- **LiquidGlass bevel:** cream highlight + espresso shadow (no white/black)

No blue appears in any variant at any opacity. The `liquid-drift` keyframe animation is defined in `app/globals.css`.

---

## Usage

```tsx
import { GlassCard, GlassCardFooter } from "@/components/glass/glass-card"
import { GlassButton } from "@/components/glass/glass-button"
import { GlassPopoverContent } from "@/components/glass/glass-popover"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Frosted nav panel
<GlassCard glassVariant="frosted">
  <CardHeader><CardTitle>Nav</CardTitle></CardHeader>
  <CardContent>…</CardContent>
  <GlassCardFooter glassVariant="frosted">…</GlassCardFooter>
</GlassCard>

// Hero CTA button
<GlassButton glassVariant="liquid">Shop Now</GlassButton>

// Filter chip popover
<GlassPopoverContent glassVariant="subtle">…</GlassPopoverContent>
```

---

## Coexistence with shadcn/Base UI

- glasscn uses `@base-ui/react` (same as our shadcn install). No duplicate installs, no React version conflict.
- Build tested: `npm run build` passes clean with `GlassCard (frosted)` + `shadcn Dialog` rendered together on the same page.
- No peer-dep errors. No console warnings about duplicate React or Base UI instances.

---

## Scope — overlay chrome ONLY

Glass is for **floating/overlay surfaces**:

- Navigation bar (sticky/floating)
- Cart drawer
- Hero CTA buttons
- Filter chips / popovers
- Toasts / notifications

**Never apply glass to:**
- Warm content surfaces (product cards, body copy blocks)
- Product imagery or photography
- Any surface that already has a warm colour fill

The warm palette lives on content. Glass is the overlay that floats on top of it.
