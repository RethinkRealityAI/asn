"use client";

/**
 * CartPageClient — full cart page UI.
 *
 * Two-column on desktop: line items (left) + sticky order summary (right).
 * Empty state: friendly message + link to /shop.
 *
 * Checkout is a clearly-labeled stub (no payment simulated).
 * All prices in CAD. Never blue. AA contrast. Reduced-motion safe.
 */

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { CheckoutButton } from "@/components/cart/CheckoutButton";
import { cn } from "@/lib/utils";

// ── Money formatter ───────────────────────────────────────────────────────────

const cadFmt = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmt(amount: number) {
  return cadFmt.format(amount);
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Subtotal threshold for free shipping (CAD) */
const FREE_SHIPPING_THRESHOLD = 75;

/** Ontario HST rate */
const HST_RATE = 0.13;

// ── CartPageClient ────────────────────────────────────────────────────────────

export function CartPageClient() {
  const { items, subtotal, update, remove } = useCart();

  const subtotalAmount = subtotal.amount;
  const shippingFree = subtotalAmount >= FREE_SHIPPING_THRESHOLD;
  const taxEst = subtotalAmount * HST_RATE;
  const totalEst = subtotalAmount + taxEst;

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2rem)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-espresso/50">
            <li>
              <Link href="/" className="hover:text-espresso transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-espresso/80 font-medium">
              Cart
            </li>
          </ol>
        </nav>

        <h1 className="font-display text-3xl font-semibold text-espresso mb-8">
          Your cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* ── Left: line items ────────────────────────────────────────── */}
          <section aria-label="Cart items">
            <ul className="divide-y divide-espresso/10">
              {items.map((item) => (
                <CartLineItem
                  key={item.variantId}
                  item={item}
                  onUpdate={(qty) => update(item.variantId, qty)}
                  onRemove={() => remove(item.variantId)}
                />
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href="/shop"
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-medium text-espresso/70",
                  "hover:text-espresso transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold rounded-sm",
                )}
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Continue shopping
              </Link>
            </div>
          </section>

          {/* ── Right: sticky order summary ─────────────────────────────── */}
          <aside
            aria-label="Order summary"
            className={cn(
              "lg:sticky lg:top-[calc(3.5rem+2rem+1rem)]",
              // cream/subtle glass card
              "rounded-2xl border border-espresso/10",
              "backdrop-blur-[12px] backdrop-saturate-[1.4]",
              "bg-[#F5ECDA]/80",
              "[background-image:radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(235,165,44,0.12)_0%,transparent_70%)]",
              "shadow-[0_4px_24px_rgba(42,30,20,0.08)]",
              "p-6 space-y-5",
            )}
          >
            <h2 className="font-display text-lg font-semibold text-espresso">
              Order summary
            </h2>

            <div className="space-y-3 text-sm">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-espresso/70 font-body">Subtotal</span>
                <span className="font-semibold text-espresso tabular-nums">
                  {fmt(subtotalAmount)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex items-center justify-between">
                <span className="text-espresso/70 font-body">Shipping</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    shippingFree ? "text-green" : "text-espresso",
                  )}
                >
                  {shippingFree ? "Free" : "Calculated at checkout"}
                </span>
              </div>

              {/* Free shipping nudge */}
              {!shippingFree && (
                <p className="text-xs text-espresso/50 font-body">
                  Add{" "}
                  <span className="font-medium text-espresso/70">
                    {fmt(FREE_SHIPPING_THRESHOLD - subtotalAmount)}
                  </span>{" "}
                  more to unlock free Canada-wide shipping.
                </p>
              )}

              {/* Tax (estimated) */}
              <div className="flex items-center justify-between">
                <span className="text-espresso/70 font-body">
                  Tax (HST, estimated)
                </span>
                <span className="font-semibold text-espresso tabular-nums">
                  {fmt(taxEst)}
                </span>
              </div>

              {/* Divider + Total */}
              <div className="border-t border-espresso/10 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-espresso">
                    Total
                    <span className="ml-1 text-xs font-body font-normal text-espresso/40">
                      estimated
                    </span>
                  </span>
                  <span className="font-display text-xl font-bold text-espresso tabular-nums">
                    {fmt(totalEst)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout — Shopify hosted checkout */}
            <CheckoutButton variant="page" />

            {/* Microcopy */}
            <p className="text-center text-[11px] text-espresso/40 font-body">
              Secure checkout · All prices in CAD
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ── CartLineItem ──────────────────────────────────────────────────────────────

interface CartLineItemProps {
  item: {
    variantId: string;
    quantity: number;
    product: {
      title: string;
      handle: string;
      images: { url: string; altText: string }[];
    };
    variant: { title: string; price: { amount: number } };
  };
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}

function CartLineItem({ item, onUpdate, onRemove }: CartLineItemProps) {
  const img = item.product.images[0];
  const linePrice = item.variant.price.amount * item.quantity;
  const isDefaultTitle = item.variant.title === "Default Title";

  return (
    <li className="flex gap-4 py-6">
      {/* Product image — links to PDP */}
      <Link
        href={`/products/${item.product.handle}`}
        aria-label={`View ${item.product.title}`}
        className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold rounded-xl"
      >
        <div
          className={cn(
            "relative w-24 h-24 rounded-xl overflow-hidden",
            "bg-[#FAF5EC] border border-espresso/10",
          )}
        >
          {img ? (
            <Image
              src={img.url}
              alt={img.altText || item.product.title}
              fill
              sizes="96px"
              className="object-contain p-2"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-espresso/20 text-xs">–</span>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <Link
          href={`/products/${item.product.handle}`}
          className={cn(
            "font-display text-base font-semibold text-espresso leading-snug",
            "hover:text-clay transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold rounded-sm",
          )}
        >
          {item.product.title}
        </Link>

        {!isDefaultTitle && (
          <p className="text-xs text-espresso/60 font-body">
            {item.variant.title}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <QuantityStepper
            qty={item.quantity}
            onDecrement={() => onUpdate(item.quantity - 1)}
            onIncrement={() => onUpdate(item.quantity + 1)}
          />

          <div className="flex items-center gap-3">
            <span className="font-body text-sm font-semibold text-espresso tabular-nums">
              {fmt(linePrice)}
            </span>
            <button
              onClick={onRemove}
              aria-label={`Remove ${item.product.title} from cart`}
              className={cn(
                "p-1.5 rounded-full",
                "text-espresso/40 hover:text-espresso/80 hover:bg-espresso/8",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                "transition-colors",
              )}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

// ── QuantityStepper ───────────────────────────────────────────────────────────

interface QtyStepperProps {
  qty: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

function QuantityStepper({ qty, onDecrement, onIncrement }: QtyStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full",
        "border border-espresso/15 bg-cream/60",
        "overflow-hidden",
      )}
      role="group"
      aria-label="Quantity"
    >
      <button
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center w-8 h-8",
          "text-espresso/70 hover:text-espresso hover:bg-espresso/8",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-marigold",
          "transition-colors text-base font-medium",
        )}
      >
        −
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="min-w-[2rem] text-center font-body text-sm font-semibold text-espresso tabular-nums select-none"
      >
        {qty}
      </span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center w-8 h-8",
          "text-espresso/70 hover:text-espresso hover:bg-espresso/8",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-marigold",
          "transition-colors text-base font-medium",
        )}
      >
        +
      </button>
    </div>
  );
}

// ── EmptyCart ─────────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2rem)] flex items-center justify-center">
      <div className="text-center space-y-6 px-4 py-20">
        {/* Shopping bag icon */}
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto size-16 text-espresso/20"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-espresso">
            Your cart is empty
          </h1>
          <p className="font-body text-sm text-espresso/60 max-w-xs mx-auto">
            Discover our hand-crafted botanical skincare — shea butters,
            cold-pressed oils, and more.
          </p>
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
