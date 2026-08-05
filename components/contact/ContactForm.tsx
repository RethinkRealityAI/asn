"use client";

/**
 * ContactForm — accessible contact form backed by Netlify Forms.
 *
 * Submissions POST (url-encoded) to /__forms.html and are captured by Netlify
 * → Forms (viewable in the Netlify dashboard; wire an email notification there
 * to forward them to the studio inbox). No server code needed. Includes a
 * honeypot for spam, inline success + error states. Never blue.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitNetlifyForm } from "@/lib/forms/netlify";

const TO = "allnaturals@allnaturalscosmetics.ca";

const fieldClass =
  "w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 outline-none transition-colors focus:border-marigold focus:ring-2 focus:ring-marigold/30";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real users leave "bot-field" empty.
    if (data.get("bot-field")) return;

    setStatus("submitting");
    try {
      await submitNetlifyForm("contact", {
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        subject: String(data.get("subject") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-2xl border border-green/30 bg-green/8 p-6"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-cream">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="font-display text-lg font-semibold text-espresso">Thank you — message received.</p>
        <p className="text-sm text-espresso/65">
          We read every note and usually reply within a business day. For anything urgent, call 705-719-2750.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-1 text-sm font-semibold text-clay underline-offset-2 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      aria-label="Contact form"
    >
      {/* Netlify plumbing */}
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden">
        <label>
          Don&apos;t fill this out if you&apos;re human: <input name="bot-field" />
        </label>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-name" className="text-xs font-semibold uppercase tracking-wider text-espresso/55">
            Name
          </label>
          <input id="cf-name" name="name" type="text" required placeholder="Your name" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-email" className="text-xs font-semibold uppercase tracking-wider text-espresso/55">
            Email
          </label>
          <input id="cf-email" name="email" type="email" required placeholder="you@example.com" className={fieldClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-subject" className="text-xs font-semibold uppercase tracking-wider text-espresso/55">
          Subject
        </label>
        <input id="cf-subject" name="subject" type="text" placeholder="How can we help?" className={fieldClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-message" className="text-xs font-semibold uppercase tracking-wider text-espresso/55">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a little about what you need…"
          className={`${fieldClass} resize-y`}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-clay">
          Something went wrong sending your message. Please try again, or email us directly at{" "}
          <a href={`mailto:${TO}`} className="font-medium underline">{TO}</a>.
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="self-start rounded-full bg-clay px-8 font-semibold text-cream hover:bg-orange disabled:opacity-70"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
      <p className="text-xs text-espresso/45">
        Prefer email? Reach us directly at{" "}
        <a href={`mailto:${TO}`} className="font-medium text-clay underline-offset-2 hover:underline">
          {TO}
        </a>
        .
      </p>
    </form>
  );
}
