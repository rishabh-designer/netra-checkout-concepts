"use client";

/**
 * RingSweep — a continuously sweeping ring spinner for a task that is actively
 * running (e.g. the Intelligence Engine's "Confirm your Insurance" row). Ported
 * from the design-owner's framer-motion snippet to the project's motion/react;
 * a static ring under reduced-motion.
 */

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import styles from "./RingSweep.module.css";

export interface RingSweepProps {
  /** Outer diameter in px (default 14, sized to a task-row icon box). */
  size?: number;
  className?: string;
  /** Sweep the ring. False = a static ring — a queued/pending marker, not a
   *  live "working" status. Default true. */
  spin?: boolean;
  /** Uniform grey ring with no purple accent arc — for a not-yet-started task,
   *  so it reads as quiet/pending next to the spinning active ring. Default false. */
  muted?: boolean;
}

export function RingSweep({ size = 14, className, spin = true, muted = false }: RingSweepProps) {
  const reduced = useReducedMotion();
  const sweeping = spin && !reduced;
  return (
    <motion.span
      className={cn(styles.ring, muted && styles.ringMuted, className)}
      style={{ width: size, height: size }}
      // A static ring conveys nothing to AT — the row's text label carries the
      // meaning — so only the sweeping ring announces a live "Working" status.
      role={sweeping ? "status" : undefined}
      aria-label={sweeping ? "Working" : undefined}
      aria-hidden={sweeping ? undefined : true}
      animate={sweeping ? { rotate: 360 } : undefined}
      transition={sweeping ? { duration: 1, repeat: Infinity, ease: "linear" } : undefined}
    />
  );
}
