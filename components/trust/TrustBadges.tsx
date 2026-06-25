"use client";

/**
 * TrustBadges — staggered reveal of the 4 credential roundel badges.
 *
 * Uses framer-motion whileInView for the stagger. prefers-reduced-motion:
 * badges render immediately with no animation.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";

const BADGES = [
  { src: "/badges/eco-friendly.webp",      label: "Eco-Friendly"       },
  { src: "/badges/fair-trade.webp",        label: "Fair Trade"         },
  { src: "/badges/family-owned.webp",      label: "Family Owned"       },
  { src: "/badges/supporting-farmers.webp",label: "Supporting Farmers" },
];

export function TrustBadges() {
  const reduced = usePrefersReducedMotion();

  return (
    <ul className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
      {BADGES.map(({ src, label }, i) => {
        const inner = (
          <li key={label} className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <Image
                src={src}
                alt={label}
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-espresso/60">
              {label}
            </span>
          </li>
        );

        if (reduced) return inner;

        return (
          <motion.li
            key={label}
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{
              ease: WARM,
              duration: DUR.base,
              delay: i * 0.1,
            }}
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <Image
                src={src}
                alt={label}
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-espresso/60">
              {label}
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
}
