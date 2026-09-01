/**
 * What the hosted Shopify checkout asks the shopper for.
 *
 * Email and phone are BOTH mandatory: the checkout is configured with
 * "Customer contact method = Email" and "Shipping address phone number =
 * Required", so an order cannot be completed without either one.
 *
 * The cart drawer and the cart page both surface this before the handoff, so
 * the wording lives here rather than being duplicated in two components where
 * the two copies would drift apart.
 */
export const CHECKOUT_CONTACT = {
  /** The requirement itself — stated plainly, shown at full readable weight. */
  note: "Email and phone number are both required at checkout.",
  /** Why we ask, so it reads as a reason rather than a hurdle. */
  reason:
    "We use them only to confirm your order, send tracking, and reach you about delivery or pickup.",
} as const;
