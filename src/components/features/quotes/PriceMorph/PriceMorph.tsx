"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TextCascade } from "@/components/ui/TextCascade";
import styles from "./PriceMorph.module.css";

/** idle = old price waiting; play = run the morph; done = the offer at rest. */
export type PriceIntro = "idle" | "play" | "done";

export interface PriceMorphProps {
  /** The price before the offer ("₹10,000"). */
  from: string;
  /** The offer price ("₹6,500"). */
  to: string;
  intro?: PriceIntro;
}

type Phase = "full" | "struck" | "deal";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOLD_MS = 700; // let the old price register
const STRIKE_MS = 400; // the line draws, then the deal lands
const ROLL = { delay: 0.05, exitDelay: 0, stagger: 0.045, enter: 0.55, exit: 0.3, ease: EASE };

/**
 * PriceMorph — an offer price that tells its own story on the button: the old
 * price shows, a line strikes through it, then the number rolls down to the
 * offer (TextCascade) while a small struck "was" price pops out beside it.
 * "idle" holds the old price, "play" runs the morph, "done" (default) is the
 * resting offer with no motion. Reduced motion always shows the offer.
 * Usage: <PriceMorph from="₹10,000" to="₹6,500" intro="play" />
 */
export function PriceMorph({ from, to, intro = "done" }: PriceMorphProps) {
  const reduced = useReducedMotion();
  const settled = intro === "done" || !!reduced;
  const [phase, setPhase] = useState<Phase>(settled ? "deal" : "full");
  // Only animate if we arrived here through the story (not already at rest).
  const [animated] = useState(!settled);

  useEffect(() => {
    if (settled) return setPhase("deal");
    if (intro !== "play") return;
    const strike = window.setTimeout(() => setPhase("struck"), HOLD_MS);
    const deal = window.setTimeout(() => setPhase("deal"), HOLD_MS + STRIKE_MS);
    return () => {
      window.clearTimeout(strike);
      window.clearTimeout(deal);
    };
  }, [intro, settled]);

  const deal = phase === "deal";

  return (
    <span className={styles.morph}>
      <AnimatePresence initial={false}>
        {deal && (
          <motion.span
            key="was"
            className={styles.was}
            initial={animated ? { width: 0, opacity: 0, scale: 1.4, x: 8 } : false}
            animate={{ width: "auto", opacity: 0.7, scale: 1, x: 0 }}
            transition={{ type: "tween", duration: 0.5, ease: EASE }}
          >
            {from}
          </motion.span>
        )}
      </AnimatePresence>
      <span className={styles.now}>
        {animated ? <TextCascade text={deal ? to : from} timing={ROLL} /> : to}
        {animated && (
          <motion.span
            aria-hidden
            className={styles.strike}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === "full" ? 0 : 1, opacity: deal ? 0 : 1 }}
            transition={{ type: "tween", duration: deal ? 0.25 : 0.35, ease: EASE }}
          />
        )}
      </span>
    </span>
  );
}
