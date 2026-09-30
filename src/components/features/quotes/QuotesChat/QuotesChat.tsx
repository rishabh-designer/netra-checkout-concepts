"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { QuotesChatContent } from "@/types/quotesPage";
import { answerQuotesQuestion, type QuotesChatContext } from "@/lib/quotes-chat";
import { AITextLoading } from "@/components/ui/AITextLoading";
import styles from "./QuotesChat.module.css";
import { EASE_OUT as EASE } from "@/lib/motion";
import { CloseButton } from "@/components/ui/IconButton";

export interface QuotesChatProps {
  content: QuotesChatContent;
  context: QuotesChatContext;
  /** The sparkle mark (the Ask BimaNetra icon). */
  iconSrc: string;
  /** The column is showing: the input takes focus. */
  open?: boolean;
  /** "drawer": inside the shared SideDrawer (phones), which draws the title,
   *  the × and the surface; the chat is just its log and composer. */
  variant?: "drawer";
  /** The ×: the web column closes from its head as a drawer does. */
  onClose?: () => void;
}

interface Message {
  id: number;
  from: "bot" | "you";
  text: string;
}

/** How long BimaNetra "reads" before it answers. */
const THINK_MS = 700;

/**
 * ChatBadge — Ask BimaNetra's mark: the sparkle in white on an orange tile,
 * sized to the title it sits beside (32 on web, 28 on phones).
 * Usage: <ChatBadge iconSrc={feed.needHelp.chatIconSrc} />
 */
export function ChatBadge({ iconSrc }: { iconSrc: string }) {
  return (
    <span className={styles.badge} aria-hidden>
      <span className={styles.sparkle} style={{ "--icon": `url(${iconSrc})` } as CSSProperties} />
    </span>
  );
}

/**
 * QuotesChat — Ask BimaNetra on the Quotes page: a full-height chat column
 * beside the feed. It greets with the quote count, offers starter questions
 * until the first one is asked, and answers from the page itself (prices,
 * coverages, exclusions, territory, Your Details; the Gold Quote only once
 * it's revealed) after a short thinking beat. Neutral by design: it compares,
 * it never picks an insurer.
 * Usage: <QuotesChat content={content.chat} context={ctx} iconSrc={…} />
 */
export function QuotesChat({ content, context, iconSrc, open = true, variant, onClose }: QuotesChatProps) {
  const reduced = useReducedMotion();
  const greeting = content.greeting
    .replace("{count}", String(context.quotes.length + (context.gold?.revealed ? 1 : 0)))
    .replace("{company}", context.company);
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: greeting }]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Focus on open, after the column's width transition has begun.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 120);
    return () => window.clearTimeout(id);
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, thinking, reduced]);

  const ask = (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;
    setMessages((m) => [...m, { id: m.length, from: "you", text: question }]);
    setDraft("");
    setThinking(true);
    timer.current = window.setTimeout(() => {
      const reply = answerQuotesQuestion(question, context, content.replies);
      setMessages((m) => [...m, { id: m.length, from: "bot", text: reply }]);
      setThinking(false);
    }, THINK_MS);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  const asked = messages.some((m) => m.from === "you");
  // BimaNetra's latest reply, in full, waiting on the customer: its sparkle
  // turns until they start typing, pick a suggestion or send.
  const last = messages[messages.length - 1];
  const waitingOn = !thinking && !draft && last?.from === "bot" ? last.id : undefined;
  const mark = { "--icon": `url(${iconSrc})` } as CSSProperties;

  return (
    <section className={styles.chat} data-variant={variant} aria-label={content.title}>
      {/* The drawers' head (the phone drawer's, now on web too): the serif
          title and the ×. */}
      <header className={styles.head}>
        <h2 className={styles.title}>
          <ChatBadge iconSrc={iconSrc} />
          {content.title}
        </h2>
        {onClose && <CloseButton label={content.closeLabel} onClick={onClose} />}
      </header>

      <div ref={listRef} className={styles.list} role="log" aria-live="polite">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            className={styles.message}
            data-from={m.from}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {m.from === "bot" && <span className={styles.avatar} style={mark} data-waiting={m.id === waitingOn || undefined} aria-hidden />}
            <p className={styles.bubble}>{m.text}</p>
          </motion.div>
        ))}
        {thinking && (
          <div className={styles.message} data-from="bot">
            <span className={styles.avatar} style={mark} aria-hidden />
            <AITextLoading text={content.thinkingLabel} className={styles.thinking} />
          </div>
        )}
        <AnimatePresence>
          {!asked && (
            <motion.div
              className={styles.suggestions}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {content.suggestions.map((s) => (
                <button key={s} type="button" className={styles.suggestion} onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form className={styles.composer} onSubmit={onSubmit}>
        <input
          ref={inputRef}
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={content.placeholder}
          aria-label={content.placeholder}
        />
        <button type="submit" className={styles.send} disabled={!draft.trim() || thinking} aria-label={content.sendLabel} data-tooltip={content.sendLabel}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
            <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </section>
  );
}
