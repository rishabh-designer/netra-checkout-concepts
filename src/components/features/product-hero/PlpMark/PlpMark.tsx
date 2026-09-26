"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import type { PlpMarkModeContent } from "@/types/productPage";
import { DitherImage, type ShimmerPointer } from "@/components/ui/DitherImage";
import { Toast } from "@/components/ui/Toast";
import { onHeroPulse } from "@/lib/heroPulse";
import styles from "./PlpMark.module.css";

export interface PlpMarkProps {
  src: string;
  label: string;
  modes: PlpMarkModeContent[];
  /** Toast title on switch; "{name}" is replaced with the mode's name. */
  toastTitle: string;
}

const SIZE = 102; // the icon; the 100×50 window shows its top half
const RISE_IGNITE_MS = 560; // when the rising icon clears the rule
const BURST_MS = 380;
const TYPING_ENERGY = 0.6;
const TYPING_HOLD_MS = 1200;
const TILT_RADIUS = 600; // px from the icon at which the tilt maxes out

/**
 * PlpMark — the Focus hero's product mark sitting on the PLP name rule. Four
 * micro-animations, cycled by clicking the icon (a toast names each):
 * Sunrise (rises from behind the rule and ignites), Strokes (light rides the
 * artwork's lines), Tilt (the sheen springs toward the cursor), Spill (the
 * glow falls onto the rule). In every mode typing the company name warms it
 * and Get My Quote fires a sparkle burst (via heroPulse).
 * Usage: <PlpMark src="/media/plp-icon.svg" label="…" modes={…} toastTitle="Switched to {name}" />
 */
export function PlpMark({ src, label, modes, toastTitle }: PlpMarkProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [riseKey, setRiseKey] = useState(0);
  const [toast, setToast] = useState(false);
  const windowRef = useRef<HTMLButtonElement>(null);
  const riseRef = useRef<HTMLSpanElement>(null);
  const spillRef = useRef<HTMLSpanElement>(null);
  const energy = useRef(0);
  const pointer = useRef<ShimmerPointer>({ x: 0, y: 0, at: 0, active: false });
  const pulse = useRef({ base: 0, bursting: false, burstT: 0, typingT: 0 });
  const mode = modes[index]?.id ?? "sunrise";

  const burst = useCallback(() => {
    const p = pulse.current;
    p.bursting = true;
    energy.current = 1;
    window.clearTimeout(p.burstT);
    p.burstT = window.setTimeout(() => {
      p.bursting = false;
      energy.current = p.base;
    }, BURST_MS);
  }, []);

  // Sunrise: rise from behind the rule, igniting as it clears (on load and on
  // re-entry). Imperative so it plays even inside the landing's
  // AnimatePresence initial={false}; CSS parks the icon below the rule first.
  useEffect(() => {
    const el = riseRef.current;
    if (!el || reduced) return;
    const rise = animate(el, { y: [52, 0] }, { type: "spring", stiffness: 70, damping: 15, mass: 1 });
    const id = window.setTimeout(burst, RISE_IGNITE_MS);
    return () => {
      rise.stop();
      window.clearTimeout(id);
    };
  }, [riseKey, reduced, burst]);

  // Form reactions: typing warms the glow; submit bursts.
  useEffect(() => {
    const p = pulse.current;
    const off = onHeroPulse((kind) => {
      if (kind === "submit") return burst();
      p.base = TYPING_ENERGY;
      if (!p.bursting) energy.current = TYPING_ENERGY;
      window.clearTimeout(p.typingT);
      p.typingT = window.setTimeout(() => {
        p.base = 0;
        if (!p.bursting) energy.current = 0;
      }, TYPING_HOLD_MS);
    });
    return () => {
      off();
      window.clearTimeout(p.burstT);
      window.clearTimeout(p.typingT);
    };
  }, [burst]);

  // Tilt input: fine pointers only (touch keeps the autonomous sway).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const move = (e: PointerEvent) => {
      const r = windowRef.current?.getBoundingClientRect();
      if (!r) return;
      pointer.current = {
        x: clamp((e.clientX - (r.left + r.width / 2)) / TILT_RADIUS),
        y: clamp((e.clientY - (r.top + r.height / 2)) / TILT_RADIUS),
        at: performance.now(),
        active: true,
      };
    };
    const leave = () => (pointer.current = { ...pointer.current, active: false });
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  // Spill: move the rule glow with the sheen, straight on the element.
  const onLight = useCallback(
    (x: number, strength: number) => {
      const el = spillRef.current;
      if (!el || mode !== "spill") return;
      el.style.setProperty("--spill-x", `${x * 100}%`);
      el.style.setProperty("--spill-o", `${Math.min(1, strength * 2.2)}`);
    },
    [mode],
  );

  const next = () => {
    const i = (index + 1) % modes.length;
    setIndex(i);
    if (modes[i].id === "sunrise") setRiseKey((k) => k + 1);
    setToast(false);
    requestAnimationFrame(() => setToast(true));
  };

  const current = modes[index];

  return (
    <div className={styles.mark} data-mode={mode}>
      <button ref={windowRef} type="button" className={styles.window} aria-label={label} onClick={next}>
        <span ref={riseRef} className={styles.rise}>
          <DitherImage src={src} width={SIZE} height={SIZE} mode={mode} energy={energy} pointer={pointer} onLight={onLight} className={styles.art} />
        </span>
      </button>
      <span ref={spillRef} className={styles.spill} aria-hidden />
      <Toast
        open={toast}
        title={toastTitle.replace("{name}", current?.name ?? "")}
        description={current?.description}
        onClose={() => setToast(false)}
      />
    </div>
  );
}
