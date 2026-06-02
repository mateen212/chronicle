"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, MessageSquare, Send } from "lucide-react";
import { GlassCard } from "@/components/common/glass-card";
import { AnimatedSection } from "@/components/common/animated-section";

type Message = { role: "user" | "assistant"; content: string };

export default function DiscoverChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: messages }),
      });

      if (!res.ok) throw new Error("AI unavailable");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, AI is not available right now." };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-6">
      <AnimatedSection className="rounded-3xl p-6 bg-card border-border">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">AI Discovery Chat</h1>
            <p className="text-sm text-muted-foreground">Describe your mood and get personalized recommendations</p>
          </div>
        </div>
      </AnimatedSection>

      <GlassCard className="flex h-[500px] flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Try: &quot;I want something dark and psychological like Black Mirror&quot;
              </p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-popover/20 text-foreground"
                  }`}
                >
                  {msg.content || (streaming && i === messages.length - 1 ? "▋" : "")}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void sendMessage()}
            placeholder="What are you in the mood for?"
            className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => void sendMessage()}
            disabled={!input.trim() || streaming}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </GlassCard>
    </div>
  );
}
