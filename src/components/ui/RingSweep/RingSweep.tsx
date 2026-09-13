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
}

export function RingSweep({ size = 14, className }: RingSweepProps) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className={cn(styles.ring, className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Working"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={reduced ? undefined : { duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}
