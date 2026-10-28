"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { QuotesChatContent } from "@/types/quotesPage";
import { answerQuotesQuestion, type QuotesChatContext } from "@/lib/quotes-chat";

export interface ChatMessage {
  id: number;
  from: "bot" | "you";
  text: string;
}

/** The conversation, held by the page so it outlives the drawer it shows in. */
export interface QuotesChatSession {
  messages: ChatMessage[];
  thinking: boolean;
  /** Ask a question: it joins the log, and the answer follows after a beat. */
  ask: (text: string) => void;
}

/** How long BimaNetra "reads" before it answers. */
const THINK_MS = 700;

/**
 * useQuotesChat — Ask BimaNetra's conversation on the Quotes page. It greets
 * with the quote count, and answers from the page as it is when asked (the
 * latest context: the Gold Quote counts once revealed). Kept by QuotesView,
 * so closing the chat drawer (which unmounts it) loses nothing, and the Ask
 * Netra box can ask before the drawer has opened.
 * Usage: const chat = useQuotesChat(content.chat, chatContext); chat.ask("…");
 */
export function useQuotesChat(content: QuotesChatContent, context: QuotesChatContext): QuotesChatSession {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 0,
      from: "bot",
      // The Gold Quote counts from the start, as in the page heading.
      text: content.greeting
        .replace("{count}", String(context.quotes.length + (context.gold ? 1 : 0)))
        .replace("{company}", context.company),
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  // The latest page and copy, read when an answer is composed.
  const latest = useRef({ content, context });
  useEffect(() => {
    latest.current = { content, context };
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const busy = useRef(false);
  const ask = useCallback((text: string) => {
    const question = text.trim();
    if (!question || busy.current) return;
    busy.current = true;
    setMessages((m) => [...m, { id: m.length, from: "you", text: question }]);
    setThinking(true);
    timer.current = window.setTimeout(() => {
      const { content: c, context: ctx } = latest.current;
      const reply = answerQuotesQuestion(question, ctx, c.replies);
      setMessages((m) => [...m, { id: m.length, from: "bot", text: reply }]);
      setThinking(false);
      busy.current = false;
    }, THINK_MS);
  }, []);

  return { messages, thinking, ask };
}
