"use client";

/**
 * MotionAccordion
 *
 * Accessible accordion with animated height (framer-motion).
 * - Reduced-motion: instant open/close (no animation)
 * - Keyboard: Enter/Space toggles; arrow keys move between items (roving focus)
 * - ARIA: button headers with aria-expanded; region panels with aria-labelledby
 * - Never blue. Brand espresso/marigold palette.
 *
 * NOTE: No Instagram embed — per PRD §13.
 */

import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  /** Rendered as HTML (sanitized) or plain text if htmlContent is absent */
  content?: string;
  htmlContent?: string;
}

interface MotionAccordionProps {
  items: AccordionItem[];
  /** Allow multiple open at once? Default: false (exclusive) */
  multi?: boolean;
  className?: string;
}

export function MotionAccordion({
  items,
  multi = false,
  className,
}: MotionAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set([items[0]?.id]));
  const reducedMotion = usePrefersReducedMotion();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multi) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      buttonRefs.current[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      buttonRefs.current[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttonRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttonRefs.current[items.length - 1]?.focus();
    }
  }

  return (
    <div className={cn("divide-y divide-espresso/10 border-y border-espresso/10", className)}>
      {items.map((item, idx) => {
        const isOpen = openIds.has(item.id);
        const headerId = `accordion-header-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id}>
            {/* ── Header button ─────────────────────────────────────────── */}
            <h3>
              <button
                ref={(el) => {
                  buttonRefs.current[idx] = el;
                }}
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={cn(
                  "flex w-full items-center justify-between gap-4",
                  "py-4 px-0 text-left outline-none",
                  "text-sm font-semibold text-espresso",
                  "transition-colors duration-150",
                  "hover:text-clay",
                  "focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 rounded-sm"
                )}
              >
                <span>{item.title}</span>
                {/* Animated chevron */}
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { ease: WARM, duration: DUR.fast }
                  }
                  className="flex-shrink-0 text-espresso/50"
                >
                  <ChevronIcon />
                </motion.span>
              </button>
            </h3>

            {/* ── Animated panel ────────────────────────────────────────── */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.section
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={
                    reducedMotion
                      ? { opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { ease: WARM, duration: DUR.fast }
                  }
                  className="overflow-hidden"
                >
                  <div className="pb-5 text-sm text-espresso/75 leading-relaxed space-y-2">
                    {item.htmlContent ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: item.htmlContent }}
                        className="prose-sm prose-p:text-espresso/75 prose-ul:text-espresso/75 max-w-none"
                      />
                    ) : (
                      <p>{item.content}</p>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 6l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
