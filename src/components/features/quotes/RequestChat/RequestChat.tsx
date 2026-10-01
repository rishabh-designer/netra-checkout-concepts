"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { RequestChatContent } from "@/types/quotesPage";
import { AITextLoading } from "@/components/ui/AITextLoading";
import chat from "../QuotesChat/QuotesChat.module.css";
import { ChatAvatar } from "../QuotesChat";
import styles from "./RequestChat.module.css";
import { EASE_OUT as EASE } from "@/lib/motion";

export interface RequestChatProps {
  content: RequestChatContent;
  /** BimaNetra's opening line (the drawer's intro). */
  intro: string;
  /** Every question is answered (or, with null, not yet). */
  onDone: (answers: Record<string, string> | null) => void;
}

interface Message {
  id: number;
  from: "bot" | "you";
  text: string;
}

const THINK_MS = 600;

/** "12022021" → "12/02/2021" as it's typed. */
const asDate = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
};

/** A real DD/MM/YYYY date, not in the future. */
const validDate = (v: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return false;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && year >= 1850 && date <= new Date();
};

/**
 * RequestChat — Request a Quote as a short BimaNetra chat (in the Ask
 * BimaNetra look): it opens with the drawer's intro, then asks each question
 * in turn. A date is typed (slashes fill in; it must be a real past date);
 * a choice is a tap on one of its chips. Once the last one is answered it
 * thanks the customer and reports the answers, which enables Request Quote.
 * Usage: <RequestChat content={drawer.chat} intro={drawer.intro} onDone={setAnswers} />
 */
export function RequestChat({ content, intro, onDone }: RequestChatProps) {
  const reduced = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: intro },
    { id: 1, from: "bot", text: content.steps[0].question },
  ]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const current = content.steps[step];
  const finished = step >= content.steps.length;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, thinking, reduced]);
  useEffect(() => {
    if (!thinking && current?.answer === "date") inputRef.current?.focus({ preventScroll: true });
  }, [thinking, current]);

  const say = (from: Message["from"], text: string) => setMessages((m) => [...m, { id: m.length, from, text }]);

  const answer = (text: string) => {
    if (!current || thinking) return;
    say("you", text);
    setDraft("");
    if (current.answer === "date" && !validDate(text)) {
      setThinking(true);
      timer.current = window.setTimeout(() => {
        say("bot", content.invalidDate);
        setThinking(false);
      }, THINK_MS);
      return;
    }
    const next = { ...answers, [current.key]: text };
    setAnswers(next);
    setThinking(true);
    timer.current = window.setTimeout(() => {
      const after = content.steps[step + 1];
      say("bot", after ? after.question : content.done);
      setStep(step + 1);
      setThinking(false);
      if (!after) onDone(next);
    }, THINK_MS);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (draft.trim()) answer(draft.trim());
  };

  const choosing = !thinking && current?.answer === "choice";
  // As Ask BimaNetra: NetraBot beside the latest question, listening while
  // the customer types, waiting on them otherwise.
  const last = messages[messages.length - 1];
  const liveId = !thinking && last?.from === "bot" ? last.id : undefined;
  const botState = draft.trim() ? "listening" : "waiting";

  return (
    <div className={styles.chat}>
      <div ref={listRef} className={`${chat.list} ${styles.list}`} role="log" aria-live="polite">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            className={chat.message}
            data-from={m.from}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {m.from === "bot" && <ChatAvatar live={m.id === liveId} state={botState} />}
            <p className={chat.bubble}>{m.text}</p>
          </motion.div>
        ))}
        {thinking && (
          <div className={chat.message} data-from="bot">
            <ChatAvatar live state="thinking" />
            <AITextLoading text={content.thinkingLabel} className={chat.thinking} />
          </div>
        )}
        <AnimatePresence>
          {choosing && (
            <motion.div
              key={current.key}
              className={`${chat.suggestions} ${styles.choices}`}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              {current.options?.map((o) => (
                <button key={o} type="button" className={chat.suggestion} onClick={() => answer(o)}>
                  {o}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!finished && current.answer === "date" && (
        <form className={`${chat.composer} ${styles.composer}`} onSubmit={onSubmit}>
          <input
            ref={inputRef}
            className={chat.input}
            value={draft}
            onChange={(e) => setDraft(asDate(e.target.value))}
            placeholder={current.placeholder}
            aria-label={current.question}
            inputMode="numeric"
            disabled={thinking}
          />
          <button type="submit" className={chat.send} disabled={!draft.trim() || thinking} aria-label={content.sendLabel} data-tooltip={content.sendLabel}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
