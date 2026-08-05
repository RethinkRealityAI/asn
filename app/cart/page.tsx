/**
 * /cart — Server shell that exports metadata.
 * Cart content is delegated to CartPageClient (client component).
 */

import type { Metadata } from "next";
import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your cart and proceed to checkout.",
};

export default function CartPage() {
  return <CartPageClient />;
}
