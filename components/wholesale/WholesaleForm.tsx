"use client";

/**
 * WholesaleForm — interactive wholesale/bulk application.
 *
 * Image-card multi-select ("what are you interested in") + business details,
 * submitted to Netlify Forms (form-name="wholesale"). Lands in the Netlify
 * dashboard → Forms; add an email notification there to forward to the studio.
 * Honeypot for spam, inline success + error states. Green selection, never blue.
 */

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { submitNetlifyForm } from "@/lib/forms/netlify";
import { cn } from "@/lib/utils";

const INTERESTS = [
  { id: "butters", label: "Butters & Moisturizers", image: "/hero/shea-butter.webp" },
  { id: "oils", label: "Cold-Pressed Oils", image: "/hero/argan.webp" },
  { id: "hair", label: "Hair Care", image: "/hero/castor.webp" },
  { id: "soaps", label: "Soaps & Washes", image: "/hero/cocoa.webp" },
  { id: "raw", label: "Raw Materials (bulk)", image: "/hero/pail-shea-butter.webp" },
  { id: "private-label", label: "Private Label", image: "/headers/wholesale-private-label.webp" },
];

const VOLUMES = [
  "Just exploring",
  "Under $500 / month",
  "$500 – $2,000 / month",
  "$2,000+ / month",
];

const field =
  "w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 outline-none transition-colors focus:border-green/60 focus:ring-2 focus:ring-green/20";
const labelCls = "text-xs font-semibold uppercase tracking-wider text-espresso/55";

/**
 * Visible required marker. The inputs already carry `required`, but that only
 * surfaces as a browser popup after a failed submit — the asterisk says which
 * fields matter before the shopper starts typing. aria-hidden because the
 * input's own `required` is what assistive tech announces.
 */
function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-clay">
      *
    </span>
  );
}

/** Matching marker for the fields that genuinely are not needed. */
function OptionalMark() {
  return (
    <span className="ml-1 font-normal normal-case tracking-normal text-espresso/40">
      (optional)
    </span>
  );
}

export function WholesaleForm() {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const interestLabels = INTERESTS.filter((i) => selected.includes(i.id)).map((i) => i.label).join(", ");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("bot-field")) return;

    setStatus("submitting");
    try {
      await submitNetlifyForm("wholesale", {
        name: String(data.get("name") ?? ""),
        business: String(data.get("business") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        location: String(data.get("location") ?? ""),
        interests: interestLabels,
        volume: String(data.get("volume") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      setStatus("success");
      form.reset();
      setSelected([]);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-[1.75rem] border border-green/30 bg-green/8 p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green text-cream">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="font-display text-xl font-semibold text-espresso">Application received — thank you.</p>
        <p className="text-sm leading-relaxed text-espresso/65">
          We&apos;ll review your details and reply within 1–2 business days with wholesale pricing, minimums and lead times. For anything urgent, call 705-719-2750.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-1 text-sm font-semibold text-clay underline-offset-2 hover:underline">
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form
      name="wholesale"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="flex flex-col gap-7"
      aria-label="Wholesale application"
    >
      <input type="hidden" name="form-name" value="wholesale" />
      <input type="hidden" name="interests" value={interestLabels} />
      <p className="hidden">
        <label>Don&apos;t fill this out if you&apos;re human: <input name="bot-field" /></label>
      </p>

      {/* Image-card interest selector */}
      <fieldset>
        <legend className={cn(labelCls, "mb-3")}>What are you interested in? (select all that apply)</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {INTERESTS.map((i) => {
            const on = selected.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => toggle(i.id)}
                aria-pressed={on}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border text-left transition-all duration-200 ease-[--ease-warm]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2",
                  on ? "border-green ring-2 ring-green/40" : "border-espresso/12 hover:border-green/40"
                )}
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image src={i.image} alt="" fill sizes="(max-width:640px) 45vw, 200px" className="object-cover" />
                  <div aria-hidden className={cn("absolute inset-0 transition-colors", on ? "bg-green/25" : "bg-espresso/25 group-hover:bg-espresso/15")} />
                  {on && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green text-cream shadow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                  )}
                </div>
                <span className="block px-3 py-2.5 text-xs font-semibold text-espresso">{i.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Details */}
      <p className="-mb-3 text-xs text-espresso/55">
        Fields marked <span className="font-semibold text-clay">*</span> are required.
        We need a phone number so we can reach you about your order.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wf-name" className={labelCls}>Your name<RequiredMark /></label>
          <input id="wf-name" name="name" type="text" required placeholder="Full name" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wf-business" className={labelCls}>Business name<RequiredMark /></label>
          <input id="wf-business" name="business" type="text" required placeholder="Store, spa or company" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wf-email" className={labelCls}>Email<RequiredMark /></label>
          <input id="wf-email" name="email" type="email" required placeholder="you@business.com" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wf-phone" className={labelCls}>Phone<RequiredMark /></label>
          <input id="wf-phone" name="phone" type="tel" required placeholder="(705) 555-0123" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wf-location" className={labelCls}>City / Province<OptionalMark /></label>
          <input id="wf-location" name="location" type="text" placeholder="e.g. Toronto, ON" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wf-volume" className={labelCls}>Estimated volume<OptionalMark /></label>
          <select id="wf-volume" name="volume" defaultValue="" className={cn(field, "cursor-pointer")}>
            <option value="" disabled>Select an estimate…</option>
            {VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wf-message" className={labelCls}>Anything else?</label>
        <textarea id="wf-message" name="message" rows={4} placeholder="Products, sizes, timelines, private-label ideas…" className={cn(field, "resize-y")} />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-clay">
          Something went wrong sending your application. Please try again, or email{" "}
          <a href="mailto:allnaturals@allnaturalscosmetics.ca" className="font-medium underline">allnaturals@allnaturalscosmetics.ca</a>.
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="self-start rounded-full bg-green px-8 font-semibold text-cream hover:bg-green/90 disabled:opacity-70">
        {status === "submitting" ? "Sending…" : "Submit application"}
      </Button>
    </form>
  );
}
