"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { QuotesChatContent } from "@/types/quotesPage";
import type { QuotesChatContext } from "@/lib/quotes-chat";
import type { QuotesChatSession } from "./useQuotesChat";
import { AITextLoading } from "@/components/ui/AITextLoading";
import styles from "./QuotesChat.module.css";
import { EASE_OUT as EASE } from "@/lib/motion";
import { CloseButton } from "@/components/ui/IconButton";
import { NetraBot } from "@/components/ui/NetraBot";

export interface QuotesChatProps {
  content: QuotesChatContent;
  context: QuotesChatContext;
  /** The conversation (useQuotesChat), held by the page so it outlives this. */
  session: QuotesChatSession;
  /** The chat is showing: the input takes focus. */
  open?: boolean;
  /** "drawer": inside the shared SideDrawer, which draws the title, the ×
   *  and the surface; the chat is just its log and composer. */
  variant?: "drawer";
  /** The ×, for a chat with its own head (not in a drawer). */
  onClose?: () => void;
}

/**
 * ChatAvatar — the space beside BimaNetra's messages. Only the newest one
 * (`live`) holds NetraBot, acting out the chat: listening while the
 * customer types, thinking while a reply is composed, waiting otherwise. The
 * older ones keep the space, so the bubbles stay in line.
 * Usage: <ChatAvatar live state={draft ? "listening" : "waiting"} />
 */
export function ChatAvatar({ live = false, state = "waiting" }: { live?: boolean; state?: string }) {
  return <span className={styles.botAvatar}>{live && <NetraBot state={state} follow="page" size={24} />}</span>;
}

/**
 * QuotesChat — Ask BimaNetra on the Quotes page, shown in the chat drawer.
 * The conversation (`session`) greets with the quote count; starter questions
 * show until the first one is asked, and answers come from the page itself
 * (prices, coverages, exclusions, Coverage Match, territory, Your Details;
 * the Gold Quote only once it's revealed) after a short thinking beat.
 * Neutral by design: it compares, it never picks an insurer.
 * Usage: <QuotesChat content={content.chat} context={ctx} session={chat} variant="drawer" />
 */
export function QuotesChat({ content, context, session, open = true, variant, onClose }: QuotesChatProps) {
  const reduced = useReducedMotion();
  const { messages, thinking } = session;
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on open, once the drawer has begun to slide in.
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
    if (!text.trim() || thinking) return;
    session.ask(text);
    setDraft("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  const asked = messages.some((m) => m.from === "you");
  // NetraBot sits beside BimaNetra's latest reply: it leans in while the
  // customer types and waits on them otherwise (thinking has its own row).
  const last = messages[messages.length - 1];
  const liveId = !thinking && last?.from === "bot" ? last.id : undefined;
  const botState = draft.trim() ? "listening" : "waiting";
  const drawer = variant === "drawer";

  return (
    <section className={styles.chat} data-variant={variant} aria-label={content.title}>
      {/* The drawers' head (the phone drawer's, now on web too): the serif
          title and the ×. */}
      <header className={styles.head}>
        {/* No mark here: NetraBot already sits beside the latest reply. */}
        <h2 className={styles.title}>{content.title}</h2>
        {onClose && <CloseButton label={content.closeLabel} onClick={onClose} />}
      </header>
      {/* In the drawer, a warm rule under its title (Figma 880:29726). */}
      {drawer && <hr className={styles.rule} />}

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
            {m.from === "bot" && <ChatAvatar live={m.id === liveId} state={botState} />}
            <p className={styles.bubble}>{m.text}</p>
          </motion.div>
        ))}
        {thinking && (
          <div className={styles.message} data-from="bot">
            <ChatAvatar live state="thinking" />
            <AITextLoading text={content.thinkingLabel} className={styles.thinking} />
          </div>
        )}
        <AnimatePresence>
          {!asked && (
            <motion.div
              className={styles.starters}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {/* In the drawer, a grey rule closes off the greeting (880:29652). */}
              {drawer && <hr className={styles.startersRule} />}
              <div className={styles.suggestions}>
                {(context.keyLines && content.suggestionsScored ? content.suggestionsScored : content.suggestions).map((s) => (
                  <button key={s} type="button" className={styles.suggestion} onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
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
