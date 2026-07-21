import { redirect } from "next/navigation";

/** Ingredients moved under the About section (now searchable common ↔ INCI). */
export default function IngredientsRedirect() {
  redirect("/about/our-ingredients");
}
