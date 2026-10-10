"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { setActiveCoach, clearCoachConversation } from "@/app/(app)/coach/actions";
import type { Coach } from "@/data/coaches";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ChatMessage } from "@/types";

/**
 * Rendered with `key={coach.id}` by its parent so switching coaches remounts
 * this component fresh instead of needing an effect to reset local state.
 */
export function CoachChat({
  coach,
  history = [],
  dict,
}: {
  coach: Coach;
  history?: ChatMessage[];
  dict: Dictionary;
}) {
  const greeting: ChatMessage = { id: "greeting", role: "assistant", content: coach.greeting };
  const [messages, setMessages] = useState<ChatMessage[]>(
    history.length ? history : [greeting],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearing, startClearing] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  function clearConversation() {
    startClearing(async () => {
      await clearCoachConversation(coach.id);
      setMessages([greeting]);
    });
  }

  // Remember which coach the user is talking to.
  useEffect(() => {
    setActiveCoach(coach.id).catch(() => {});
  }, [coach.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    track("coach_message_sent", { coachId: coach.id });

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          messages: next.filter((m) => m.id !== "greeting"),
        }),
      });

      // Error responses come back as JSON, not a text stream.
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok || contentType.includes("application/json") || !res.body) {
        const data = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply ?? dict["coach.fallbackRetry"],
          },
        ]);
        return;
      }

      // Stream the reply into a single bubble that fills in as tokens arrive.
      // The message id is fixed up front (never mutated) and each chunk is
      // appended via the functional state updater, so no closure-captured
      // variable is mutated — keeps the React Compiler immutability rule happy.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = crypto.randomUUID();
      let hasContent = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (!hasContent) {
          hasContent = true;
          setLoading(false); // first token arrived — replace the typing indicator
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: chunk },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m,
            ),
          );
        }
      }

      if (!hasContent) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: dict["coach.fallbackRetry"],
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: dict["coach.fallbackUnreachable"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass flex h-[calc(100svh-9rem)] flex-col overflow-hidden rounded-2xl border border-border">
      {messages.some((m) => m.id !== "greeting") && (
        <div className="flex items-center justify-end border-b border-border px-3 py-2">
          <button
            type="button"
            onClick={clearConversation}
            disabled={clearing}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted transition hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="size-3.5" /> {dict["coach.clear"]}
          </button>
        </div>
      )}
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} coach={coach} />
        ))}
        {loading && <TypingIndicator coach={coach} />}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3 sm:px-6">
          {coach.suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted transition hover:border-accent/30 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3 sm:p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={dict["coach.messagePlaceholder"].replace("{name}", coach.name)}
          aria-label={dict["coach.messagePlaceholder"].replace("{name}", coach.name)}
          className="h-11 flex-1 rounded-full border border-border bg-surface-2 px-4 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label={dict["coach.sendAria"]}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function MessageBubble({ message, coach }: { message: ChatMessage; coach: Coach }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-background",
            coach.avatarGradient,
          )}
        >
          <Sparkles className="size-4" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-surface-2 text-foreground"
            : "bg-gradient-to-br from-green-deep to-green/30 text-foreground",
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

function TypingIndicator({ coach }: { coach: Coach }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-3"
      >
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-background",
            coach.avatarGradient,
          )}
        >
          <Sparkles className="size-4" />
        </span>
        <div className="flex items-center gap-1 rounded-2xl bg-surface-2 px-4 py-3">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-muted"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
