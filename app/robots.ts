import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRODUCTION_SITE } from "@/lib/seo/site";

/**
 * robots.txt
 *
 * Two jobs:
 *  1. Keep deploy previews out of the index (duplicate content would compete
 *     with the real domain), while letting production be crawled freely.
 *  2. Explicitly welcome AI/LLM crawlers. Several of these (Google-Extended,
 *     Applebot-Extended) are opt-OUT controls for AI training/grounding — if
 *     you never mention them you're fine, but naming them with Allow makes the
 *     intent explicit and survives future default changes. The retrieval bots
 *     (OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot) are what fetch
 *     pages to cite in AI answers, so they matter for being *quoted* in
 *     ChatGPT / Perplexity / Claude results.
 *
 * Only genuinely useless-to-index routes are disallowed — the cart is
 * per-visitor state and Next's internals aren't content.
 */

/** Crawlers that power AI answers, assistants and AI training corpora. */
const AI_CRAWLERS = [
  "GPTBot", // OpenAI — training
  "OAI-SearchBot", // OpenAI — ChatGPT Search index
  "ChatGPT-User", // OpenAI — live user-triggered fetch
  "ClaudeBot", // Anthropic — crawling
  "Claude-User", // Anthropic — user-triggered fetch
  "Claude-SearchBot", // Anthropic — search indexing
  "anthropic-ai",
  "PerplexityBot", // Perplexity — index
  "Perplexity-User", // Perplexity — live fetch
  "Google-Extended", // Google — Gemini / AI Overviews grounding
  "Applebot", // Apple — Siri / Spotlight
  "Applebot-Extended", // Apple — AI training
  "Amazonbot",
  "Bingbot",
  "DuckAssistBot",
  "CCBot", // Common Crawl — feeds many open models
  "cohere-ai",
  "MistralAI-User",
  "meta-externalagent", // Meta AI
  "YouBot",
];

/** Paths with no search value. */
const DISALLOW = ["/api/", "/_next/", "/cart"];

export default function robots(): MetadataRoute.Robots {
  // Non-production origins (deploy previews, branch deploys): block everything.
  if (!IS_PRODUCTION_SITE) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      // Everyone else — crawl the site, skip the noise.
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      // AI + assistant crawlers, named explicitly.
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
