"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BAYER, BAYER_SIZE } from "../DitherImage/bayer";
import styles from "./DitherBurst.module.css";

export interface DitherBurstProps {
  /** Furthest the shockwave travels, in px from the centre. */
  radius?: number;
  /** Seconds before it fires (match the light it rides on). */
  delay?: number;
  /** Seconds the wave takes to reach `radius`. */
  duration?: number;
  className?: string;
}

const RING_PX = 16; // half-width of the dithered shockwave
const LINGER = 0.45; // s the glitter keeps twinkling after the wave
const GLINT_POWER = 10; // higher = rarer, sharper glints
const outExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));

/** A colour token as [r, g, b] (hex only; falls back to warm white). */
function token(name: string): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace("#", "");
  if (hex.length !== 6) return [255, 246, 228];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/**
 * DitherBurst — the PLP icon's dither and glitter, as a one-shot light burst:
 * an ordered-dither (Bayer) shockwave rolls out from the centre on an
 * out-expo curve, gold at its edge, and leaves device-cell glints twinkling
 * inside the disc that fade as it passes. Drawn on a canvas at one cell per
 * CSS px (pixelated), only inside the wave's bounds. Mount to fire; renders
 * nothing under reduced motion.
 * Usage: <DitherBurst radius={260} delay={0.3} duration={1.15} />
 */
export function DitherBurst({ radius = 260, delay = 0, duration = 1.15, className }: DitherBurstProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || reduced) return;
    const S = canvas.width;
    const C = S / 2;
    const count = S * S;
    const edge = token("--color-gold");
    const core = token("--color-gold-highlight");
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let k = 0; k < count; k++) {
      phase[k] = Math.random() * Math.PI * 2;
      speed[k] = 6 + Math.random() * 10;
    }
    const out = ctx.createImageData(S, S);
    const px = out.data;
    let frame = 0;
    let start = 0;

    const draw = (now: number) => {
      start ||= now;
      const t = (now - start) / 1000 - delay;
      if (t < 0) return void (frame = requestAnimationFrame(draw));
      const p = Math.min(1, t / duration);
      const r = radius * outExpo(p);
      // The wave dims as it spreads; the glitter outlives it briefly.
      const wave = Math.pow(1 - p, 1.4);
      const glitter = Math.max(0, 1 - t / (duration + LINGER));
      if (glitter <= 0) {
        ctx.clearRect(0, 0, S, S);
        return;
      }
      px.fill(0);
      const reach = Math.min(C, Math.ceil(r + RING_PX * 2));
      for (let y = Math.max(0, C - reach); y < Math.min(S, C + reach); y++) {
        const dy = y - C;
        for (let x = Math.max(0, C - reach); x < Math.min(S, C + reach); x++) {
          const dx = x - C;
          const d = Math.sqrt(dx * dx + dy * dy);
          const off = (d - r) / RING_PX;
          const ring = off > 3 ? 0 : Math.exp(-off * off) * wave;
          let glint = 0;
          if (d < r) {
            const k = y * S + x;
            // Denser toward the centre, thinning where the wave just passed.
            glint = Math.pow(0.5 + 0.5 * Math.sin(t * speed[k] + phase[k]), GLINT_POWER) * glitter * (1 - (d / radius) * 0.6);
          }
          const light = ring + glint;
          // Ordered dither: a cell is either lit or not, like the PLP icon.
          if (light <= 0.5 + BAYER[(y % BAYER_SIZE) * BAYER_SIZE + (x % BAYER_SIZE)]) continue;
          const i = (y * S + x) * 4;
          const warm = ring > glint ? 1 : 0; // the wave's edge is gold, glints warm white
          px[i] = warm ? edge[0] : core[0];
          px[i + 1] = warm ? edge[1] : core[1];
          px[i + 2] = warm ? edge[2] : core[2];
          px[i + 3] = 255 * Math.min(1, 0.55 + light * 0.45);
        }
      }
      ctx.putImageData(out, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [radius, delay, duration, reduced]);

  if (reduced) return null;
  const size = Math.ceil((radius + RING_PX * 2) * 2);
  return <canvas ref={ref} width={size} height={size} aria-hidden className={cn(styles.canvas, className)} style={{ width: size, height: size }} />;
}
