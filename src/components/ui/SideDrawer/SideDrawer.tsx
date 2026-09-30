"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CloseButton } from "@/components/ui/IconButton";
import styles from "./SideDrawer.module.css";
import { EASE_OUT, EASE_STD } from "@/lib/motion";
import { useAtMost } from "@/lib/media";

/** Same scrim as the Edit Details drawer (A9ACB1 @ 80% + 6px blur, 249:3516). */
export const SCRIM = {
  hidden: { backgroundColor: "rgba(169, 172, 177, 0)", backdropFilter: "blur(0px)" },
  shown: { backgroundColor: "rgba(169, 172, 177, 0.8)", backdropFilter: "blur(6px)" },
};


export interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** A mark before the title (Ask BimaNetra's badge), inside the heading. */
  titleIcon?: ReactNode;
  closeLabel: string;
  children: ReactNode;
  /** Pinned under the body (e.g. a price bar or Save button). */
  footer?: ReactNode;
  /** Panel width in px: 624 (View All Features) or 480 (form drawers, like
   *  the Quotes page's Edit Details). */
  width?: number;
  /** "right" (default) docks the drawer; "center" floats it as a popup. */
  placement?: "right" | "center" | "bottom";
  /** Phones (≤900): rise as a bottom sheet whatever `placement` says. */
  sheetOnMobile?: boolean;
  /** Space between the title row and the content, in px (default 32). */
  headGap?: number;
  /** Centre only: no padding, title row or pinned footer; the children draw
   *  the whole panel (their own close control; `title` still labels it). */
  bare?: boolean;
  /** Extra class on the panel (e.g. a bare modal's own radius). */
  className?: string;
}

/**
 * SideDrawer — the right-docked drawer shell (Figma 587:63725): blurred scrim,
 * 624-wide white panel with a 32px gutter, r32 and the deep drawer shadow,
 * Instrument Serif title + boxed ×, a flexible body and an optional pinned
 * footer. Slides in from the right; Esc, × or a scrim click closes it; focus
 * lands on × when it opens. Shared by View All Features and the checkout edit
 * drawers. placement="bottom" rises as a full-width sheet from the foot of
 * the screen (mobile). placement="center" floats it as a content-height popup that
 * scales in (Know More).
 * Usage: <SideDrawer open={o} onClose={c} title="KYC" closeLabel="Close" footer={…}>…</SideDrawer>
 */
export function SideDrawer({ open, onClose, title, titleIcon, closeLabel, children, footer, width = 624, placement: placementProp = "right", sheetOnMobile = false, headGap, bare = false, className }: SideDrawerProps) {
  // Phones (the sheet tier, ≤900): `sheetOnMobile` drawers rise as bottom sheets.
  const phone = useAtMost("sheet");
  const placement = sheetOnMobile && phone ? "bottom" : placementProp;
  const centered = placement === "center";
  const sheet = placement === "bottom";
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
          transition={{ duration: 0.45, ease: EASE_STD }}
        >
          <motion.div
            className={className ? `${styles.drawer} ${className}` : styles.drawer}
            data-bare={bare || undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby={bare ? undefined : titleId}
            aria-label={bare ? title : undefined}
            style={sheet ? undefined : { width }}
            onClick={(e) => e.stopPropagation()}
            initial={centered ? { opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.97 } : sheet ? { y: reduced ? 0 : "100%" } : { x: reduced ? 0 : "calc(100% + 32px)" }}
            animate={centered ? { opacity: 1, y: 0, scale: 1 } : sheet ? { y: 0 } : { x: 0 }}
            exit={centered ? { opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.98 } : sheet ? { y: reduced ? 0 : "100%" } : { x: reduced ? 0 : "calc(100% + 32px)" }}
            transition={{ duration: centered ? 0.35 : 0.55, ease: EASE_OUT }}
          >
            {bare ? children : (
            <>
            <div className={styles.body} style={headGap !== undefined ? { gap: headGap } : undefined}>
              <div className={styles.head}>
                <h2 id={titleId} className={styles.title} data-icon={titleIcon ? true : undefined}>{titleIcon}{title}</h2>
                <CloseButton ref={closeRef} label={closeLabel} onClick={onClose} />
              </div>
              <div className={styles.content}>{children}</div>
            </div>
            {footer}
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
