"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import styles from "./TextCascade.module.css";

export interface TextCascadeProps {
  /** Current text. Changing it cascades the letters to the new value. */
  text: string;
  /** Also cascade the first text in on mount (letters land from below). */
  appear?: boolean;
  /** Optional choreographed timing (tween) instead of beui's snappy spring,
   *  e.g. to sync with other motion on the page. Seconds. */
  timing?: { delay: number; exitDelay: number; stagger: number; enter: number; exit: number; ease: readonly number[] };
  className?: string;
}

const STAGGER = 0.025;
const SWAP_SPRING = { type: "spring", stiffness: 460, damping: 30, mass: 0.55 } as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const LETTER: Variants = {
  initial: { opacity: 0, y: "105%", filter: "blur(3px)" },
  animate: (delay: number = 0) => ({
    opacity: 1,
    y: "0%",
    filter: "blur(0px)",
    transition: { ...SWAP_SPRING, delay },
  }),
  exit: (delay: number = 0) => ({
    opacity: 0,
    y: "-105%",
    filter: "blur(3px)",
    transition: { duration: 0.16, ease: EASE_OUT, delay: delay * 0.5 },
  }),
};

/* Choreographed variant: tween timing supplied by the caller. */
function timedLetter(t: NonNullable<TextCascadeProps["timing"]>): Variants {
  const ease = t.ease as [number, number, number, number];
  return {
    initial: { opacity: 0, y: "105%", filter: "blur(3px)" },
    animate: (i: number = 0) => ({
      opacity: 1,
      y: "0%",
      filter: "blur(0px)",
      transition: { type: "tween", duration: t.enter, ease, delay: t.delay + i * t.stagger },
    }),
    exit: (i: number = 0) => ({
      opacity: 0,
      y: "-105%",
      filter: "blur(3px)",
      transition: { type: "tween", duration: t.exit, ease, delay: t.exitDelay + i * t.stagger * 0.6 },
    }),
  };
}

/**
 * TextCascade — beui.dev "Text Cascade" (Text Animation): a letter-by-letter
 * slot roll. When `text` changes, the old letters drop away upward as the new
 * ones land from below, left to right (25ms apart; exits at half the stagger
 * so the old tail lingers). The two strings overlap as independent layers, so
 * proportional glyphs never jitter; an invisible copy holds the final width.
 * Pass `timing` to sync with other motion (tween, caller-set delays).
 * Reduced motion swaps instantly.
 * Usage: <TextCascade text={title} className={styles.title} />
 */
export function TextCascade({ text, appear = false, timing, className }: TextCascadeProps) {
  const reduce = useReducedMotion();
  const letters = Array.from(text);
  const variants = timing ? timedLetter(timing) : LETTER;

  return (
    <span className={`${styles.root} ${className ?? ""}`}>
      <span className={styles.ghost} aria-hidden>
        {text}
      </span>
      {reduce ? (
        <span className={styles.layer}>{text}</span>
      ) : (
        <>
          <span className={styles.srOnly}>{text}</span>
          <AnimatePresence initial={appear}>
            <motion.span key={text} className={styles.layer} aria-hidden initial="initial" animate="animate" exit="exit">
              {letters.map((char, i) => (
                <motion.span key={i} custom={timing ? i : i * STAGGER} variants={variants} className={styles.letter}>
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </>
      )}
    </span>
  );
}
