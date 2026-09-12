"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Toast.module.css";

export interface ToastProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  /** ms before auto-dismiss. */
  duration?: number;
}

/**
 * Toast — a top-right alert in the shadcn/ui visual idiom (hairline card, soft
 * shadow, icon + title + description + close), built with our tokens/CSS — no
 * Tailwind. Slides in from the right and auto-dismisses.
 * Usage: <Toast open={open} title="…" description="…" onClose={close} />
 */
export function Toast({ open, title, description, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [open, duration, onClose]);

  return (
    <div className={styles.viewport} aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.toast}
            role="status"
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.icon} aria-hidden>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                <path
                  d="M10 2.2 1.6 16.5h16.8L10 2.2Z"
                  stroke="var(--color-brand-secondary)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M10 8v3.6" stroke="var(--color-brand-secondary)" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="10" cy="13.9" r="0.9" fill="var(--color-brand-secondary)" />
              </svg>
            </span>
            <div className={styles.body}>
              <p className={styles.title}>{title}</p>
              {description && <p className={styles.desc}>{description}</p>}
            </div>
            <button className={styles.close} onClick={onClose} aria-label="Dismiss">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path
                  d="m4.5 4.5 7 7m0-7-7 7"
                  stroke="var(--color-label-tertiary)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
