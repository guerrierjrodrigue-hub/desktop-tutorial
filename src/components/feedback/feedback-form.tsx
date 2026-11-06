"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sendFeedback } from "@/app/(app)/feedback/actions";
import type { Dictionary, DictionaryKey } from "@/i18n/dictionaries/en";

type Kind = "bug" | "idee" | "autre";

/** Short beta-feedback form. One submit per render; demo mode no-ops to success. */
export function FeedbackForm({ dict }: { dict: Dictionary }) {
  const [kind, setKind] = useState<Kind>("bug");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await sendFeedback({
        kind,
        message,
        page: typeof window !== "undefined" ? window.location.pathname : null,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      if (res.ok) {
        setSent(true);
        setMessage("");
      } else {
        setError(
          res.error ? dict[res.error as DictionaryKey] ?? dict["errors.unexpected"] : dict["errors.unexpected"],
        );
      }
    });
  }

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-accent-bright">
            <Check className="size-5" />
            <CardTitle>{dict["feedback.thanksTitle"]}</CardTitle>
          </div>
          <p className="mt-2 text-sm text-muted">{dict["feedback.thanksBody"]}</p>
          <Button className="mt-4" variant="secondary" onClick={() => setSent(false)}>
            {dict["feedback.sendAnother"]}
          </Button>
        </CardHeader>
      </Card>
    );
  }

  const kinds: { value: Kind; label: string }[] = [
    { value: "bug", label: dict["feedback.kind.bug"] },
    { value: "idee", label: dict["feedback.kind.idee"] },
    { value: "autre", label: dict["feedback.kind.autre"] },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="size-5 text-accent-bright" />
          <CardTitle>{dict["feedback.formTitle"]}</CardTitle>
        </div>
        <p className="mt-2 text-sm text-muted">{dict["feedback.formIntro"]}</p>

        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-medium text-muted">{dict["feedback.kindLabel"]}</legend>
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => (
              <button
                key={k.value}
                type="button"
                aria-pressed={kind === k.value}
                onClick={() => setKind(k.value)}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm transition ${
                  kind === k.value
                    ? "border-accent bg-accent/15 text-accent-bright"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label
          htmlFor="feedback-message"
          className="mb-1.5 mt-4 block text-xs font-medium text-muted"
        >
          {dict["feedback.messageLabel"]}
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder={dict["feedback.messagePlaceholder"]}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />

        {error && <p className="mt-2 text-sm text-ember">{error}</p>}

        <Button className="mt-4" onClick={submit} disabled={pending || message.trim().length < 5}>
          {pending ? dict["feedback.sending"] : dict["feedback.send"]}
        </Button>
      </CardHeader>
    </Card>
  );
}
