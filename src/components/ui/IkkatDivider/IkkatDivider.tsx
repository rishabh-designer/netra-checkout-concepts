"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { IkkatMark } from "@/components/ui/IkkatMark";
import styles from "./IkkatDivider.module.css";

export interface IkkatDividerProps {
  /** Horizontal px each mark occupies — mark count = container width / unit. */
  unit?: number;
  /** Mark height in px (aspect locked 2:1, so each mark is 2× this wide). */
  height?: number;
  /** Any CSS color; defaults to the IkkatMark brand-primary token. */
  color?: string;
  className?: string;
}

/**
 * IkkatDivider — a full-width woven rule: a row of ikkat marks alternating
 * between pattern 1 and pattern 2, spread edge-to-edge. The count tracks the
 * container width (one mark per `unit` px), so it re-tiles responsively, with
 * 8px side padding. Reuses IkkatMark verbatim (masked, never edits the SVG).
 * Usage: <IkkatDivider />
 */
export function IkkatDivider({ unit = 20, height = 4, color, className }: IkkatDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  // Mark count = (the divider's own width) / unit, re-measured on resize.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setCount(Math.max(2, Math.floor(el.clientWidth / unit)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [unit]);

  return (
    <div ref={ref} aria-hidden className={cn(styles.divider, className)}>
      {Array.from({ length: count }, (_, i) => (
        <IkkatMark key={i} pattern={i % 2 === 0 ? 1 : 2} width={height * 2} color={color} />
      ))}
    </div>
  );
}
