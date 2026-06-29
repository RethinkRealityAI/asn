"use client";

/**
 * ContactForm — accessible contact form.
 *
 * v1 has no backend, so on submit it composes a pre-filled email to the studio
 * (opens the visitor's mail client). Fully functional without server wiring;
 * swaps to a real action later. Rounded fields, warm focus ring, never blue.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";

const TO = "allnaturals@allnaturalscosmetics.ca";

const fieldClass =
  "w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 outline-none transition-colors focus:border-marigold focus:ring-2 focus:ring-marigold/30";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const href = `mailto:${TO}?subject=${encodeURIComponent(
      subject || `Website enquiry from ${name || "a customer"}`
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Contact form">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-name" className="text-xs font-semibold uppercase tracking-wider text-espresso/55">
            Name
          </label>
          <input
            id="cf-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-email" className="text-xs font-semibold uppercase tracking-wider text-espresso/55">
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-subject" className="text-xs font-semibold uppercase tracking-wider text-espresso/55">
          Subject
        </label>
        <input
          id="cf-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="How can we help?"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-message" className="text-xs font-semibold uppercase tracking-wider text-espresso/55">
          Message
        </label>
        <textarea
          id="cf-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a little about what you need…"
          className={`${fieldClass} resize-y`}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="self-start rounded-full bg-clay px-8 font-semibold text-cream hover:bg-orange"
      >
        Send message
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
