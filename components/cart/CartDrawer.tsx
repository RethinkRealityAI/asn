"use client";

/**
 * CartDrawer
 *
 * Right-side slide-in cart. Glass treatment: frosted + liquid marigold accent.
 *
 * Accessibility:
 *   - role="dialog" with aria-modal and aria-label
 *   - Focus trap via ref + keydown Esc handler
 *   - Body scroll-lock while open (overflow:hidden on <body>)
 *
 * Motion:
 *   - Reduced-motion → instant visibility (no slide)
 *   - Full motion → framer-motion AnimatePresence + spring slide from right
 *
 * Checkout:
 *   - Stubbed button — shows an inline note; does NOT simulate payment.
 *
 * Never blue. Warm palette only.
 */

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useCart } from "./CartProvider";
import { PICKUP } from "@/lib/content/pickup";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { Button } from "@/components/ui/button";
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

// ── Close icon ────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ── CartDrawer ────────────────────────────────────────────────────────────────

export function CartDrawer() {
  const { items, count, subtotal, update, remove, isOpen, closeCart } =
    useCart();
  const reducedMotion = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Esc to close ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  // ── Focus trap: move focus into panel when it opens ───────────────────────
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // ── Focus trap: tab cycling ────────────────────────────────────────────────
  const trapFocus = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // ── Animation variants ────────────────────────────────────────────────────
  const panelVariants: Variants = reducedMotion
    ? {
        hidden: {},
        visible: {},
        exit: {},
      }
    : {
        hidden: { x: "100%" },
        visible: { x: 0 },
        exit: { x: "100%" },
      };

  const transition = reducedMotion
    ? { duration: 0 }
    : { ease: WARM, duration: DUR.base };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────── */}
          <motion.div
            key="cart-backdrop"
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-espresso/30 backdrop-blur-[2px]"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={transition}
            onClick={closeCart}
          />

          {/* ── Drawer panel ─────────────────────────────────────────── */}
          <motion.div
            key="cart-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Shopping cart, ${count} item${count !== 1 ? "s" : ""}`}
            tabIndex={-1}
            onKeyDown={trapFocus}
            className={cn(
              // Position: fixed right side, full height, above backdrop
              "fixed inset-y-0 right-0 z-50",
              "w-full sm:w-[420px] max-w-full",
              "flex flex-col",
              // Glass: frosted cream + liquid marigold bottom accent
              "backdrop-blur-[16px] backdrop-saturate-[1.6]",
              "bg-[#F5ECDA]/80",
              "border-l border-[#F5ECDA]/60",
              "shadow-[-4px_0_40px_rgba(42,30,20,0.14)]",
              // Liquid marigold bottom glow (matches liquid glass variant)
              "[background-image:radial-gradient(ellipse_80%_30%_at_50%_100%,rgba(235,165,44,0.18)_0%,transparent_70%)]",
              // Focus outline suppressed (managed manually)
              "outline-none",
            )}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-espresso/12">
              <h2 className="font-display text-lg font-semibold text-espresso">
                Your cart
                <span className="ml-1.5 font-body text-sm font-normal text-espresso/60">
                  ({count})
                </span>
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className={cn(
                  "p-2 rounded-full",
                  "text-espresso/60 hover:text-espresso hover:bg-espresso/8",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                  "transition-colors",
                )}
              >
                <CloseIcon />
              </button>
            </div>

            {/* ── Line items ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <EmptyState onClose={closeCart} />
              ) : (
                items.map((item) => (
                  <CartLineItem
                    key={item.variantId}
                    item={item}
                    onUpdate={(qty) => update(item.variantId, qty)}
                    onRemove={() => remove(item.variantId)}
                  />
                ))
              )}
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            {items.length > 0 && (
              <div className="border-t border-espresso/12 px-6 py-5 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm font-medium text-espresso/70">
                    Subtotal
                  </span>
                  <span className="font-display text-lg font-semibold text-espresso">
                    {fmt(subtotal.amount)}
                    <span className="ml-1 font-body text-xs font-normal text-espresso/40">
                      CAD
                    </span>
                  </span>
                </div>

                {/* Shipping is the default; local pickup offered as an alternative */}
                <p className="text-xs text-espresso/50">
                  Shipping calculated at checkout · free Canada-wide over $75.
                </p>
                <div className="flex items-start gap-2 rounded-xl border border-green/20 bg-green/5 p-3 text-xs leading-relaxed text-espresso/70">
                  <span aria-hidden className="mt-0.5 text-sm">📍</span>
                  <span>
                    <span className="font-semibold text-green">Or {PICKUP.label.toLowerCase()} — free.</span>{" "}
                    {PICKUP.day} at {PICKUP.address}. Call ahead to confirm:{" "}
                    <a href={PICKUP.phoneHref} className="font-semibold text-clay hover:underline">
                      {PICKUP.phone}
                    </a>{" "}
                    or{" "}
                    <a href={PICKUP.emailHref} className="font-semibold text-clay hover:underline">
                      {PICKUP.email}
                    </a>
                    .
                  </span>
                </div>

                {/* Checkout — STUBBED, no payment */}
                <CheckoutStub />

                {/* Secondary actions */}
                <div className="flex items-center justify-between text-sm">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="text-espresso/70 hover:text-espresso underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold rounded-sm transition-colors"
                  >
                    View cart
                  </Link>
                  <button
                    onClick={closeCart}
                    className="text-espresso/70 hover:text-espresso underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold rounded-sm transition-colors"
                  >
                    Continue shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── CheckoutStub ──────────────────────────────────────────────────────────────
// Clearly labeled stub — does NOT simulate payment.

function CheckoutStub() {
  return (
    <div className="space-y-2">
      <Button
        size="lg"
        variant="default"
        className="w-full"
        onClick={() => {
          // Stubbed — Shopify hosted checkout will replace this
          alert(
            "Secure checkout arrives when Shopify is connected.\nThis is a design preview."
          );
        }}
        aria-label="Proceed to checkout (not yet available)"
      >
        Checkout
      </Button>
      <p className="text-center text-[11px] text-espresso/50 font-body">
        Secure checkout arrives with Shopify — coming soon.
      </p>
    </div>
  );
}

// ── CartLineItem ──────────────────────────────────────────────────────────────

interface CartLineItemProps {
  item: {
    variantId: string;
    quantity: number;
    product: { title: string; handle: string; images: { url: string; altText: string }[] };
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
    <div className="flex gap-3 items-start">
      {/* Product image */}
      <div
        className={cn(
          "relative flex-shrink-0 w-18 h-18 rounded-xl overflow-hidden",
          "bg-[#FAF5EC] border border-espresso/10",
        )}
      >
        {img ? (
          <Image
            src={img.url}
            alt={img.altText || item.product.title}
            fill
            sizes="72px"
            className="object-contain p-1.5"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-espresso/20 text-xs">–</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-display text-sm font-semibold text-espresso leading-snug line-clamp-2">
          {item.product.title}
        </p>
        {!isDefaultTitle && (
          <p className="text-xs text-espresso/60 font-body">{item.variant.title}</p>
        )}

        {/* Qty stepper + price row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <QuantityStepper
            qty={item.quantity}
            onDecrement={() => onUpdate(item.quantity - 1)}
            onIncrement={() => onUpdate(item.quantity + 1)}
          />
          <span className="font-body text-sm font-medium text-espresso tabular-nums">
            {fmt(linePrice)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${item.product.title} from cart`}
        className={cn(
          "flex-shrink-0 mt-0.5 p-1 rounded-full",
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
          "flex items-center justify-center w-7 h-7",
          "text-espresso/70 hover:text-espresso hover:bg-espresso/8",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-marigold",
          "transition-colors text-sm font-medium",
        )}
      >
        −
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="min-w-[1.75rem] text-center font-body text-sm font-semibold text-espresso tabular-nums select-none"
      >
        {qty}
      </span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center w-7 h-7",
          "text-espresso/70 hover:text-espresso hover:bg-espresso/8",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-marigold",
          "transition-colors text-sm font-medium",
        )}
      >
        +
      </button>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
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
        className="size-12 text-espresso/20"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <div>
        <p className="font-display text-base font-semibold text-espresso/70">
          Your cart is empty
        </p>
        <p className="font-body text-sm text-espresso/40 mt-1">
          Add something beautiful.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onClose}>
        Continue shopping
      </Button>
    </div>
  );
}
