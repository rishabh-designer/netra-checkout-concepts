"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import type { UpgradeBannerContent, UpgradedBannerContent } from "@/types/quotesPage";
import { Sparks } from "@/components/ui/Sparks";
import styles from "./UpgradeBanner.module.css";

export type UpgradeStage = "pending" | "verifying" | "upgraded";

export interface UpgradeBannerProps {
  stage: UpgradeStage;
  content: UpgradeBannerContent;
  upgraded: UpgradedBannerContent;
  /** Shared 0–100 verification progress (also drives the collapsed rail). */
  progress: MotionValue<number>;
  /** Hidden demo shortcut: clicking the percent simulates verification. */
  onSimulate?: () => void;
  /** Hidden demo shortcut: clicking "You're Upgraded!" resets to the start. */
  onReset?: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const enter: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.022, delayChildren: 0.08 } },
};
const char: Variants = {
  hidden: { y: "110%", opacity: 0, rotate: 6 },
  shown: { y: "0%", opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 380, damping: 26 } },
};
const body: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE, delay: 0.45 } },
};

/**
 * UpgradeBanner — pinned to the foot of Your Details. "Ready to Upgrade?"
 * shows verification progress; its percent doubles as a hidden demo button
 * that simulates verification (the count climbs with realistic stalls, the
 * fill sheens, the time left rolls down, the track flashes gold at 100). It
 * then morphs into "You're Upgraded!" (Figma 564:32956): the serif title
 * rises letter by letter while a burst of ikkat sparks fires behind it.
 * Usage: <UpgradeBanner stage={stage} content={upgrade} upgraded={upgraded} progress={mv} onSimulate={fn} />
 */
export function UpgradeBanner({ stage, content, upgraded, progress, onSimulate, onReset }: UpgradeBannerProps) {
  const reduced = useReducedMotion();
  const label = useTransform(progress, (v) => `${Math.round(v)}%`);
  const width = useTransform(progress, (v) => `${v}%`);
  const [step, setStep] = useState(-1);
  const [full, setFull] = useState(false);

  // Roll the time-left readout down as the count passes each third.
  useMotionValueEvent(progress, "change", (v) => {
    const start = content.percent;
    const n = content.timeSteps.length;
    const i = Math.min(n - 1, Math.floor(((v - start) / (100 - start)) * n));
    setStep(v <= start ? -1 : i);
    setFull(v >= 99.5);
  });

  const verifying = stage === "verifying";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {stage === "upgraded" ? (
        <motion.div
          key="upgraded"
          className={styles.upgradedBanner}
          data-resettable={onReset ? true : undefined}
          role={onReset ? "button" : undefined}
          tabIndex={onReset ? 0 : undefined}
          aria-label={onReset ? upgraded.resetLabel : undefined}
          onClick={onReset}
          onKeyDown={onReset ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onReset()) : undefined}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {!reduced && <Sparks count={12} distance={[50, 120]} delay={0.1} />}
          <motion.p className={styles.upgradedTitle} variants={enter} initial="hidden" animate="shown" aria-label={upgraded.title}>
            {Array.from(upgraded.title).map((c, i) => (
              <span key={i} className={styles.charMask} aria-hidden>
                <motion.span className={styles.char} variants={reduced ? undefined : char}>
                  {c === " " ? " " : c}
                </motion.span>
              </span>
            ))}
          </motion.p>
          <motion.p className={styles.upgradedBody} variants={reduced ? undefined : body} initial="hidden" animate="shown">
            {upgraded.body}
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="progress"
          className={styles.banner}
          data-verifying={verifying || undefined}
          initial={false}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.3, ease: EASE } }}
        >
          <p className={styles.title}>{content.title}</p>
          <p className={styles.body}>{content.body}</p>
          <div className={styles.meterRow}>
            <button
              type="button"
              className={styles.percent}
              onClick={stage === "pending" ? onSimulate : undefined}
              aria-label={content.simulateLabel}
              disabled={verifying}
            >
              <motion.span>{label}</motion.span>
            </button>
            <div className={styles.track} data-full={full || undefined}>
              <motion.div className={styles.fill} style={{ width }} />
            </div>
          </div>
          <div className={styles.footer}>
            <span className={styles.timeWrap}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={step}
                  className={styles.timeLeft}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {step < 0 ? content.timeLeft : content.timeSteps[step]}
                </motion.span>
              </AnimatePresence>
            </span>
            <button type="button" className={styles.cta}>
              {content.ctaLabel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
