"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import styles from "./RiskScore.module.css";
import { MedalBadge } from "./MedalBadge";

/* The badge's three glow rings (Figma 776:32116-18): box in the 210 frame,
   then how far each SVG bleeds past it for its glow. */
const RINGS = [
  { src: "/figma/score/ring-1.svg", left: 0.22, top: 9.08, w: 209.553, h: 191.838, bleed: [8.71, 7.97] },
  { src: "/figma/score/ring-2.svg", left: 14.59, top: 21.88, w: 180.806, h: 166.253, bleed: [10.05, 9.24] },
  { src: "/figma/score/ring-3.svg", left: 27.46, top: 33.33, w: 155.072, h: 143.35, bleed: [11.65, 10.77] },
];

/** The rings' frame on screen (210 × 0.7103); the medal's default size too. */
const RINGS_PX = 149.16;

export interface RiskScoreBadgeProps {
  /** The score as shown ("Excellent", a provisional "Excellent*", or "N/A"). */
  score: string;
  label: string;
  /** The info icon's tooltip (under the rings). */
  info: string;
  /** Not scored (Case C): greyed rings and a grey pill. */
  muted?: boolean;
  /** Arrived already shown (a reload): no entrance. */
  still?: boolean;
  /** A scored business: the gold medal (it carries the label itself).
   *  Without it, the rings (an unscored business keeps them, greyed). */
  medal?: boolean;
  /** The medal's size on screen: the rings' size by default; larger where
   *  there's room (the welcome popup, 320), capped to its column. */
  medalPx?: number;
  /** The medal spins on a loop (the popup); otherwise it holds still. */
  medalLoop?: boolean;
}

/**
 * RiskScoreBadge — the Score tab's centrepiece. A scored business gets the
 * gold medal, engraved with its score and label. Otherwise (Figma 776:32113)
 * three glowing hex rings and the diamond mark behind a pill holding the
 * score in the serif, its label ("Business Health") and an info tooltip under
 * it; the rings fade in from the outside in and the pill lands last. `muted`
 * greys them for a business we couldn't score.
 * Usage: <RiskScoreBadge score="Excellent" label="Business Health" info="…" medal />
 */
export function RiskScoreBadge({ score, label, info, muted = false, still = false, medal = false, medalPx: medalMax = RINGS_PX, medalLoop = false }: RiskScoreBadgeProps) {
  const reduced = useReducedMotion();
  const quiet = reduced || still;
  // The medal at its asked size where it fits, else as wide as its column.
  const root = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(medalMax);
  useEffect(() => {
    const column = root.current?.parentElement;
    if (!column || !medal) return;
    // A hidden column (its tab not chosen) measures 0: keep the last size, so
    // the medal doesn't shrink away and grow back on every tab switch.
    const ro = new ResizeObserver(([e]) => {
      if (e.contentRect.width > 0) setRoom(e.contentRect.width);
    });
    ro.observe(column);
    return () => ro.disconnect();
  }, [medal]);
  const medalPx = Math.min(medalMax, room);

  if (medal) {
    return (
      <div ref={root} className={styles.badge}>
        <div className={styles.art} data-medal="" style={{ width: medalPx, height: medalPx }}>
          <MedalBadge score={score} label={label} loop={medalLoop} />
        </div>
      </div>
    );
  }
  return (
    <div ref={root} className={styles.badge} data-muted={muted || undefined}>
      <div className={styles.art}>
        <div className={styles.frame}>
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
          </motion.span>
        </div>
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
  /** Groups in order, each a subheading over its lines, ticked (covered) or
   *  crossed (excluded); an empty group is left out. */
  groups: { heading: string; tone: "covered" | "excluded"; items: string[] }[];
  /** Entrance delay (s), so the lists land after the badge. */
  delay?: number;
  still?: boolean;
}

/**
 * ScoreList — a serif heading, then each group's subheading over its lines:
 * ticked (covered), then crossed (excluded), as in the Score tab (Figma
 * 866:23031).
 * Usage: <ScoreList title="11 Key Features" groups={[{ heading: "Coverages", tone: "covered", items: […] }, …]} />
 */
export function ScoreList({ title, groups, delay = 0, still = false }: ScoreListProps) {
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
      {groups
        .filter((g) => g.items.length)
        .map((g) => (
          <Fragment key={g.tone}>
            <h4 className={styles.listGroup}>{g.heading}</h4>
            <ul className={styles.items}>
              {g.items.map((label) => (
                <li key={label} className={styles.item}>
                  <span className={styles.mark}>{g.tone === "covered" ? <Tick size={10} /> : <Cross size={10} />}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </Fragment>
        ))}
    </motion.section>
  );
}
