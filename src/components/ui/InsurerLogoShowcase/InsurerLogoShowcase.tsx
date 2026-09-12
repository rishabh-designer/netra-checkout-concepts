"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { InsurerLogo } from "@/types/productPage";
import styles from "./InsurerLogoShowcase.module.css";

export interface InsurerLogoShowcaseProps {
  /** One entry per slot; each slot cycles through its logos (one per set). */
  slots?: InsurerLogo[][];
  /** ms each set is held before the wall advances to the next. */
  interval?: number;
  /** Seconds of delay added per slot — creates the left-to-right blur wave. */
  stagger?: number;
  /** Seconds each logo takes to blur in/out. */
  fadeDuration?: number;
  /** Blur radius (px) applied to a logo as it fades out. */
  blur?: number;
  /** Scale of a logo when faded out — it shrinks to this as it blurs away. */
  fadeScale?: number;
}

/**
 * InsurerLogoShowcase — a fixed row of logo slots. Every `interval` the whole
 * wall advances to the next set, each slot blurring its logo out and the next
 * one in; the per-slot `stagger` makes the change ripple left→right. Each slot
 * is sized to its widest logo so the row never reflows as logos swap.
 * Usage: <InsurerLogoShowcase slots={providerShowcase} />
 */
export function InsurerLogoShowcase({
  slots = [],
  interval = 4000,
  stagger = 0.25,
  fadeDuration = 1.5,
  blur = 3,
  fadeScale = 20 / 24,
}: InsurerLogoShowcaseProps) {
  const reduced = useReducedMotion();
  const cycleLength = slots.reduce((max, s) => Math.max(max, s.length), 1);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || cycleLength <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % cycleLength);
    }, interval);
    return () => window.clearInterval(id);
  }, [reduced, cycleLength, interval]);

  return (
    <div className={styles.row}>
      {slots.map((logos, s) => {
        const slotWidth = Math.max(...logos.map((l) => l.width));
        const active = index % logos.length;
        return (
          <div
            key={s}
            className={styles.slot}
            style={{ width: `${slotWidth}px` }}
          >
            {logos.map((logo, l) => (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                className={styles.logo}
                style={{ width: `${logo.width}px` }}
                initial={false}
                animate={
                  l === active
                    ? { opacity: 1, filter: "blur(0px)", scale: 1 }
                    : { opacity: 0, filter: `blur(${blur}px)`, scale: fadeScale }
                }
                transition={{
                  duration: fadeDuration,
                  delay: reduced ? 0 : s * stagger,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
