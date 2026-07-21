"use client";

/**
 * AboutSubNav — the lateral navigation that sits at the top of every About
 * subpage so visitors can hop straight from one section to the next without
 * going back to the hub. A horizontally-scrollable pill row; the current
 * section is highlighted. Sticks just under the fixed header on scroll.
 *
 * Warm palette only, AA contrast, reduced-motion safe (no motion here — it's
 * a plain sticky bar).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ABOUT_SECTIONS } from "@/lib/content/about";
import { cn } from "@/lib/utils";

export function AboutSubNav() {
  const pathname = usePathname();

  const items = [
    { href: "/about", label: "Overview" },
    ...ABOUT_SECTIONS.map((s) => ({ href: `/about/${s.slug}`, label: s.label })),
  ];

  return (
    <nav
      aria-label="About sections"
      className="sticky top-[5.75rem] z-30 border-b border-espresso/08 bg-white/85 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <ul className="flex gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-green text-cream"
                      : "text-espresso/70 hover:bg-espresso/8 hover:text-espresso",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
