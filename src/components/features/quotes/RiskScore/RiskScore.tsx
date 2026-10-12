"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import styles from "./RiskScore.module.css";

/* The badge's three glow rings (Figma 776:32116-18): box in the 210 frame,
   then how far each SVG bleeds past it for its glow. */
const RINGS = [
  { src: "/figma/score/ring-1.svg", left: 0.22, top: 9.08, w: 209.553, h: 191.838, bleed: [8.71, 7.97] },
  { src: "/figma/score/ring-2.svg", left: 14.59, top: 21.88, w: 180.806, h: 166.253, bleed: [10.05, 9.24] },
  { src: "/figma/score/ring-3.svg", left: 27.46, top: 33.33, w: 155.072, h: 143.35, bleed: [11.65, 10.77] },
];

export interface RiskScoreBadgeProps {
  /** The score as shown ("82.4", or "N/A" when it couldn't be scored). */
  score: string;
  label: string;
  /** The scale after the score, small ("/100"). */
  outOf?: string;
  /** The info icon's tooltip. */
  info: string;
  /** Not scored (Case C): greyed rings and a grey pill. */
  muted?: boolean;
  /** Arrived already shown (a reload): no entrance. */
  still?: boolean;
}

/**
 * RiskScoreBadge — the Score tab's centrepiece (Figma 776:32113): three
 * glowing hex rings and the diamond mark behind an orange pill holding the
 * score in the serif, its label ("Business Health") and an info tooltip under it. The rings
 * fade in from the outside in and the pill lands last. `muted` greys it all
 * for a business we couldn't score.
 * Usage: <RiskScoreBadge score="82.4" outOf="/100" label="Business Health" info="…" />
 */
export function RiskScoreBadge({ score, label, outOf, info, muted = false, still = false }: RiskScoreBadgeProps) {
  const reduced = useReducedMotion();
  const quiet = reduced || still;
  return (
    <div className={styles.badge} data-muted={muted || undefined}>
      <div className={styles.art}>
        {RINGS.map((r, i) => (
          <motion.span
            key={r.src}
            className={styles.ring}
            style={{ left: r.left, top: r.top, width: r.w, height: r.h }}
            initial={quiet ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 + i * 0.12 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.src} alt="" style={{ top: `-${r.bleed[0]}%`, left: `-${r.bleed[1]}%`, width: `${100 + 2 * r.bleed[1]}%`, height: `${100 + 2 * r.bleed[0]}%` }} />
          </motion.span>
        ))}
        <motion.span
          className={styles.diamond}
          initial={quiet ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.4 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/score/diamond.svg" alt="" />
        </motion.span>
        <motion.span
          className={styles.pill}
          initial={quiet ? false : { opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={quiet ? undefined : { type: "spring", stiffness: 260, damping: 18, delay: 0.55 }}
        >
          {/* A trailing "*" (a provisional score) sits small and raised. */}
          {score.endsWith("*") ? (
            <>
              {score.slice(0, -1)}
              <span className={styles.note}>*</span>
            </>
          ) : (
            score
          )}
          {/* The scale, small on the baseline: "82.4/100". */}
          {outOf && <span className={styles.outOf}>{outOf}</span>}
        </motion.span>
      </div>
      <p className={styles.caption}>
        <span>{label}</span>
        <button type="button" className={styles.info} aria-label={info} data-tooltip={info} data-tooltip-wrap="">
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="5.35" stroke="currentColor" strokeWidth="1.1" />
            <circle cx="6" cy="3.7" r="0.7" fill="currentColor" />
            <path d="M6 5.6v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </button>
      </p>
    </div>
  );
}

/** Covered: a filled green circle with a white tick (Figma icon/ticker).
 *  `muted` greys it (a key line a quote doesn't meet). */
export function Tick({ muted = false, size = 12, className }: { muted?: boolean; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={muted ? "var(--color-label-tertiary)" : "var(--color-success)"}
        d="M0 6a6 6 0 1 1 12 0A6 6 0 0 1 0 6Zm8.88-1.48a.41.41 0 0 0-.58-.58L5.05 7.19 3.7 5.85a.41.41 0 0 0-.58.58l1.64 1.63c.16.16.42.16.58 0l3.54-3.54Z"
      />
    </svg>
  );
}

/** Excluded: a filled red circle with a white cross; `muted` greys it. */
export function Cross({ muted = false, size = 12, className }: { muted?: boolean; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={muted ? "var(--color-label-tertiary)" : "var(--color-error)"}
        d="M0 6a6 6 0 1 1 12 0A6 6 0 0 1 0 6Zm4.38-2.2a.41.41 0 0 0-.58.58L5.42 6 3.8 7.62a.41.41 0 0 0 .58.58L6 6.58l1.62 1.62a.41.41 0 0 0 .58-.58L6.58 6 8.2 4.38a.41.41 0 0 0-.58-.58L6 5.42 4.38 3.8Z"
      />
    </svg>
  );
}

export interface ScoreListProps {
  title: string;
  /** Lines in order, each ticked (covered) or crossed (excluded). */
  items: { label: string; tone: "covered" | "excluded" }[];
  /** Entrance delay (s), so the lists land after the badge. */
  delay?: number;
  still?: boolean;
}

/**
 * ScoreList — a serif heading over ticked (covered) and crossed (excluded)
 * lines, as in the Score tab (Figma 776:32143 / 776:32176).
 * Usage: <ScoreList title="11 Key Features" items={[{ label, tone: "covered" }, …]} />
 */
export function ScoreList({ title, items, delay = 0, still = false }: ScoreListProps) {
  const reduced = useReducedMotion();
  const quiet = reduced || still;
  return (
    <motion.section
      className={styles.list}
      initial={quiet ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
    >
      <h3 className={styles.listTitle}>{title}</h3>
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={`${item.tone}-${item.label}`} className={styles.item}>
            <span className={styles.mark}>{item.tone === "covered" ? <Tick size={10} /> : <Cross size={10} />}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
