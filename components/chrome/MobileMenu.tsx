"use client";

/**
 * MobileMenu — slide-in frosted-glass nav overlay for small screens.
 *
 * Opens as a full-width panel anchored to the top of the viewport.
 * Uses the "frosted" glass variant treatment matched to the header.
 * Closes on: backdrop click, Escape key, or any link click.
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "./Wordmark";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";

const NAV_LINKS = [
  { label: "Shop", href: "#" },
  { label: "Collections", href: "#" },
  { label: "Our Story", href: "#" },
  { label: "Wholesale", href: "#" },
  { label: "Journal", href: "#" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const reducedMotion = usePrefersReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button when menu opens
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const panelVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : -12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: WARM, duration: DUR.fast },
    },
    exit: {
      opacity: 0,
      y: reducedMotion ? 0 : -8,
      transition: { ease: WARM_OUT, duration: 0.22 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            aria-hidden="true"
            className="fixed inset-0 z-[49] bg-espresso/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : DUR.fast, ease: WARM }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed inset-x-0 top-0 z-50 pt-safe"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Frosted glass panel */}
            <div
              className={[
                // frosted glass treatment (matches header)
                "backdrop-blur-[16px] backdrop-saturate-[1.6]",
                "bg-[#F5ECDA]/90",
                "border-b border-[#F5ECDA]/60",
                "shadow-[0_4px_24px_rgba(42,30,20,0.12)]",
              ].join(" ")}
            >
              {/* Header row */}
              <div className="flex items-center justify-between px-6 h-16">
                <a
                  href="/"
                  aria-label="Shea Allnaturals home"
                  onClick={onClose}
                >
                  <Wordmark className="text-espresso" size="text-xl" />
                </a>
                <button
                  ref={closeButtonRef}
                  aria-label="Close navigation menu"
                  onClick={onClose}
                  className={[
                    "p-2 rounded-full text-espresso/70",
                    "hover:text-espresso hover:bg-espresso/8",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1",
                    "transition-colors",
                  ].join(" ")}
                >
                  {/* X icon */}
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav aria-label="Mobile navigation links">
                <ul className="px-4 pb-8 space-y-1">
                  {NAV_LINKS.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        onClick={onClose}
                        className={[
                          "flex items-center px-3 py-3.5 rounded-xl",
                          "text-lg font-semibold tracking-tight text-espresso",
                          "hover:bg-espresso/8 hover:text-espresso",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-inset",
                          "transition-colors",
                        ].join(" ")}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Divider + secondary actions */}
                <div className="border-t border-espresso/10 mx-4 mb-4" />
                <div className="px-4 pb-8 flex gap-3">
                  <a
                    href="#"
                    onClick={onClose}
                    className="flex-1 text-center rounded-full bg-clay text-cream font-semibold px-6 py-3 text-sm hover:bg-orange transition-colors"
                  >
                    Shop now
                  </a>
                  <a
                    href="#"
                    onClick={onClose}
                    className="flex-1 text-center rounded-full border border-espresso/30 text-espresso font-semibold px-6 py-3 text-sm hover:bg-espresso/5 transition-colors"
                  >
                    Our story
                  </a>
                </div>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// WARM_OUT for exit (defined here to avoid import cycle)
const WARM_OUT = [0.22, 1, 0.36, 1] as const;
