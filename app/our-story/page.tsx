import { redirect } from "next/navigation";

/** Our Story moved under the About section. */
export default function OurStoryRedirect() {
  redirect("/about/our-story");
}
