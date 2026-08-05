"use client";

/**
 * PrivateLabelForm — private-label / contract-manufacturing inquiry form.
 *
 * Same v1 pattern as ContactForm: no backend, so submit composes a pre-filled
 * email to the private-label inbox. Fields mirror the legacy Services inquiry
 * (business, country, phone + best time, products of interest, quantities).
 * Rounded fields, warm focus ring, never blue.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { INQUIRY_FIELDS, PRIVATE_LABEL_EMAIL } from "@/lib/content/private-label";

const fieldClass =
  "w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 outline-none transition-colors focus:border-marigold focus:ring-2 focus:ring-marigold/30";

export function PrivateLabelForm() {
  const [values, setValues] = useState<Record<string, string>>({});

  const set = (name: string, v: string) => setValues((prev) => ({ ...prev, [name]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = INQUIRY_FIELDS.map((f) => `${f.label}:\n${values[f.name] ?? ""}`).join("\n\n");
    const href = `mailto:${PRIVATE_LABEL_EMAIL}?subject=${encodeURIComponent(
      `Private label enquiry — ${values.business || "new business"}`,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Private label inquiry form">
      <div className="grid gap-4 sm:grid-cols-2">
        {INQUIRY_FIELDS.map((f) => {
          const isTextarea = f.type === "textarea";
          return (
            <div
              key={f.name}
              className={`flex flex-col gap-1.5 ${isTextarea ? "sm:col-span-2" : ""}`}
            >
              <label
                htmlFor={`pl-${f.name}`}
                className="text-xs font-semibold uppercase tracking-wider text-espresso/55"
              >
                {f.label}
                {f.required && <span className="text-clay"> *</span>}
              </label>
              {isTextarea ? (
                <textarea
                  id={`pl-${f.name}`}
                  required={f.required}
                  rows={3}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className={`${fieldClass} resize-y`}
                />
              ) : (
                <input
                  id={`pl-${f.name}`}
                  type={f.type}
                  required={f.required}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className={fieldClass}
                />
              )}
              {f.help && <p className="text-xs text-espresso/45">{f.help}</p>}
            </div>
          );
        })}
      </div>

      <Button
        type="submit"
        size="lg"
        className="self-start rounded-full bg-clay px-8 font-semibold text-cream hover:bg-orange"
      >
        Send inquiry
      </Button>
      <p className="text-xs text-espresso/45">
        Prefer email? Reach our private-label team directly at{" "}
        <a
          href={`mailto:${PRIVATE_LABEL_EMAIL}`}
          className="font-medium text-clay underline-offset-2 hover:underline"
        >
          {PRIVATE_LABEL_EMAIL}
        </a>
        . We look forward to serious inquiries.
      </p>
    </form>
  );
}
