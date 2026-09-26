"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { createNoise3D } from "./noise";
import { BAYER, BAYER_SIZE } from "./bayer";
import { shade, type ShadeBuffers } from "./shade";
import styles from "./DitherImage.module.css";

export interface DitherImageProps {
  src: string;
  /** Rendered size in CSS px. */
  width: number;
  height: number;
  /** 0..1: how unpredictable the sway is. 1 = maximum randomness. */
  chaos?: number;
  /** Target excitement 0..1, read every frame and eased (form reactions). */
  energy?: RefObject<number>;
  className?: string;
}

const CELL = 4;
const FRAME_MS = 1000 / 60;
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * DitherImage — a swaying shimmer over an image: a soft sheen that drifts,
 * leans and breathes on unrelated sines (random phases per load, never a
 * loop), plus clustered device-pixel glitter (see shade.ts). `energy`
 * excites it. Native pixel ratio (up to 2×), 60fps, paused off-screen;
 * reduced motion shows the plain image.
 * Usage: <DitherImage src="/media/plp-icon.svg" width={102} height={102} energy={energyRef} />
 */
export function DitherImage({ src, width, height, chaos = 1, energy, className }: DitherImageProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(width * dpr);
    const H = Math.round(height * dpr);
    canvas.width = W;
    canvas.height = H;

    const ph = Array.from({ length: 8 }, () => Math.random() * Math.PI * 2);
    const noise = createNoise3D();
    const count = W * H;
    const GW = Math.ceil(W / CELL) + 1;
    const GH = Math.ceil(H / CELL) + 1;
    let buffers: ShadeBuffers | null = null;
    let frame = 0;
    let last = 0;
    let visible = true;
    let e = 0; // eased energy
    const out = ctx.createImageData(W, H);

    const draw = (now: number) => {
      if (!buffers) return;
      const t = now / 1000;
      const target = energy?.current ?? 0; // a ref: read live, no restart
      e += (target - e) * (target > e ? 0.25 : 0.035);

      const centre =
        0.55 + (0.35 + chaos * 0.25) * Math.sin(t * 0.43 + ph[0]) + (0.1 + chaos * 0.15) * Math.sin(t * 0.97 + ph[1]) + chaos * 0.06 * Math.sin(t * 2.3 + ph[2]);
      const ax = 0.75 + chaos * 0.25 * Math.sin(t * 0.31 + ph[3]);
      const ay = 0.45 + chaos * 0.3 * Math.sin(t * 0.37 + ph[4]);
      const band = 0.14 * (1 + chaos * 0.4 * Math.sin(t * 0.59 + ph[5]));
      const strength = 0.36 + 0.1 * Math.sin(t * 0.71 + ph[6]);

      const drift = t * (0.06 + chaos * 0.1);
      for (let gy = 0; gy < GH; gy++) {
        for (let gx = 0; gx < GW; gx++) {
          const n = noise(((gx * CELL) / W) * 3 + drift, ((gy * CELL) / H) * 3 - drift * 0.6, t * 0.15);
          buffers.cluster[gy * GW + gx] = 1 - chaos + chaos * smooth(-0.15, 0.3, n);
        }
      }
      shade(out.data, buffers, { seconds: t, centre, ax, ay, band, strength, energy: e });
      ctx.putImageData(out, 0, 0);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      // 2ms slack absorbs rAF jitter; advance one frame at a time (drift-free).
      if (!visible || now - last < FRAME_MS - 2) return;
      last = Math.max(last + FRAME_MS, now - FRAME_MS);
      draw(now);
    };

    const img = new Image();
    img.onload = () => {
      if (reduced) return void ctx.drawImage(img, 0, 0, W, H);
      const buffer = document.createElement("canvas");
      buffer.width = W;
      buffer.height = H;
      const b = buffer.getContext("2d");
      if (!b) return;
      b.drawImage(img, 0, 0, W, H);
      const source = b.getImageData(0, 0, W, H).data;
      const nx = new Float32Array(count);
      const ny = new Float32Array(count);
      const dither = new Float32Array(count);
      const glintPhase = new Float32Array(count);
      const glintSpeed = new Float32Array(count);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const k = y * W + x;
          nx[k] = x / W;
          ny[k] = y / H;
          dither[k] = BAYER[(y % BAYER_SIZE) * BAYER_SIZE + (x % BAYER_SIZE)];
          glintPhase[k] = Math.random() * Math.PI * 2;
          glintSpeed[k] = 1.5 + Math.random() * 3;
        }
      }
      buffers = { W, H, source, nx, ny, dither, glintPhase, glintSpeed, cluster: new Float32Array(GW * GH), GW, CELL };
      draw(performance.now());
      frame = requestAnimationFrame(loop);
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
  }, [src, width, height, chaos, energy, reduced]);

  return <canvas ref={ref} width={width} height={height} aria-hidden className={cn(styles.canvas, className)} style={{ width, height }} />;
}
