"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import styles from "./AgentProgress.module.css";

export interface AgentProgressProps {
  /** Verb describing the agent's current activity ("Fetching"). */
  label: string;
  /** Controlled elapsed time in seconds; omit to run the internal timer. */
  elapsedSeconds?: number;
  /** Whether the internal timer advances. */
  running?: boolean;
  className?: string;
}

// 3×3 glyph cells, lit in reading order (beui's 0.14s cascade).
const CELLS = Array.from({ length: 9 }, (_, i) => i * 0.14);
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

function formatElapsed(total: number) {
  const s = Math.max(0, total);
  const minutes = Math.floor(s / 60);
  const seconds = (s % 60).toFixed(1);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

/**
 * AgentProgress — beui.dev "Agent Loading States" › Agent Progress, on our
 * tokens: a pulsing 3×3 activity glyph, the action verb and a live tabular
 * timer, for work whose progress we can't honestly quantify. Reduced motion
 * keeps a gentle opacity pulse.
 * Usage: <AgentProgress label="Fetching" />
 */
export function AgentProgress({ label, elapsedSeconds, running = true, className }: AgentProgressProps) {
  const reduce = useReducedMotion() ?? false;
  const [internal, setInternal] = useState(0);

  useEffect(() => {
    if (elapsedSeconds !== undefined || !running) return;
    const startedAt = performance.now();
    const id = window.setInterval(() => setInternal((performance.now() - startedAt) / 1000), 100);
    return () => window.clearInterval(id);
  }, [elapsedSeconds, running]);

  return (
    <span role="status" aria-label={`${label}, in progress`} className={cn(styles.progress, className)}>
      <span aria-hidden className={styles.glyph}>
        {CELLS.map((delay) => (
          <motion.span
            key={delay}
            className={styles.cell}
            animate={reduce ? { opacity: [0.35, 0.8, 0.35] } : { opacity: [0.28, 1, 0.28], scale: [0.72, 1, 0.72] }}
            transition={{ duration: 1.55, ease: EASE_IN_OUT, repeat: Infinity, delay }}
          />
        ))}
      </span>
      <span className={styles.label}>{label}</span>
      <span aria-hidden className={styles.time}>
        {formatElapsed(elapsedSeconds ?? internal)}
      </span>
    </span>
  );
}
