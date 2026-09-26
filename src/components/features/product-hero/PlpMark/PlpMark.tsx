"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { DitherImage } from "@/components/ui/DitherImage";
import { onHeroPulse } from "@/lib/heroPulse";
import styles from "./PlpMark.module.css";

export interface PlpMarkProps {
  src: string;
}

const SIZE = 102; // the icon; the 100×50 window shows its top half
const RISE_IGNITE_MS = 560; // when the rising icon clears the rule
const BURST_MS = 380;
// Re-ignites on a loose loop: every 3.5–5.5s, never a fixed beat.
const GLOW_EVERY_MS = [3500, 5500] as const;
const TYPING_ENERGY = 0.6;
const TYPING_HOLD_MS = 1200;

/**
 * PlpMark — the Focus hero's product mark sitting on the PLP name rule, in
 * "Sunrise": it rises from behind the rule, ignites as it clears, then keeps
 * re-igniting on a loose 3.5–5.5s loop. Typing the company name warms it and
 * Get My Quote fires a sparkle burst (via heroPulse). Decorative.
 * Usage: <PlpMark src="/media/plp-icon.svg" />
 */
export function PlpMark({ src }: PlpMarkProps) {
  const reduced = useReducedMotion();
  const riseRef = useRef<HTMLSpanElement>(null);
  const energy = useRef(0);
  const pulse = useRef({ base: 0, bursting: false, burstT: 0, typingT: 0 });

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

  // Rise from behind the rule, igniting as it clears. Imperative so it plays
  // even inside the landing's AnimatePresence initial={false}; CSS parks the
  // icon below the rule first.
  useEffect(() => {
    const el = riseRef.current;
    if (!el || reduced) return;
    const rise = animate(el, { y: [52, 0] }, { type: "spring", stiffness: 70, damping: 15, mass: 1 });
    const id = window.setTimeout(burst, RISE_IGNITE_MS);
    return () => {
      rise.stop();
      window.clearTimeout(id);
    };
  }, [reduced, burst]);

  // After the ignition, the burst recurs on a loose loop.
  useEffect(() => {
    if (reduced) return;
    let id = 0;
    const [min, max] = GLOW_EVERY_MS;
    const schedule = (wait: number) => {
      id = window.setTimeout(() => {
        if (!document.hidden) burst();
        schedule(min + Math.random() * (max - min));
      }, wait);
    };
    schedule(RISE_IGNITE_MS + min);
    return () => window.clearTimeout(id);
  }, [reduced, burst]);

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

  return (
    <div className={styles.mark} aria-hidden>
      <span ref={riseRef} className={styles.rise}>
        <DitherImage src={src} width={SIZE} height={SIZE} energy={energy} className={styles.art} />
      </span>
    </div>
  );
}
