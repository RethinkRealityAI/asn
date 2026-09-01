/**
 * Checkout contact requirements.
 *
 * Email and phone are BOTH mandatory at the Shopify checkout (contact method =
 * Email, shipping-address phone = Required). A shopper who only finds that out
 * on the payment screen has already committed, so the cart says it up front —
 * and says it identically in the drawer and on the cart page, which is why the
 * copy lives in one shared constant instead of being duplicated.
 *
 * The wholesale form asks for the same details, so its required fields are
 * marked visibly rather than relying on the browser's validation popup.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CHECKOUT_CONTACT } from "@/lib/content/checkout";

const ROOT = path.resolve(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("CHECKOUT_CONTACT copy", () => {
  it("names both email and phone, and says they are required", () => {
    const note = CHECKOUT_CONTACT.note.toLowerCase();
    expect(note).toContain("email");
    expect(note).toContain("phone");
    expect(note).toMatch(/required/);
  });

  it("explains why the details are collected", () => {
    expect(CHECKOUT_CONTACT.reason.length).toBeGreaterThan(20);
    expect(CHECKOUT_CONTACT.reason.toLowerCase()).toMatch(/tracking|delivery|pickup/);
  });
});

describe("both cart surfaces state the requirement", () => {
  it("the cart drawer renders the shared note", () => {
    const drawer = read("components/cart/CartDrawer.tsx");
    expect(drawer).toContain("CHECKOUT_CONTACT");
    expect(drawer).toContain("@/lib/content/checkout");
  });

  it("the cart page renders the shared note", () => {
    const page = read("app/cart/CartPageClient.tsx");
    expect(page).toContain("CHECKOUT_CONTACT");
    expect(page).toContain("@/lib/content/checkout");
  });

  it("neither hardcodes its own version of the sentence", () => {
    for (const rel of ["components/cart/CartDrawer.tsx", "app/cart/CartPageClient.tsx"]) {
      // The literal sentence must not be pasted inline — only referenced.
      expect(read(rel)).not.toContain(CHECKOUT_CONTACT.note);
    }
  });
});

describe("wholesale form marks which fields are required", () => {
  const form = read("components/wholesale/WholesaleForm.tsx");

  it("phone is a required input", () => {
    expect(form).toMatch(/id="wf-phone"[^>]*required/);
  });

  it("shows a visible required marker, not just browser validation", () => {
    expect(form).toContain("RequiredMark");
  });

  it("labels the genuinely optional fields as optional", () => {
    // City/Province and volume are the only non-required fields.
    expect(form).toMatch(/optional/i);
  });
});
