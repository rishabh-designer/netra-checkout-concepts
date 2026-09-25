"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, stagger, useAnimate, useReducedMotion } from "motion/react";
import { Sparks } from "@/components/ui/Sparks";
import styles from "./RevealCard.module.css";

export interface RevealCardProps {
  /** Verification finished: the Reveal button is live. */
  unlocked: boolean;
  /** Already revealed (e.g. after an Edit Details reload): show the Gold card. */
  revealed: boolean;
  labels: { reveal: string; lockedHint: string; readyHint: string };
  /** Fired mid-reveal, as the Gold card lands, so the feed can ripple its ratings. */
  onRevealed: () => void;
  /** The Gold QuoteCard. */
  children: ReactNode;
}

type Phase = "idle" | "revealing" | "done";

const BLUR = (px: number) => `blur(${px}px)`;
const OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/* Every Gold-card part that cascades in, matched in document (reading) order. */
const CASCADE = "[data-reveal='pill'], [data-reveal='item'], [data-reveal='coverage'], [data-reveal='rating'], [data-reveal='chip'], [data-reveal='bar']";

/**
 * RevealCard — the fuzzy match's locked slot and its unveiling.
 * Locked: a greyed Reveal button with a lock and a hint. Unlocked (after
 * verification): the lock spins into a sparkle, the button springs orange, a
 * soft glow breathes behind it and hairline rings ripple out. Reveal: one
 * choreographed sequence (about 2.7s):
 *   press → the label letters scatter → the button collapses to a core and
 *   detonates into a gold light bloom with an ikkat spark burst → the slot
 *   eases open while the Gold card rises and settles out of the light →
 *   its parts cascade in (pill, divider marks from the centre, title lines,
 *   coverage box, chips from the centre, the Excellent badge on an overshoot,
 *   the price bar) → one sheen sweeps across → the border beam fades up.
 * Reduced motion: a plain cross-fade.
 * Usage: <RevealCard unlocked={u} revealed={r} labels={…} onRevealed={fn}><QuoteCard … /></RevealCard>
 */
export function RevealCard({ unlocked, revealed, labels, onRevealed, children }: RevealCardProps) {
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const goldRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(revealed ? "done" : "idle");
  const wasUnlocked = useRef(unlocked);

  // Demo reset: the feed took the Gold Quote back, so return to the locked slot.
  useEffect(() => {
    if (!revealed && phase === "done") setPhase("idle");
  }, [revealed, phase]);

  // Unlock beat: the button springs up when verification completes.
  useEffect(() => {
    if (unlocked && !wasUnlocked.current && !reduced && phase === "idle") {
      animate("[data-rv='btn']", { scale: [0.9, 1.06, 1] }, { type: "tween", duration: 0.55, ease: [0.34, 1.56, 0.64, 1], times: [0, 0.6, 1] });
    }
    wasUnlocked.current = unlocked;
  }, [unlocked, reduced, phase, animate]);

  // The reveal sequence runs once the Gold layer is in the DOM.
  useEffect(() => {
    if (phase !== "revealing" || !goldRef.current || !scope.current) return;
    const h = goldRef.current.offsetHeight;
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
        ["[data-rv='rings']", { opacity: 0 }, { duration: 0.15, at: 0 }],
        // Collapse into a glowing core just as the bloom ignites.
        ["[data-rv='btn']", { scale: 0.16 }, { type: "tween", duration: 0.2, ease: [0.7, 0, 0.84, 0], at: 0.12 }],
        ["[data-rv='btn']", { scale: 0, opacity: 0 }, { type: "tween", duration: 0.14, at: 0.32 }],
        ["[data-rv='hint']", { opacity: 0, y: 6 }, { type: "tween", duration: 0.2, at: 0.3 }],
        ["[data-rv='ghost']", { opacity: 0 }, { duration: 0.45, at: 0.45 }],
        // Slot eases open; the Gold card rises and settles out of the light.
        [scope.current!, { height: [200, h] }, { type: "tween", duration: 0.75, ease: OUT_EXPO, at: 0.45 }],
        ["[data-rv='gold']", { opacity: [0, 1], scale: [0.94, 1], y: [14, 0] }, { type: "tween", duration: 0.8, ease: OUT_EXPO, at: 0.5 }],
        // Ikkat divider marks bloom out from the centre.
        ["[data-reveal='rule'] > div > *", { opacity: [0, 1], scale: [0, 1] }, { type: "tween", duration: 0.35, delay: stagger(0.012, { from: "center" }), at: 0.8 }],
        // Top-to-bottom cascade, in reading order: pill → title lines → the
        // coverage box → its label, rating, chips, rule, View All Features →
        // the price bar → Add To Compare, Sum Insured, the button.
        [CASCADE, { opacity: [0, 1], y: [16, 0] }, { type: "tween", duration: 0.6, ease: OUT_EXPO, delay: stagger(0.06), at: 0.7 }],
        // Excellent lands with a little overshoot inside the cascade.
        ["[data-reveal='rating']", { scale: [0.5, 1] }, { type: "spring", stiffness: 480, damping: 12, at: 1.05 }],
        ["[data-rv='sheen']", { x: ["-130%", "330%"] }, { type: "tween", duration: 0.9, ease: [0.65, 0, 0.35, 1], at: 1.65 }],
        ["[data-reveal='beam']", { opacity: [0, 1] }, { duration: 0.8, at: 1.8 }],
      ]);
      if (!cancelled) setPhase("done");
    };
    run();
    // Safety net: whatever happens mid-sequence, finish on the Gold card.
    const guard = window.setTimeout(() => !cancelled && setPhase("done"), 3600);
    return () => {
      cancelled = true;
      window.clearTimeout(land);
      window.clearTimeout(guard);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = () => {
    if (!unlocked || phase !== "idle") return;
    if (reduced) {
      onRevealed();
      setPhase("done");
      return;
    }
    setPhase("revealing");
  };

  if (phase === "done") {
    return (
      <motion.div className={styles.slot} initial={reduced ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={scope} className={styles.slot} data-phase={phase} style={phase === "revealing" ? { height: 200 } : undefined}>
      {phase === "revealing" && (
        <div className={styles.goldClip}>
          <div ref={goldRef} className={styles.gold} data-rv="gold">
            {children}
            <span className={styles.sheen} data-rv="sheen" aria-hidden />
          </div>
        </div>
      )}

      <article className={styles.ghost} data-rv="ghost" data-unlocked={unlocked || undefined} aria-live="polite">
        <div className={styles.center}>
          <span className={styles.btnWrap}>
            {unlocked && (
              <span className={styles.rings} data-rv="rings" aria-hidden>
                <span className={styles.glow} />
                <span className={styles.ring} />
                <span className={styles.ring} />
                <span className={styles.ring} />
              </span>
            )}
            <button
              type="button"
              className={styles.reveal}
              data-rv="btn"
              aria-disabled={!unlocked}
              onClick={start}
              aria-label={labels.reveal}
            >
              <span className={styles.icon} data-rv="icon" aria-hidden>
                <AnimatePresence mode="wait" initial={false}>
                  {unlocked ? (
                    <motion.img
                      key="sparkle"
                      src="/media/chat-with-us.svg"
                      alt=""
                      className={styles.iconImg}
                      initial={{ rotate: -120, scale: 0, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                    />
                  ) : (
                    <motion.svg
                      key="lock"
                      viewBox="0 0 12 12"
                      width="12"
                      height="12"
                      fill="none"
                      exit={{ rotate: 120, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <rect x="2.25" y="5.25" width="7.5" height="5.25" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
                      <path d="M4 5.25V3.9a2 2 0 0 1 4 0v1.35" stroke="currentColor" strokeWidth="1.1" />
                    </motion.svg>
                  )}
                </AnimatePresence>
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={unlocked ? "ready" : "locked"}
                className={styles.hint}
                data-ready={unlocked || undefined}
                initial={{ opacity: 0, y: 6, filter: BLUR(4) }}
                animate={{ opacity: 1, y: 0, filter: BLUR(0) }}
                exit={{ opacity: 0, y: -6, filter: BLUR(4) }}
                transition={{ duration: 0.35, ease: OUT_EXPO }}
              >
                {unlocked ? labels.readyHint : labels.lockedHint}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </article>

      {phase === "revealing" && (
        <>
          <span className={styles.flash} data-rv="flash" aria-hidden />
          <span className={styles.burstOrigin} aria-hidden>
            <Sparks count={20} distance={[150, 280]} delay={0.32} />
          </span>
        </>
      )}
    </div>
  );
}
