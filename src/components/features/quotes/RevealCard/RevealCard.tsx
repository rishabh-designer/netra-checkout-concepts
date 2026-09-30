"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "motion/react";
import { Sparks } from "@/components/ui/Sparks";
import { DitherBurst } from "@/components/ui/DitherBurst";
import styles from "./RevealCard.module.css";
import { EASE_OUT as OUT_EXPO } from "@/lib/motion";

export interface RevealCardProps {
  /** Verification finished: the reveal plays straight from the locked card. */
  unlocked: boolean;
  /** Already revealed (e.g. after an Edit Details reload): show the Gold card. */
  revealed: boolean;
  labels: { reveal: string; lockedHint: string };
  /** Fired mid-reveal, as the Gold card lands, so the feed can ripple its ratings. */
  onRevealed: () => void;
  /** Fired once the sequence has finished and the card sits in place (start
   *  anything that must not restart, like the price morph, here). */
  onSettled?: () => void;
  /** The Gold QuoteCard. */
  children: ReactNode;
}

type Phase = "idle" | "revealing" | "done";

/* Every Gold-card part that cascades in, matched in document (reading) order. */
const CASCADE = "[data-reveal='pill'], [data-reveal='rule'], [data-reveal='item'], [data-reveal='coverage'], [data-reveal='rating'], [data-reveal='chip'], [data-reveal='bar']";

/**
 * RevealCard — the Gold Quote's locked slot and its unveiling.
 * Locked: a greyed Reveal button with a lock and a hint. The moment
 * verification lands (`unlocked`), the locked card plays the reveal on its
 * own, with no "ready" state in between. One choreographed sequence (about 2.7s):
 *   press → the label letters scatter → the button collapses to a core and
 *   detonates into a gold light bloom (a dithered shockwave and glitter
 *   ride it, like the PLP icon) with an ikkat spark burst → the slot
 *   eases open while the Gold card rises and settles out of the light →
 *   its parts cascade in (pill, the ikkat rule drawing out from the centre,
 *   title lines, coverage box, chips, the Excellent badge on an overshoot,
 *   the price bar) → one sheen sweeps across → the border beam fades up.
 * Reduced motion: a plain cross-fade.
 * Usage: <RevealCard unlocked={u} revealed={r} labels={…} onRevealed={fn}><QuoteCard … /></RevealCard>
 */
export function RevealCard({ unlocked, revealed, labels, onRevealed, onSettled, children }: RevealCardProps) {
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const goldRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(revealed ? "done" : "idle");
  // The ghost's height when pressed: 200 in the list, the row height in the
  // compact grid. The slot opens from it, so the grid never jumps.
  const [fromH, setFromH] = useState(200);
  // Demo reset (Case B): the feed took the Gold Quote back, so return to the
  // locked slot.
  useEffect(() => {
    if (!revealed && phase === "done") setPhase("idle");
  }, [revealed, phase]);

  // The reveal sequence runs once the Gold layer is in the DOM.
  useEffect(() => {
    if (phase !== "revealing" || !goldRef.current || !scope.current) return;
    // Land at the height the slot keeps once done: in the grid it stretches
    // to its row, so take the taller of the Gold card and the other cards in
    // that row (none in a one-up list). Holding the Gold layer at it too
    // stops the slot shrinking to the card and then springing back.
    const cell = scope.current.parentElement;
    const rowPeers = cell?.parentElement
      ? [...cell.parentElement.children].filter((el) => el !== cell && (el as HTMLElement).offsetTop === cell.offsetTop)
      : [];
    const rowH = Math.max(0, ...rowPeers.map((el) => (el as HTMLElement).offsetHeight));
    const h = Math.max(goldRef.current.offsetHeight, rowH);
    goldRef.current.style.minHeight = `${h}px`;
    const land = window.setTimeout(onRevealed, 1650);
    let cancelled = false;

    const run = async () => {
      // Absolute timings (s). Only compositor-friendly properties (opacity,
      // transform) animate here, so the reveal holds 60fps even on heavy
      // displays; the light bloom is a CSS keyframe.
      await animate([
        // Press + the label letters scatter from the centre.
        ["[data-rv='btn']", { scale: 0.94 }, { type: "tween", duration: 0.12, ease: "easeOut", at: 0 }],
        ["[data-rv='char']", { y: -16, opacity: 0 }, { type: "tween", duration: 0.28, ease: OUT_EXPO, delay: stagger(0.018, { from: "center" }), at: 0 }],
        ["[data-rv='icon']", { scale: 0, rotate: 90, opacity: 0 }, { type: "tween", duration: 0.2, at: 0 }],
        // Collapse into a glowing core just as the bloom ignites.
        ["[data-rv='btn']", { scale: 0.16 }, { type: "tween", duration: 0.2, ease: [0.7, 0, 0.84, 0], at: 0.12 }],
        ["[data-rv='btn']", { scale: 0, opacity: 0 }, { type: "tween", duration: 0.14, at: 0.32 }],
        ["[data-rv='hint']", { opacity: 0, y: 6 }, { type: "tween", duration: 0.2, at: 0.3 }],
        ["[data-rv='ghost']", { opacity: 0 }, { duration: 0.45, at: 0.45 }],
        // Slot eases open; the Gold card rises and settles out of the light.
        [scope.current!, { height: [fromH, h] }, { type: "tween", duration: 0.75, ease: OUT_EXPO, at: 0.45 }],
        ["[data-rv='gold']", { opacity: [0, 1], scale: [0.94, 1], y: [14, 0] }, { type: "tween", duration: 0.8, ease: OUT_EXPO, at: 0.5 }],
        // Top-to-bottom cascade, in reading order: pill → ikkat rule (it
        // also draws out from the centre, in CSS) → title lines → the
        // coverage box → its label, rating, chips, rule, View All Features →
        // the price bar → Add To Compare, Sum Insured, the button.
        [CASCADE, { opacity: [0, 1], y: [16, 0] }, { type: "tween", duration: 0.6, ease: OUT_EXPO, delay: stagger(0.06), at: 0.7 }],
        // Excellent lands with a little overshoot inside the cascade.
        ["[data-reveal='rating']", { scale: [0.5, 1] }, { type: "spring", stiffness: 480, damping: 12, at: 1.05 }],
        ["[data-rv='sheen']", { x: ["-130%", "330%"] }, { type: "tween", duration: 0.9, ease: [0.65, 0, 0.35, 1], at: 1.65 }],
        ["[data-reveal='beam']", { opacity: [0, 1] }, { duration: 0.8, at: 1.8 }],
      ]);
      if (!cancelled) settle();
    };
    run();
    // Safety net: whatever happens mid-sequence, finish on the Gold card.
    const guard = window.setTimeout(() => !cancelled && settle(), 3600);
    return () => {
      cancelled = true;
      window.clearTimeout(land);
      window.clearTimeout(guard);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const settledRef = useRef(false);
  function settle() {
    setPhase("done");
    if (settledRef.current) return;
    settledRef.current = true;
    onSettled?.();
  }

  const start = () => {
    if (!unlocked || phase !== "idle" || revealed) return;
    settledRef.current = false;
    if (reduced) {
      onRevealed();
      settle();
      return;
    }
    setFromH(scope.current?.offsetHeight || 200);
    setPhase("revealing");
  };

  // Verified: the locked card goes straight into the reveal.
  useEffect(() => {
    if (unlocked && phase === "idle" && !revealed) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, phase, revealed]);

  if (phase === "done") {
    return (
      <motion.div className={styles.slot} initial={reduced ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={scope} className={styles.slot} data-phase={phase} style={phase === "revealing" ? ({ height: fromH, "--ghost-h": `${fromH}px` } as CSSProperties) : undefined}>
      {phase === "revealing" && (
        <div className={styles.goldClip}>
          <div ref={goldRef} className={styles.gold} data-rv="gold">
            {children}
            <span className={styles.sheen} data-rv="sheen" aria-hidden />
          </div>
        </div>
      )}

      <article className={styles.ghost} data-rv="ghost" aria-live="polite">
        <div className={styles.center}>
          <span className={styles.btnWrap}>
            <button
              type="button"
              className={styles.reveal}
              data-rv="btn"
              aria-disabled
              aria-label={labels.reveal}
            >
              <span className={styles.icon} data-rv="icon" aria-hidden>
                <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
                  <rect x="2.25" y="5.25" width="7.5" height="5.25" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M4 5.25V3.9a2 2 0 0 1 4 0v1.35" stroke="currentColor" strokeWidth="1.1" />
                </svg>
              </span>
              <span className={styles.label} aria-hidden>
                {Array.from(labels.reveal).map((c, i) => (
                  <span key={i} className={styles.char} data-rv="char">
                    {c === " " ? " " : c}
                  </span>
                ))}
              </span>
            </button>
          </span>
          <span className={styles.hintWrap} data-rv="hint">
            <span className={styles.hint}>{labels.lockedHint}</span>
          </span>
        </div>
      </article>

      {phase === "revealing" && (
        <>
          <span className={styles.flash} data-rv="flash" aria-hidden />
          <span className={styles.burstOrigin} aria-hidden>
            {/* Dithered shockwave + glitter riding the bloom (same 0.3s / 1.15s beat). */}
            <DitherBurst radius={250} delay={0.3} duration={1.15} />
            <Sparks count={20} distance={[150, 280]} delay={0.32} />
          </span>
        </>
      )}
    </div>
  );
}
