"use client";

/**
 * VariantSwatch
 *
 * Renders a product's "Size" option values as selectable pills.
 * Keyboard-accessible: roving tabindex + arrow keys.
 * role="radiogroup" / role="radio" / aria-checked.
 * Never blue. Uses brand clay/cream/espresso palette.
 */

import { useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface VariantSwatchProps {
  values: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function VariantSwatch({
  values,
  value,
  onChange,
  className,
}: VariantSwatchProps) {
  if (!values || values.length === 0) return null;

  // Filter out "Default Title" — single-variant products shouldn't show a swatch
  const displayValues = values.filter((v) => v !== "Default Title");
  if (displayValues.length === 0) return null;

  const containerRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    const pills = containerRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="radio"]'
    );
    if (!pills || pills.length === 0) return;

    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = (idx + 1) % pills.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = (idx - 1 + pills.length) % pills.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = pills.length - 1;
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(displayValues[idx]);
      return;
    } else {
      return;
    }

    pills[next].focus();
    onChange(displayValues[next]);
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Size"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {displayValues.map((v, idx) => {
        const isSelected = v === value;
        return (
          <button
            key={v}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(v)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all outline-none",
              "focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1",
              isSelected
                ? "border-2 border-clay bg-cream text-espresso"
                : "border border-espresso/30 bg-transparent text-espresso/70 hover:border-espresso/60 hover:text-espresso"
            )}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
