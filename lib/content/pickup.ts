/**
 * Local pickup — an ALTERNATIVE fulfilment option shown in the cart / checkout
 * summary alongside shipping. Shipping remains the default method; pickup is
 * offered as a free local option. One source of truth so the cart page and the
 * cart drawer stay in sync.
 */

export const PICKUP = {
  /** Summary-row label + price */
  label: "Local pickup",
  price: "Free",
  /** Studio address for collection */
  address: "220 Bayview Dr, Unit 18, Barrie ON",
  /** Which day orders can be collected */
  day: "Fridays",
  /** Call-ahead number */
  phone: "705-719-2750",
  phoneHref: "tel:+17057192750",
  /** Pickup coordination email */
  email: "Timothy@allnaturalscosmetics.ca",
  emailHref: "mailto:Timothy@allnaturalscosmetics.ca",
} as const;
