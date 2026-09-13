"use client";

/**
 * AITextLoading — a shimmering gradient sweep across a single label, used for the
 * Intelligence Engine's *active* task (e.g. "Confirm your Insurance", Figma
 * 320:26294). Adapted from the kokonutui AI-Text-Loading snippet: a single
 * row-sized label instead of the cycling 3xl display, the Tailwind bg-clip-text
 * gradient reimplemented as a CSS-module background sweep. Static under
 * reduced-motion.
 */

import { cn } from "@/lib/utils";
import styles from "./AITextLoading.module.css";

export interface AITextLoadingProps {
  text: string;
  className?: string;
}

export function AITextLoading({ text, className }: AITextLoadingProps) {
  return <span className={cn(styles.shimmer, className)}>{text}</span>;
}
