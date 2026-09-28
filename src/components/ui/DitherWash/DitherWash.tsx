"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BAYER, BAYER_SIZE } from "../DitherImage/bayer";
import styles from "./DitherWash.module.css";

export interface DitherWashProps {
  /** Seconds before the sweep starts. */
  delay?: number;
  /** Seconds the band takes to cross. */
  duration?: number;
  /** Colour tokens: the band's leading edge, and the trail it leaves. */
  edgeToken?: string;
  trailToken?: string;
  /** Peak cell opacity (0–1); keep it low so it reads as light, not paint. */
  strength?: number;
  className?: string;
}

const CELL = 2; // CSS px per dither cell
const BAND = 0.16; // band half-width, as a share of the diagonal
const TRAIL = 0.34; // how dense the trail is right behind the band
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/** A colour token as [r, g, b] (hex only; falls back to warm white). */
function token(name: string): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace("#", "");
  if (hex.length !== 6) return [255, 246, 228];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/**
 * DitherWash — a quiet one-shot light across a surface: an ordered-dither
 * (Bayer) band rakes diagonally from bottom-left to top-right, leaving a thin
 * dithered trail that thins out and dissolves into the surface's own fill,
 * like a print developing. Fills its positioned parent (put content above it
 * with z-index); 2px cells, drawn pixelated. Mount to play; nothing under
 * reduced motion.
 * Usage: <DitherWash delay={0.1} duration={1.6} />
 */
export function DitherWash({
  delay = 0,
  duration = 1.6,
  edgeToken = "--color-gold",
  trailToken = "--color-brand-secondary-border",
  strength = 0.4,
  className,
}: DitherWashProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || reduced) return;
    const box = canvas.getBoundingClientRect();
    const W = Math.max(1, Math.ceil(box.width / CELL));
    const H = Math.max(1, Math.ceil(box.height / CELL));
    canvas.width = W;
    canvas.height = H;
    const edge = token(edgeToken);
    const trail = token(trailToken);
    const out = ctx.createImageData(W, H);
    const px = out.data;
    let frame = 0;
    let start = 0;

    const draw = (now: number) => {
      start ||= now;
      const t = (now - start) / 1000 - delay;
      if (t < 0) return void (frame = requestAnimationFrame(draw));
      const p = Math.min(1, t / duration);
      // The band starts off-surface and leaves it entirely by the end.
      const front = easeInOut(p) * (1 + 2 * BAND) - BAND;
      // The trail thins as the sweep completes, so it dissolves into the fill.
      const residue = TRAIL * Math.pow(1 - p, 1.6);
      px.fill(0);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          // Position along the bottom-left → top-right diagonal (0..1).
          const u = (x / W + (1 - y / H)) / 2;
          const off = (u - front) / BAND;
          const band = off > 3 || off < -3 ? 0 : Math.exp(-off * off);
          const behind = u < front ? residue * (1 - (front - u)) : 0;
          const light = band * 0.95 + behind;
          if (light <= 0.5 + BAYER[(y % BAYER_SIZE) * BAYER_SIZE + (x % BAYER_SIZE)]) continue;
          const i = (y * W + x) * 4;
          const c = band > behind ? edge : trail;
          px[i] = c[0];
          px[i + 1] = c[1];
          px[i + 2] = c[2];
          px[i + 3] = 255 * strength * Math.min(1, light + 0.3);
        }
      }
      ctx.putImageData(out, 0, 0);
      if (p < 1) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, W, H);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [delay, duration, edgeToken, trailToken, strength, reduced]);

  if (reduced) return null;
  return <canvas ref={ref} aria-hidden className={cn(styles.canvas, className)} />;
}
