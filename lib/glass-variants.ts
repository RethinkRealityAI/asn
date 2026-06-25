/**
 * glasscn glass-variants — ported from glasscn-components.vercel.app/r/glass-variants.json
 * Brand-tinted for Shea Allnaturals "Sun & Soil" palette:
 *   - frosted / clear / subtle: warm cream tint (bg-[#F5ECDA]/…) instead of cold white/grey
 *   - liquid: replaces the upstream pink bottom gradient with marigold (#EBA52C) warm bottom tint
 *   - liquid-refract: passthrough (LiquidGlass wrapper handles its own look)
 *
 * NEVER introduce blue. All variants must read warm (cream/marigold) not cold/blue-grey.
 */

export type FrostGlassVariant = "clear" | "frosted" | "subtle" | "liquid" | "liquid-refract";
export type FrostGlassVariantProp = { glassVariant?: FrostGlassVariant };

export const liquidRefractStyles = "bg-transparent border-0 shadow-none";

/**
 * Brand-tinted glass variant styles.
 * Each variant layers backdrop-blur + a warm cream/marigold tint.
 */
export const glassVariantStyles: Record<FrostGlassVariant, string> = {
  // Clear: barely-there, cream-tinted
  clear: [
    "backdrop-blur-[2px] backdrop-saturate-[1.9]",
    "bg-[#F5ECDA]/25 dark:bg-[#2A1E14]/25",
    "border border-[#F5ECDA]/50 dark:border-[#F5ECDA]/12",
    "shadow-[0_1px_12px_rgba(42,30,20,0.05)] dark:shadow-[0_1px_12px_rgba(42,30,20,0.20)]",
  ].join(" "),

  // Frosted: strong blur, warm cream panel — flagship glass for nav/drawer/modal
  frosted: [
    "backdrop-blur-[16px] backdrop-saturate-[1.6]",
    "bg-[#F5ECDA]/55 dark:bg-[#2A1E14]/40",
    "border border-[#F5ECDA]/60 dark:border-[#F5ECDA]/10",
    "shadow-[0_2px_20px_rgba(42,30,20,0.08)] dark:shadow-[0_2px_20px_rgba(42,30,20,0.30)]",
  ].join(" "),

  // Subtle: whisper-light cream — filter chips, toasts
  subtle: [
    "backdrop-blur-[4px] backdrop-saturate-[1.5]",
    "bg-[#F5ECDA]/30 dark:bg-[#F5ECDA]/06",
    "border border-[#EBA52C]/10 dark:border-[#EBA52C]/08",
    "shadow-sm",
  ].join(" "),

  // Liquid: animated glass with marigold warm-bottom tint (replaces upstream pink)
  liquid: [
    "backdrop-blur-[12px] backdrop-saturate-[1.8] backdrop-brightness-[1.05]",
    "dark:backdrop-saturate-[1.6] dark:backdrop-brightness-[0.95]",
    "bg-[#F5ECDA]/10 dark:bg-[#F5ECDA]/04",
    // Warm highlight: cream top-left radial + marigold bottom-right radial + cream vertical wash
    "[background-image:radial-gradient(120%_85%_at_15%_8%,rgba(245,236,218,0.55)_0%,rgba(245,236,218,0.18)_38%,rgba(245,236,218,0)_70%),radial-gradient(110%_80%_at_85%_100%,rgba(235,165,44,0.22)_0%,rgba(245,236,218,0)_60%),linear-gradient(180deg,rgba(245,236,218,0.28)_0%,rgba(245,236,218,0.12)_100%)]",
    "dark:[background-image:radial-gradient(120%_85%_at_15%_8%,rgba(245,236,218,0.18)_0%,rgba(245,236,218,0.05)_40%,rgba(245,236,218,0)_70%),radial-gradient(110%_80%_at_85%_100%,rgba(235,165,44,0.12)_0%,rgba(42,30,20,0)_60%),linear-gradient(180deg,rgba(245,236,218,0.06)_0%,rgba(42,30,20,0.18)_100%)]",
    "[background-size:200%_200%,180%_180%,100%_100%]",
    "[background-repeat:no-repeat]",
    // Bevel/specular highlights with warm tones
    "shadow-[inset_0_1px_0_0_rgba(245,236,218,0.65),inset_0_-12px_24px_-10px_rgba(235,165,44,0.30),inset_1px_0_0_0_rgba(245,236,218,0.22),inset_-1px_0_0_0_rgba(245,236,218,0.18),0_24px_60px_-18px_rgba(42,30,20,0.25),0_8px_24px_-8px_rgba(42,30,20,0.15)]",
    "dark:shadow-[inset_0_1px_0_0_rgba(245,236,218,0.30),inset_0_-14px_28px_-10px_rgba(235,165,44,0.18),inset_1px_0_0_0_rgba(245,236,218,0.10),inset_-1px_0_0_0_rgba(245,236,218,0.08),0_28px_70px_-18px_rgba(42,30,20,0.55),0_10px_28px_-10px_rgba(42,30,20,0.40)]",
    "border border-[#F5ECDA]/45 dark:border-[#F5ECDA]/10",
    "animate-[liquid-drift_18s_ease-in-out_infinite] motion-reduce:animate-none",
    "[will-change:background-position]",
  ].join(" "),

  // Liquid-refract: passthrough — LiquidGlass wrapper applies SVG displacement
  "liquid-refract": "",
};
