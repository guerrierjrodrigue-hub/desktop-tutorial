"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function ContactForm({ dict }: { dict: Dictionary }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `Message from ${name || dict["mkt.contact.form.subjectFallback"]}`;
    const body = `${message}\n\n— ${name} (${email})`;
    window.location.href = `mailto:${APP_SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-faint">{dict["mkt.contact.form.name"]}</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-gold/40"
          />
        </label>
        <label className="block">
          <span className="text-xs text-faint">{dict["mkt.contact.form.email"]}</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-gold/40"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs text-faint">{dict["mkt.contact.form.message"]}</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-gold/40"
        />
      </label>
      <p className="text-xs text-faint">
        {dict["mkt.contact.form.hint"]} {APP_SUPPORT_EMAIL}.
      </p>
      <Button type="submit" className="w-full sm:w-auto">
        <Send className="size-4" /> {dict["mkt.contact.form.send"]}
      </Button>
    </form>
  );
}
