"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AgentProgress } from "@/components/ui/AgentProgress";
import { SCRIM } from "@/components/ui/SideDrawer";
import { StepConsent, StepCta, type StepConsentData, type StepCtaProps } from "../StepActions";
import styles from "./CheckoutFooter.module.css";
import { Chevron } from "@/components/icons/Chevron";
import { IconBox } from "@/components/ui/IconButton";

export interface CheckoutFooterProps {
  /** The "Preparing Checkout" clock (its time hidden, as on web); with the summary
   *  (`children`) it makes the toggle row. Without it the footer is just the
   *  CTA (the success page's Sign Mandate Letter, 735:36146). */
  preparing?: { label: string; seconds: number; running: boolean };
  labels?: { total: string; show: string; hide: string };
  /** The final price ("₹8,500"); a quote without one shows only the CTA. */
  price?: string;
  cta: StepCtaProps["cta"];
  /** The tick that gates the CTA (a guessed-details check, or Review's
   *  confirmation), just above the price row (734:35957). */
  consent?: StepConsentData;
  /** The Purchase Summary, shown when the footer is opened. */
  children?: ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * CheckoutFooter — checkout's summary on mobile (Figma 734:35259 closed,
 * 734:34798 open): a sheet pinned to the foot of the screen. Closed, it
 * holds the Preparing Checkout clock over a hairline, then the final price
 * beside the step CTA. Tapping the clock row opens the Purchase Summary
 * between the two, the price row staying put, and blurs the page behind
 * (the drawers' scrim; a tap on it or Escape closes). A step's consent sits
 * just above the price row.
 * Usage: <CheckoutFooter preparing={…} labels={…} price="₹8,500" cta={cta}><PurchaseSummary … /></CheckoutFooter>
 */
export function CheckoutFooter({ preparing, labels, price, cta, consent, children }: CheckoutFooterProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion() ?? false;
  const regionId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          className={styles.scrim}
          aria-hidden
          initial={SCRIM.hidden}
          animate={SCRIM.shown}
          exit={SCRIM.hidden}
          transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
          onClick={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
    <footer className={styles.footer} data-open={open || undefined}>
      {preparing && labels && (
      <>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={regionId}
        aria-label={open ? labels.hide : labels.show}
        onClick={() => setOpen((o) => !o)}
      >
        <AgentProgress
          label={preparing.label}
          elapsedSeconds={preparing.seconds}
          running={preparing.running}
          // As on web: the clock keeps counting (it stops on Pay), unseen.
          hideTime
          className={styles.preparing}
          labelClassName={styles.preparingLabel}
        />
        <IconBox size="sm" open={open}>
          <Chevron dir="up" size={12} />
        </IconBox>
      </button>
      <hr className={styles.rule} />
      </>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="summary"
            id={regionId}
            className={styles.summary}
            // Its 12 of room each side (for the beam's glow) overlaps the
            // footer's gaps once open, so the spacing stays 12.
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: -12 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: reduce ? 0 : 0.36, ease: EASE }}
          >
            <div className={styles.summaryInner}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {consent && <StepConsent consent={consent} variant="footer" />}

      <div className={styles.actions}>
        {price && labels && (
          <div className={styles.total}>
            <span className={styles.totalLabel}>{labels.total}</span>
            <span className={styles.price}>{price}</span>
          </div>
        )}
        <StepCta cta={cta} className={styles.cta} />
      </div>
    </footer>
    </>
  );
}
