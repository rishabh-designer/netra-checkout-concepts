import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  /** text = 1em line · rectangular = square corners · rounded = 12px ·
   *  circular = full circle (MUI Skeleton's variants). */
  variant?: "text" | "rectangular" | "rounded" | "circular";
  width?: number | string;
  height?: number | string;
  /** Stagger offset (ms): delays both the fade-up entrance and the shimmer
   *  wave, so a layout of skeletons draws in and shimmers as a cascade. */
  delay?: number;
  className?: string;
}

/**
 * Skeleton — a placeholder block with a soft wave shimmer (after MUI Skeleton,
 * built on tokens). Pass `delay` per block to stagger a layout. Decorative only
 * (aria-hidden) — the host announces the loading state.
 * Usage: <Skeleton variant="rounded" width={72} height={32} delay={120} />
 */
export function Skeleton({ variant = "text", width, height, delay = 0, className }: SkeletonProps) {
  const style = {
    width,
    height,
    "--sk-delay": `${delay}ms`,
  } as CSSProperties;
  return <span aria-hidden className={cn(styles.skeleton, styles[variant], className)} style={style} />;
}
