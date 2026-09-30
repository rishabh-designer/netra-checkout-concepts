"use client";

import { ease } from "@/lib/netrabot/interpolate";
import type { StepEasing } from "@/types/netrabot";
import styles from "./NetraLab.module.css";

export interface EasingCurveProps {
  easing: StepEasing;
  bounce: number;
}

const SAMPLES = 32;
const WIDTH = 48;
const HEIGHT = 28;
/** Room above and below for overshoot and wind-up. */
const HEADROOM = 0.35;

/**
 * EasingCurve - a tiny graph of a step's easing (time across, travel up), so
 * Spring's overshoot and Wind-up's pull back are visible before you play them.
 * Usage: <EasingCurve easing="spring" bounce={0.4} />
 */
export function EasingCurve({ easing, bounce }: EasingCurveProps) {
  const span = 1 + HEADROOM * 2;
  const points = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = i / SAMPLES;
    const v = ease(easing, t, bounce);
    const y = HEIGHT - ((v + HEADROOM) / span) * HEIGHT;
    return `${(t * WIDTH).toFixed(1)},${Math.max(0, Math.min(HEIGHT, y)).toFixed(1)}`;
  });
  const floor = HEIGHT - (HEADROOM / span) * HEIGHT;
  const ceiling = HEIGHT - ((1 + HEADROOM) / span) * HEIGHT;
  return (
    <svg className={styles.curve} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} aria-hidden>
      <line x1={0} x2={WIDTH} y1={floor} y2={floor} className={styles.curveGuide} />
      <line x1={0} x2={WIDTH} y1={ceiling} y2={ceiling} className={styles.curveGuide} />
      <polyline points={points.join(" ")} className={styles.curveLine} />
    </svg>
  );
}
