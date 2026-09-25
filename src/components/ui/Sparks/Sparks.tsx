"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import styles from "./Sparks.module.css";

export interface SparksProps {
  /** Number of sparks in the burst. */
  count?: number;
  /** Travel range in px (min, max). */
  distance?: [number, number];
  /** Seconds before the first spark leaves. */
  delay?: number;
  className?: string;
}

const GOLDEN_ANGLE = 137.508;
const TONES = ["var(--color-brand-secondary)", "var(--color-caution)", "var(--color-gold)", "var(--color-gold-highlight)"];

/**
 * Sparks — a one-shot burst of ikkat diamonds from the centre of its box.
 * Each spark flies out along a golden-angle heading (so the burst never looks
 * gridded), spins and scales up then out, staggered by a few ms. Renders
 * nothing under reduced motion. Mount it to fire; unmount to reset.
 * Usage: <Sparks count={18} distance={[140, 260]} delay={0.25} />
 */
export function Sparks({ count = 14, distance = [100, 200], delay = 0, className }: SparksProps) {
  const reduced = useReducedMotion();
  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = ((i * GOLDEN_ANGLE) % 360) * (Math.PI / 180);
        const t = (Math.sin(i * 12.9898) * 43758.5453) % 1; // stable pseudo-random 0..1
        const d = distance[0] + Math.abs(t) * (distance[1] - distance[0]);
        return {
          x: Math.cos(angle) * d,
          y: Math.sin(angle) * d * 0.72,
          size: 5 + Math.abs(t) * 5,
          rotate: 90 + Math.abs(t) * 180,
          color: TONES[i % TONES.length],
          delay: delay + i * 0.012,
        };
      }),
    [count, distance, delay],
  );

  if (reduced) return null;

  return (
    <span className={`${styles.burst} ${className ?? ""}`} aria-hidden>
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className={styles.spark}
          style={{ width: s.size, height: s.size, background: s.color }}
          initial={{ x: 0, y: 0, scale: 0, rotate: 45, opacity: 1 }}
          animate={{ x: s.x, y: s.y, scale: [0, 1.15, 0], rotate: 45 + s.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: 1.1, delay: s.delay, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 1] }}
        />
      ))}
    </span>
  );
}
