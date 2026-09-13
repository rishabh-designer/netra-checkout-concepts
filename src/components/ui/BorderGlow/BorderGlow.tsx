"use client";

/**
 * BorderGlow — wraps a panel and raises a soft, multi-colour glow that follows
 * the pointer along the border nearest the cursor (from anywhere inside, not
 * just near an edge). Authored to the design-owner's API; here it keeps the
 * wrapped panel light (edge ring only — the snippet's dark backgroundColor is
 * intentionally ignored). Moves are rAF-throttled to one layout read per frame;
 * pointer tracking is disabled under reduced-motion. Used on the left
 * Intelligence Engine panel.
 */

import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import styles from "./BorderGlow.module.css";

export interface BorderGlowProps {
  children: ReactNode;
  /** px distance from an edge at which the glow reaches full intensity. */
  edgeSensitivity?: number;
  /** radius (px) of the travelling glow blob. */
  glowRadius?: number;
  /** peak glow opacity (0–1). */
  glowIntensity?: number;
  /** thickness (px) of the glowing border band. */
  borderWidth?: number;
  /** ring colours blended into the travelling gradient. */
  colors?: string[];
  borderRadius?: number;
  className?: string;
  /** Accepted for parity with the source snippet; unused in the light variant. */
  coneSpread?: number;
  animated?: boolean;
  glowColor?: string;
  backgroundColor?: string;
}

export function BorderGlow({
  children,
  glowRadius = 40,
  glowIntensity = 1,
  borderWidth = 1.5,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  borderRadius = 16,
  className,
}: BorderGlowProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  // Apply the latest pointer position once per animation frame — a pointermove
  // can fire dozens of times per frame and each getBoundingClientRect() forces a
  // layout, so coalescing to one read per frame keeps the hover cheap.
  const apply = () => {
    frame.current = null;
    const el = ref.current;
    const p = pointer.current;
    if (!el || !p) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, p.x - r.left));
    const y = Math.max(0, Math.min(r.height, p.y - r.top));
    // Light the point on the border NEAREST the pointer (its projection onto the
    // closest edge), so the glow follows the cursor along the border from
    // anywhere inside the panel — including the centre — not just near an edge.
    const dL = x;
    const dR = r.width - x;
    const dT = y;
    const dB = r.height - y;
    const nearest = Math.min(dL, dR, dT, dB);
    let bx = x;
    let by = y;
    if (nearest === dL) bx = 0;
    else if (nearest === dR) bx = r.width;
    else if (nearest === dT) by = 0;
    else by = r.height;
    el.style.setProperty("--bg-x", `${bx}px`);
    el.style.setProperty("--bg-y", `${by}px`);
    el.style.setProperty("--bg-glow", `${glowIntensity}`);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    pointer.current = { x: e.clientX, y: e.clientY };
    if (frame.current === null) frame.current = requestAnimationFrame(apply);
  };
  const onLeave = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    pointer.current = null;
    ref.current?.style.setProperty("--bg-glow", "0");
  };

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const style = {
    "--bg-radius": `${glowRadius * 2}px`,
    "--bg-border": `${borderWidth}px`,
    "--bg-gradient": `radial-gradient(circle var(--bg-radius) at var(--bg-x, -100px) var(--bg-y, -100px), ${colors.join(", ")}, transparent 72%)`,
    borderRadius: `${borderRadius}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={cn(styles.wrap, className)}
      style={style}
      onPointerMove={reduced ? undefined : onMove}
      onPointerLeave={reduced ? undefined : onLeave}
    >
      <span className={styles.glow} aria-hidden />
      {children}
    </div>
  );
}
