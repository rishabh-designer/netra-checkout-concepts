"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { TextEffect } from "@/components/core/text-effect";
import {
  ChevronRightIcon,
  type ChevronRightIconHandle,
} from "@/components/icons/ChevronRightIcon";
import styles from "./CtaButton.module.css";

/** One shared beat: the chevron nudge, the text reveal and the sheen sweep all
    fire on this tick so they pulse in lockstep (chevron anim ~1s, then a rest). */
const LOOP_MS = 2000;

export interface CtaButtonProps {
  label?: string;
  /** Trailing text joined onto the label to form the full CTA sentence. */
  meta?: string;
  onClick?: () => void;
}

/**
 * CtaButton — the full-width orange call-to-action. The whole sentence
 * ("Get My Quote In 2 Minutes") reveals per-character on a loop, and the 16px
 * chevron on the right loops its nudge continuously.
 * Usage: <CtaButton label="Get My Quote" meta="In 2 Minutes" />
 */
export function CtaButton({ label = "Continue", meta, onClick }: CtaButtonProps) {
  const chevronRef = useRef<ChevronRightIconHandle>(null);
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(true);
  /* Bumped every other beat (4s); remounts the sheen so its slow sweep replays
     in lockstep with a full text reveal (see .sheen). */
  const [sheenTick, setSheenTick] = useState(0);
  const beatRef = useRef(0);

  const sentence = [label, meta].filter(Boolean).join(" ");

  useEffect(() => {
    if (reduced) return;
    chevronRef.current?.startAnimation();
    const id = window.setInterval(() => {
      chevronRef.current?.startAnimation();
      setRevealed((v) => !v);
      // sheen sweeps once every two beats (4s) so it can glide slowly
      beatRef.current += 1;
      if (beatRef.current % 2 === 0) setSheenTick((t) => t + 1);
    }, LOOP_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <button type="button" className={styles.button} onClick={onClick}>
      {!reduced && <span key={sheenTick} className={styles.sheen} aria-hidden />}
      <span className={styles.labelSlot}>
        <TextEffect
          per="char"
          preset="fade"
          trigger={revealed}
          className={styles.label}
        >
          {sentence}
        </TextEffect>
      </span>
      <ChevronRightIcon
        ref={chevronRef}
        size={20}
        color="var(--color-label-inverse)"
        className={styles.chevron}
      />
    </button>
  );
}
