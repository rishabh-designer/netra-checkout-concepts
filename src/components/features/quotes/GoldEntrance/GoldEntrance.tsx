"use client";

import { useEffect, useState, type ReactNode } from "react";
import { stagger, useAnimate, useReducedMotion } from "motion/react";
import styles from "./GoldEntrance.module.css";

export interface GoldEntranceProps {
  /** Hold before the card appears (ms), so it lands after the feed settles. */
  delay?: number;
  /** Fires as the card lands (the price morph starts here). */
  onLanded?: () => void;
  children: ReactNode;
}

// Once per page load: an Edit Details skeleton reload shows it at rest.
let played = false;
export const hasGoldEntrancePlayed = () => played;

const OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const CASCADE = "[data-reveal='pill'], [data-reveal='item'], [data-reveal='coverage'], [data-reveal='rating'], [data-reveal='chip'], [data-reveal='bar']";
const LAND_MS = 600;

/**
 * GoldEntrance — Case A's Gold Quote arriving on its own beat: its slot holds
 * the height while the rest of the feed rises in, then (after `delay`) the
 * card eases up out of nothing and its parts cascade top to bottom, the ikkat
 * rule blooms from the centre, Excellent pops and the gold beam fades up.
 * A lighter cousin of RevealCard's sequence; opacity and transform only.
 * Usage: <GoldEntrance delay={800} onLanded={startPrice}><QuoteCard … /></GoldEntrance>
 */
export function GoldEntrance({ delay = 800, onLanded, children }: GoldEntranceProps) {
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  // Frozen at mount: later re-renders (after `played` flips) mustn't unhide
  // the card before its entrance.
  const [skip] = useState(() => played);

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    if (skip || reduced) {
      el.style.opacity = "1";
      onLanded?.();
      return;
    }
    played = true;
    let cancelled = false;
    const start = window.setTimeout(() => {
      // Park the parts before the card shows, so nothing flashes.
      animate(CASCADE, { opacity: 0 }, { duration: 0 });
      animate("[data-reveal='rule'] > div > *", { opacity: 0 }, { duration: 0 });
      animate([
        [el, { opacity: [0, 1], y: [14, 0], scale: [0.97, 1] }, { type: "tween", duration: 0.7, ease: OUT_EXPO, at: 0 }],
        ["[data-reveal='rule'] > div > *", { opacity: [0, 1], scale: [0, 1] }, { type: "tween", duration: 0.3, delay: stagger(0.01, { from: "center" }), at: 0.15 }],
        [CASCADE, { opacity: [0, 1], y: [12, 0] }, { type: "tween", duration: 0.55, ease: OUT_EXPO, delay: stagger(0.05), at: 0.1 }],
        ["[data-reveal='rating']", { scale: [0.5, 1] }, { type: "spring", stiffness: 480, damping: 12, at: 0.35 }],
        ["[data-reveal='beam']", { opacity: [0, 1] }, { duration: 0.7, at: 0.6 }],
      ]);
    }, delay);
    const land = window.setTimeout(() => !cancelled && onLanded?.(), delay + LAND_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearTimeout(land);
    };
    // Runs once on mount; the entrance never replays in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={scope} className={styles.entrance} data-pending={skip ? undefined : true}>
      {children}
    </div>
  );
}
