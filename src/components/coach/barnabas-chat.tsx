"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUGGESTED_PROMPTS } from "@/lib/barnabas";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hi, I'm Barnabas — your faith & fitness coach. 🙌 I'm here to encourage you, plan your training, talk nutrition, or simply pray with you. How can I help today?",
};

export function BarnabasChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.id !== "greeting") }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply ?? "I'm here for you. Let's try that again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I couldn't reach my thoughts just now — but I'm still with you. Take a breath, and let's try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass flex h-[calc(100svh-9rem)] flex-col overflow-hidden rounded-2xl border border-border">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {loading && <TypingIndicator />}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3 sm:px-6">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted transition hover:border-gold/30 hover:text-foreground"
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
          placeholder="Message Barnabas…"
          aria-label="Message Barnabas"
          className="h-11 flex-1 rounded-full border border-border bg-surface-2 px-4 text-sm outline-none transition focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep text-background">
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

function TypingIndicator() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-3"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep text-background">
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
