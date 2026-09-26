"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import styles from "./DitherImage.module.css";

export interface DitherImageProps {
  src: string;
  /** Rendered size in CSS px (one dither grain per CSS px). */
  width: number;
  height: number;
  /** Colour levels per channel after dithering (fewer = grainier). */
  levels?: number;
  /** One breath of the pulse, in ms. */
  period?: number;
  /** How far the pulse thins the grain (0 = still, 1 = fully). */
  depth?: number;
  className?: string;
}

// 16×16 Bayer matrix (built recursively from 2×2), as thresholds in (0, 1).
const BAYER_SIZE = 16;
const BAYER = (() => {
  let m = [0];
  for (let n = 1; n < BAYER_SIZE; n *= 2) {
    const next: number[] = new Array(n * 2 * n * 2);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = m[y * n + x] * 4;
        next[y * 2 * n + x] = v;
        next[y * 2 * n + x + n] = v + 2;
        next[(y + n) * 2 * n + x] = v + 3;
        next[(y + n) * 2 * n + x + n] = v + 1;
      }
    }
    m = next;
  }
  return m.map((v) => (v + 0.5) / (BAYER_SIZE * BAYER_SIZE));
})();

// Pulse rings across the image (how many bands travel out at once).
const RINGS = 4;
// How much of the motion is per-grain shimmer vs. the travelling rings.
const SHIMMER = 0.6;
// Redraw cap: 60fps on any refresh rate (120Hz draws every 2nd frame).
const FRAME_MS = 1000 / 60;

/**
 * DitherImage — draws an image through an animated ordered dither, like
 * Figma's Dither effect but alive: every pixel's alpha and colour are snapped
 * against a fixed 16×16 Bayer threshold. Two motions blend on top: every
 * grain twinkles on its own slow sine (random phase and speed, so the field
 * shimmers), and four soft rings travel out from the centre. The grid never
 * moves, so the shimmer glints rather than flickers.
 * Runs on a tiny canvas (one grain per CSS px, scaled up pixelated). Pauses
 * off-screen and in hidden tabs; reduced motion keeps a single still frame.
 * Usage: <DitherImage src="/media/plp-icon.svg" width={102} height={102} />
 */
export function DitherImage({ src, width, height, levels = 12, period = 6000, depth = 0.45, className }: DitherImageProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;

    let source: Uint8ClampedArray | null = null;
    let frame = 0;
    let last = 0;
    let visible = true;
    const out = ctx.createImageData(width, height);
    const step = 255 / (levels - 1);
    const cx = width / 2;
    const cy = height / 2;
    const reach = Math.hypot(cx, cy);
    // Per-grain constants: ring distance, plus a random twinkle phase + speed.
    const count = width * height;
    const ring = new Float32Array(count);
    const glintPhase = new Float32Array(count);
    const glintSpeed = new Float32Array(count);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const k = y * width + x;
        ring[k] = (Math.hypot(x - cx, y - cy) / reach) * RINGS * Math.PI * 2;
        glintPhase[k] = Math.random() * Math.PI * 2;
        glintSpeed[k] = 0.6 + Math.random() * 1.4;
      }
    }

    const draw = (now: number) => {
      if (!source) return;
      const phase = (now / period) * Math.PI * 2;
      const d = out.data;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const k = y * width + x;
          const i = k * 4;
          const t = BAYER[(y % BAYER_SIZE) * BAYER_SIZE + (x % BAYER_SIZE)];
          const rings = 0.5 + 0.5 * Math.sin(phase - ring[k]);
          const glint = 0.5 + 0.5 * Math.sin(phase * glintSpeed[k] + glintPhase[k]);
          const wave = rings * (1 - SHIMMER) + glint * SHIMMER;
          const a = (source[i + 3] / 255) * (1 - depth * wave);
          if (a <= t) {
            d[i + 3] = 0;
            continue;
          }
          for (let c = 0; c < 3; c++) {
            const v = source[i + c] / step;
            const lo = Math.floor(v);
            d[i + c] = Math.min(255, (v - lo > t ? lo + 1 : lo) * step);
          }
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      // 2ms slack absorbs rAF jitter; carrying the remainder keeps it drift-free.
      if (!visible || now - last < FRAME_MS - 2) return;
      last = now - ((now - last) % FRAME_MS);
      draw(now);
    };

    const img = new Image();
    img.onload = () => {
      const buffer = document.createElement("canvas");
      buffer.width = width;
      buffer.height = height;
      const b = buffer.getContext("2d");
      if (!b) return;
      b.drawImage(img, 0, 0, width, height);
      source = b.getImageData(0, 0, width, height).data;
      draw(performance.now());
      if (!reduced) frame = requestAnimationFrame(loop);
    };
    img.src = src;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === "visible";
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      img.onload = null;
    };
  }, [src, width, height, levels, period, depth, reduced]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      aria-hidden
      className={cn(styles.canvas, className)}
      style={{ width, height }}
    />
  );
}
