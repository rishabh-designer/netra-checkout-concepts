"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { BAYER, BAYER_SIZE } from "../DitherImage/bayer";
import styles from "./Sparks.module.css";
import { EASE_OUT } from "@/lib/motion";

export interface SparksProps {
  /** Number of sparks in the burst. */
  count?: number;
  /** Travel range in px (min, max). */
  distance?: [number, number];
  /** Seconds before the first spark leaves. */
  delay?: number;
  /** Spark colours, cycled (defaults to the Gold Quote's orange and golds).
   *  Tokens as `var(--name)`. */
  tones?: string[];
  /** Draw each spark as ordered-dither cells that break up as it fades
   *  (default), or as solid CSS diamonds. */
  dither?: boolean;
  className?: string;
}

const GOLDEN_ANGLE = 137.508;
const TONES = ["var(--color-brand-secondary)", "var(--color-caution)", "var(--color-gold)", "var(--color-gold-highlight)"];
const DURATION = 1.1; // s per spark
const PEAK = 0.35; // share of the flight where a spark is biggest
const CELL = 2; // CSS px per dither cell
const outQuart = (p: number) => 1 - Math.pow(1 - p, 4);

/** `var(--token)` → [r, g, b] (hex only; falls back to warm white). */
function rgb(tone: string): [number, number, number] {
  const name = tone.match(/var\((--[\w-]+)\)/)?.[1] ?? tone;
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace("#", "");
  if (hex.length !== 6) return [255, 246, 228];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/**
 * Sparks — a one-shot burst of ikkat diamonds from the centre of its box.
 * Each spark flies out along a golden-angle heading (so the burst never looks
 * gridded), spins and scales up then out, staggered by a few ms. By default
 * they're drawn in ordered dither (2px Bayer cells, like DitherBurst and
 * DitherWash): as a spark fades its cells drop out one by one, so it breaks
 * up rather than going transparent. Renders nothing under reduced motion.
 * Mount it to fire; unmount to reset.
 * Usage: <Sparks count={18} distance={[140, 260]} delay={0.25} />
 */
export function Sparks({ count = 14, distance = [100, 200], delay = 0, tones = TONES, dither = true, className }: SparksProps) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
          color: tones[i % tones.length],
          delay: delay + i * 0.012,
        };
      }),
    [count, distance, delay, tones],
  );
  // Canvas half-extent (CSS px): the furthest a spark can reach, plus its size.
  const reach = Math.ceil(distance[1] + 12);

  useEffect(() => {
    if (!dither || reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const S = Math.ceil((reach * 2) / CELL);
    canvas.width = S;
    canvas.height = S;
    const C = S / 2;
    const colours = sparks.map((s) => rgb(s.color));
    const out = ctx.createImageData(S, S);
    const px = out.data;
    const last = Math.max(...sparks.map((s) => s.delay)) + DURATION;
    let frame = 0;
    let start = 0;

    const draw = (now: number) => {
      start ||= now;
      const t = (now - start) / 1000;
      if (t > last) return void ctx.clearRect(0, 0, S, S);
      px.fill(0);
      sparks.forEach((s, n) => {
        const p = (t - s.delay) / DURATION;
        if (p <= 0 || p >= 1) return;
        const e = outQuart(p);
        // Scale 0 → 1.15 at the peak → 0; full strength until the peak, then fading.
        const scale = p < PEAK ? (p / PEAK) * 1.15 : 1.15 * (1 - (p - PEAK) / (1 - PEAK));
        const light = p < PEAK ? 1 : 1 - (p - PEAK) / (1 - PEAK);
        const half = (s.size * scale) / 2 / CELL;
        if (half <= 0) return;
        const cx = C + (s.x * e) / CELL;
        const cy = C + (s.y * e) / CELL;
        const rot = ((45 + s.rotate * e) * Math.PI) / 180;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const r = Math.ceil(half * 1.5);
        const [cr, cg, cb] = colours[n];
        for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(S - 1, Math.ceil(cy + r)); y++) {
          for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(S - 1, Math.ceil(cx + r)); x++) {
            const dx = x - cx;
            const dy = y - cy;
            // Inside the spinning square?
            if (Math.abs(dx * cos + dy * sin) > half || Math.abs(-dx * sin + dy * cos) > half) continue;
            // Ordered dither: as the spark fades, its cells drop out in Bayer order.
            if (light <= 0.5 + BAYER[(y % BAYER_SIZE) * BAYER_SIZE + (x % BAYER_SIZE)]) continue;
            const i = (y * S + x) * 4;
            px[i] = cr;
            px[i + 1] = cg;
            px[i + 2] = cb;
            px[i + 3] = 255;
          }
        }
      });
      ctx.putImageData(out, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [dither, reduced, sparks, reach]);

  if (reduced) return null;

  if (dither)
    return (
      <span className={`${styles.burst} ${className ?? ""}`} aria-hidden>
        <canvas ref={canvasRef} className={styles.canvas} style={{ width: reach * 2, height: reach * 2 }} />
      </span>
    );

  return (
    <span className={`${styles.burst} ${className ?? ""}`} aria-hidden>
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className={styles.spark}
          style={{ width: s.size, height: s.size, background: s.color }}
          initial={{ x: 0, y: 0, scale: 0, rotate: 45, opacity: 1 }}
          animate={{ x: s.x, y: s.y, scale: [0, 1.15, 0], rotate: 45 + s.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: DURATION, delay: s.delay, ease: EASE_OUT, times: [0, PEAK, 1] }}
        />
      ))}
    </span>
  );
}
