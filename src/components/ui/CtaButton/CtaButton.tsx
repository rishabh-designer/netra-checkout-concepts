"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ChevronRightIcon,
  type ChevronRightIconHandle,
} from "@/components/icons/ChevronRightIcon";
import styles from "./CtaButton.module.css";

/** One shared beat: the chevron nudge and the sheen sweep fire on this tick
    so they pulse in lockstep (chevron anim ~1s, then a rest). */
const LOOP_MS = 2000;

export interface CtaButtonProps {
  label?: string;
  /** Trailing text joined onto the label to form the full CTA sentence. */
  meta?: string;
  onClick?: () => void;
}

/**
 * CtaButton — the full-width orange call-to-action. The sentence ("Get My
 * Quote In 2 Minutes") is static; the chevron on the right loops its nudge
 * and a sheen sweeps across every other beat.
 * Usage: <CtaButton label="Get My Quote" meta="In 2 Minutes" />
 */
export function CtaButton({ label = "Continue", meta, onClick }: CtaButtonProps) {
  const chevronRef = useRef<ChevronRightIconHandle>(null);
  const reduced = useReducedMotion();
  /* Bumped every other beat (4s); remounts the sheen so its slow sweep replays
     in lockstep with a full text reveal (see .sheen). */
  const [sheenTick, setSheenTick] = useState(0);
  const beatRef = useRef(0);

  useEffect(() => {
    if (reduced) return;
    chevronRef.current?.startAnimation();
    const id = window.setInterval(() => {
      chevronRef.current?.startAnimation();
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
        <span className={styles.label}>
          {label}
          {meta && <>&nbsp;{meta}</>}
        </span>
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
