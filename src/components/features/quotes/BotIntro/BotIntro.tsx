"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { QuotesPageContent } from "@/types/quotesPage";
import type { QuotesChatContext } from "@/lib/quotes-chat";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { CloseButton } from "@/components/ui/IconButton";
import { NetraBot, type NetraBotHandle } from "@/components/ui/NetraBot";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { EASE_OUT as EASE } from "@/lib/motion";
import { ChatAvatar } from "../QuotesChat";
import styles from "./BotIntro.module.css";

export interface BotIntroProps {
  open: boolean;
  /** The × (or Esc, or the scrim). */
  onClose: () => void;
  /** Continue: closes it (the chat stays shut until the customer asks). */
  onContinue: () => void;
  content: QuotesPageContent["detailsPanel"]["botIntro"];
  /** The page as Ask BimaNetra sees it: fills the answers' few details. */
  context: QuotesChatContext;
}

interface Line {
  id: number;
  from: "you" | "bot";
  text: string;
}

/** The newest few lines stay; older ones rise and fade off the top. */
const KEEP = 4;
/* Beats of one exchange (ms), unhurried so it reads at a glance: the
   question lands, NetraBot types, the answer lands and sits, then the next. */
const ASK_MS = 1500;
const TYPE_MS = 1900;
const READ_MS = 4200;

const amount = (price?: string) => Number((price ?? "").replace(/[^\d]/g, "")) || 0;

/** The answers' details, from the page: company, cover, counts, lowest price. */
function details(ctx: QuotesChatContext): Record<string, string> {
  const all = [...(ctx.gold?.revealed ? [ctx.gold.quote] : []), ...ctx.quotes];
  const priced = all.filter((q) => q.price).sort((a, b) => amount(a.price) - amount(b.price));
  return {
    company: ctx.company,
    sum: ctx.sumInsured,
    count: String(all.length),
    immediate: String(all.filter((q) => q.immediate).length),
    cheapest: priced[0]?.price ?? "",
  };
}

/**
 * BotIntro — Case C's welcome (Figma 860:26489): no score to show yet, so it
 * introduces NetraBot instead. NetraBot in the slot, a line on what it does,
 * then a chat that plays itself, slowly: short illustrative questions and
 * one-line answers, a few details filled from this business's page (its
 * name, cover, quote count, lowest price). After the last it clears and
 * starts again; hovering pauses it, and reduced motion shows the first two
 * exchanges still. Continue closes it.
 * Usage: <BotIntro open={o} onClose={c} onContinue={go} content={…} context={ctx} />
 */
export function BotIntro({ open, onClose, onContinue, content, context }: BotIntroProps) {
  const reduced = useReducedMotion();
  const bot = useRef<NetraBotHandle>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState(false);
  const paused = useRef(false);
  // The latest context, read as each answer is written.
  const ctx = useRef(context);
  useEffect(() => {
    ctx.current = context;
  }, [context]);

  useEffect(() => {
    if (!open) return;
    const answer = (a: string) => {
      const v = details(ctx.current);
      return a.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
    };
    if (reduced) {
      setLines(content.exchanges.slice(0, 2).flatMap((x, i) => [
        { id: i * 2, from: "you" as const, text: x.q },
        { id: i * 2 + 1, from: "bot" as const, text: answer(x.a) },
      ]));
      return;
    }
    let live = true;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((done) => timers.push(window.setTimeout(done, ms)));
    const held = async () => {
      while (live && paused.current) await wait(200);
    };
    const push = (l: Line) => setLines((all) => [...all, l].slice(-KEEP));
    (async () => {
      let id = 0;
      await wait(500);
      while (live) {
        for (const x of content.exchanges) {
          await held();
          if (!live) return;
          push({ id: id++, from: "you", text: x.q });
          await wait(ASK_MS);
          setTyping(true);
          bot.current?.react("curiousTilt");
          await wait(TYPE_MS);
          if (!live) return;
          setTyping(false);
          push({ id: id++, from: "bot", text: answer(x.a) });
          bot.current?.react("nodYes");
          await wait(READ_MS);
        }
        // The loop resets: the chat clears, then the first question again.
        setLines([]);
        await wait(900);
      }
    })();
    return () => {
      live = false;
      timers.forEach((t) => window.clearTimeout(t));
      setLines([]);
      setTyping(false);
    };
  }, [open, reduced, content.exchanges]);

  const newestBot = [...lines].reverse().find((l) => l.from === "bot")?.id;
  return (
    <SideDrawer open={open} onClose={onClose} title={content.title} closeLabel={content.closeLabel} width={560} placement="center" bare className={styles.panel}>
      <div className={styles.modal}>
        <div className={styles.head}>
          <h2 className={styles.title}>{content.title}</h2>
          <CloseButton label={content.closeLabel} onClick={onClose} />
        </div>
        <div className={styles.slot}>
          <NetraBot ref={bot} state={typing ? "thinking" : "idle"} size={56} follow="page" />
        </div>
        <hr className={styles.rule} />
        <p className={styles.info}>{content.body}</p>

        {/* The chat that plays itself; the newest lines at the foot. */}
        <div
          className={styles.preview}
          onMouseEnter={() => (paused.current = true)}
          onMouseLeave={() => (paused.current = false)}
          aria-hidden
        >
          <div className={styles.lines}>
            <AnimatePresence initial={false} mode="popLayout">
              {lines.map((l) => (
                <motion.div
                  key={l.id}
                  layout
                  className={styles.line}
                  data-from={l.from}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {l.from === "bot" && <ChatAvatar live={l.id === newestBot && !typing} state="waiting" />}
                  <p className={styles.bubble}>{l.text}</p>
                </motion.div>
              ))}
              {typing && (
                <motion.div
                  key="typing"
                  layout
                  className={styles.line}
                  data-from="bot"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <ChatAvatar live state="thinking" />
                  <p className={styles.bubble} data-typing aria-label={content.typingLabel}>
                    <span />
                    <span />
                    <span />
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className={styles.foot}>
          <button type="button" className={styles.cta} onClick={onContinue}>
            {content.ctaLabel}
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </SideDrawer>
  );
}
