import { permanentRedirect } from "next/navigation";

/**
 * /about — merged into /about/our-story.
 *
 * The overview page duplicated the story lede, paragraphs and values, then
 * teased mission/beliefs. All of that now lives on Our Story, so this route
 * permanently redirects rather than presenting two near-identical pages
 * (which also split SEO signals between them).
 */
export default function AboutPage() {
  permanentRedirect("/about/our-story");
}
