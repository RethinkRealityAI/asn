/**
 * ComingSoon — shared branded "coming soon" component.
 *
 * Used by stub pages (Our Story, Journal, Ingredients, Contact, Wholesale).
 * Tasteful: wordmark, one line of copy, link back to /shop.
 * Never blue. AA contrast.
 */

import Link from "next/link";
import { Wordmark } from "@/components/chrome/Wordmark";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 pt-[calc(3.5rem+2rem)]">
      <div className="text-center space-y-6 max-w-md">
        <Wordmark className="text-espresso mx-auto" size="text-2xl" />

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold text-espresso">
            {title}
          </h1>
          <p className="font-body text-sm text-espresso/60 leading-relaxed">
            {description ??
              "We're still crafting this page. Come back soon — good things take time."}
          </p>
        </div>

        {/* Marigold divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-marigold/40" />
          <span className="text-marigold text-xs font-semibold uppercase tracking-widest">
            Coming soon
          </span>
          <div className="h-px w-12 bg-marigold/40" />
        </div>

        <Link
          href="/shop"
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-full",
            "bg-clay text-cream font-semibold text-sm",
            "hover:bg-orange transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2",
          )}
        >
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
