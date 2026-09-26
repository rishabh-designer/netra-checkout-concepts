"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./SideDrawer.module.css";

/** Same scrim as the Edit Details drawer (A9ACB1 @ 80% + 6px blur, 249:3516). */
const SCRIM = {
  hidden: { backgroundColor: "rgba(169, 172, 177, 0)", backdropFilter: "blur(0px)" },
  shown: { backgroundColor: "rgba(169, 172, 177, 0.8)", backdropFilter: "blur(6px)" },
};

export interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
  /** Pinned under the body (e.g. a price bar or Save button). */
  footer?: ReactNode;
  /** Panel width in px: 624 (View All Features) or 480 (form drawers, like
   *  the Quotes page's Edit Details). */
  width?: number;
  /** "right" (default) docks the drawer; "center" floats it as a popup. */
  placement?: "right" | "center";
}

/**
 * SideDrawer — the right-docked drawer shell (Figma 587:63725): blurred scrim,
 * 624-wide white panel with a 32px gutter, r32 and the deep drawer shadow,
 * Instrument Serif title + boxed ×, a flexible body and an optional pinned
 * footer. Slides in from the right; Esc, × or a scrim click closes it; focus
 * lands on × when it opens. Shared by View All Features and the checkout edit
 * drawers. placement="center" floats it as a content-height popup that
 * scales in (Know More).
 * Usage: <SideDrawer open={o} onClose={c} title="KYC" closeLabel="Close" footer={…}>…</SideDrawer>
 */
export function SideDrawer({ open, onClose, title, closeLabel, children, footer, width = 624, placement = "right" }: SideDrawerProps) {
  const centered = placement === "center";
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="side-drawer"
          className={styles.overlay}
          data-placement={placement}
          onClick={onClose}
          initial={SCRIM.hidden}
          animate={SCRIM.shown}
          exit={SCRIM.hidden}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            style={{ width }}
            onClick={(e) => e.stopPropagation()}
            initial={centered ? { opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.97 } : { x: reduced ? 0 : "calc(100% + 32px)" }}
            animate={centered ? { opacity: 1, y: 0, scale: 1 } : { x: 0 }}
            exit={centered ? { opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.98 } : { x: reduced ? 0 : "calc(100% + 32px)" }}
            transition={{ duration: centered ? 0.35 : 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.body}>
              <div className={styles.head}>
                <h2 id={titleId} className={styles.title}>{title}</h2>
                <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
                    <path d="M4 4l8 8M12 4l-8 8" stroke="var(--color-label-secondary)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className={styles.content}>{children}</div>
            </div>
            {footer}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
