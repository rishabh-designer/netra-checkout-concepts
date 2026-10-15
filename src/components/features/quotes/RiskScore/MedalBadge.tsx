"use client";

import { useReducedMotion } from "motion/react";
import { EDGE, hexagon } from "./medalShape";
import { MedalFace } from "./MedalFace";
import styles from "./RiskScore.module.css";

const BODY = hexagon(94, 13);
/** The back face sits just behind the last edge layer, turned round. */
const BACK_Z = EDGE[EDGE.length - 1].z - 0.6;

export interface MedalBadgeProps {
  /** The score's word, engraved large ("Excellent", or a provisional "Excellent*"). */
  score: string;
  /** Engraved under it ("Business Health"). */
  label: string;
  /** Spins on a loop (the popup); otherwise it holds still. */
  loop?: boolean;
}

/**
 * MedalBadge — the alternate Business Health badge (the back of the flip): a
 * thick gold hexagon medal, point on top. Its body is real depth (20 layers,
 * light at the lip to deep at the back) between two faces, so its edge shows
 * as it turns. With `loop` it rests face-on, swaying a touch, then eases into
 * a full turn and lands (still for reduced motion); without, it holds still.
 * Usage: <MedalBadge score="Excellent" label="Business Health" />
 */
export function MedalBadge({ score, label, loop = false }: MedalBadgeProps) {
  const still = useReducedMotion();
  return (
    <div className={styles.medalBody} data-loop={loop && !still ? "" : undefined} aria-hidden>
      {/* The thickness: the outline stacked between the faces. */}
      {EDGE.map((e) => (
        <svg key={e.z} viewBox="0 0 200 200" className={styles.medalEdge} style={{ transform: `translateZ(${e.z}px)` }}>
          <path d={BODY} style={{ fill: `var(--color-medal${e.tone})` }} />
        </svg>
      ))}
      <MedalFace score={score} label={label} />
      <MedalFace score={score} label={label} style={{ transform: `translateZ(${BACK_Z}px) rotateY(180deg)` }} />
    </div>
  );
}
