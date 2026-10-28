"use client";

import { useReducedMotion } from "motion/react";
import { NetraBot } from "@/components/ui/NetraBot";
import { useTypewriter } from "./useTypewriter";
import styles from "./AskNetra.module.css";

export interface AskNetraProps {
  /** The field's name (and its still prompt under reduced motion), and its
   *  button ("Ask BimaNetra"). */
  placeholder: string;
  askLabel: string;
  /** Questions the field types out by itself, one after another in random
   *  order, as if someone were asking them. */
  prompts: string[];
  /** Starter questions, as chips under the field. */
  suggestions: string[];
  /** The field (or its button): open the chat, to type there. */
  onOpen: () => void;
  /** A chip tapped: ask it straight away. */
  onAsk: (question: string) => void;
}

/**
 * AskNetra — Ask BimaNetra's way in on the Quotes page (Figma 866:23105), under
 * the page title: NetraBot beside what looks like a chat field, typing sample
 * questions to itself behind a purple caret, with the orange Ask BimaNetra
 * button inside it, and starter questions under it. The field isn't typed
 * into here: a click (anywhere on it) opens the chat drawer, whose composer
 * takes the cursor; a chip asks its question there.
 * Usage: <AskNetra placeholder="Ask about…" askLabel="Ask BimaNetra" prompts={[…]} suggestions={[…]} onOpen={open} onAsk={ask} />
 */
export function AskNetra({ placeholder, askLabel, prompts, suggestions, onOpen, onAsk }: AskNetraProps) {
  const reduced = !!useReducedMotion();
  const typed = useTypewriter(prompts, !reduced);
  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.row}>
          <span className={styles.bot} aria-hidden>
            <NetraBot state="idle" follow="page" size={40} />
          </span>
          {/* One button that reads as the field: the prompt, then Ask BimaNetra. */}
          <button type="button" className={styles.field} onClick={onOpen} aria-haspopup="dialog" aria-label={placeholder}>
            {reduced ? (
              <span className={styles.prompt}>{placeholder}</span>
            ) : (
              // Right-anchored once a line outgrows the field, so the caret stays in view.
              <span className={styles.prompt} data-typed aria-hidden>
                <span className={styles.typed} data-typing={typed.typing || undefined}>
                  {typed.text}
                  <span className={styles.caret} />
                </span>
              </span>
            )}
            <span className={styles.ask}>{askLabel}</span>
          </button>
        </div>
        {!!suggestions.length && (
          <ul className={styles.chips}>
            {suggestions.map((s) => (
              <li key={s}>
                <button type="button" className={styles.chip} onClick={() => onAsk(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
