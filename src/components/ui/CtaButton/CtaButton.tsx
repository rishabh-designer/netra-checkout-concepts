"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { TextEffect } from "@/components/core/text-effect";
import {
  ChevronRightIcon,
  type ChevronRightIconHandle,
} from "@/components/icons/ChevronRightIcon";
import styles from "./CtaButton.module.css";

/** How often the chevron nudge replays (animation ~1s + a short rest). */
const CHEVRON_LOOP_MS = 1800;
/** How long the sentence stays revealed / hidden before the reveal loops. */
const TEXT_LOOP_MS = 2000;

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

  const sentence = [label, meta].filter(Boolean).join(" ");

  useEffect(() => {
    if (reduced) return;
    chevronRef.current?.startAnimation();
    const chevronId = window.setInterval(() => {
      chevronRef.current?.startAnimation();
    }, CHEVRON_LOOP_MS);
    const textId = window.setInterval(() => {
      setRevealed((v) => !v);
    }, TEXT_LOOP_MS);
    return () => {
      window.clearInterval(chevronId);
      window.clearInterval(textId);
    };
  }, [reduced]);

  return (
    <div className={styles.beam}>
      <button type="button" className={styles.button} onClick={onClick}>
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
    </div>
  );
}
