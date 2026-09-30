import { useEffect, useRef, type RefObject } from "react";

/**
 * Dialog behaviour shared by every overlay (SideDrawer, QuoteModal,
 * CompareView): while open, focus moves in and Tab stays inside, Esc closes,
 * and the page behind stops scrolling. On close, focus goes back to whatever
 * opened it. Stacked dialogs (Ask BimaNetra over a drawer) behave: only the
 * top one answers Tab and Esc, and the page stays locked until the last closes.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open dialogs, newest last.
const stack: symbol[] = [];

// Page scroll lock, counted so stacked dialogs release it once. The scrollbar's
// width is padded back so a desktop page doesn't jump sideways.
let locks = 0;
let saved: { overflow: string; paddingRight: string } | null = null;
function lockScroll() {
  if (locks++ > 0) return;
  const root = document.documentElement;
  const bar = window.innerWidth - root.clientWidth;
  saved = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
  root.style.overflow = "hidden";
  if (bar > 0) root.style.paddingRight = `${bar}px`;
}
function unlockScroll() {
  if (--locks > 0 || !saved) return;
  const root = document.documentElement;
  root.style.overflow = saved.overflow;
  root.style.paddingRight = saved.paddingRight;
  saved = null;
}

export interface DialogOptions {
  open: boolean;
  onClose: () => void;
  /** The panel: focus is kept inside it. */
  panelRef: RefObject<HTMLElement | null>;
  /** Focused on open (e.g. the ×). Without it the panel itself takes focus
   *  (it needs tabIndex={-1}), so a phone keyboard doesn't pop up. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** false: Esc does nothing (a popup that must be answered, e.g. Risk Held). */
  closeOnEscape?: boolean;
}

/** Usage: useDialog({ open, onClose, panelRef, initialFocusRef: closeRef }); */
export function useDialog({ open, onClose, panelRef, initialFocusRef, closeOnEscape = true }: DialogOptions) {
  // The latest onClose, so an inline arrow doesn't re-run the effect (and
  // steal focus back to the × on every render).
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const id = Symbol("dialog");
    stack.push(id);
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll();

    // After the panel's first frame (it mounts in this commit, then animates).
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (panel && panel.contains(document.activeElement)) return;
      (initialFocusRef?.current ?? panel)?.focus({ preventScroll: true });
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === "Escape") {
        if (closeOnEscape) closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const at = document.activeElement;
      const inside = panel.contains(at);
      if (e.shiftKey && (at === first || at === panel || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (at === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(id), 1);
      unlockScroll();
      // Back to the opener, if it's still on the page.
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, panelRef, initialFocusRef, closeOnEscape]);
}
