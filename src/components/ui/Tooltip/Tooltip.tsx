"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

type Side = "top" | "bottom" | "left" | "right";
interface Tip {
  text: string;
  side: Side;
  /** Long explanations may wrap to a few lines (data-tooltip-wrap). */
  wrap: boolean;
  x: number;
  y: number;
}

const GAP = 8;
const DELAY = 350;
/** A tap that moves further than this is a scroll, not a tap. */
const TAP_SLOP = 10;
/** How long a tapped tip stays: long enough to read, then it goes. */
const tapHold = (text: string) => Math.min(8000, 2500 + text.length * 40);

const TOOLTIP = "[data-tooltip], [data-tooltip-overflow]";
const CONTROL =
  "a[href], button, input, select, textarea, label, summary, [role=button], [role=tab], [role=option], [role=switch], [role=checkbox], [role=menuitem], [role=combobox], [role=link]";

/** Touch: is the tip this element's whole job? Yes for a tag, pill, icon or
 *  line of text (nothing else happens on a tap), for a disabled control (the
 *  tip says why it's off) and for an info button (a long explanation,
 *  data-tooltip-wrap). An ordinary control's tap does its action instead. */
function tapWorthy(el: Element): boolean {
  const ctl = el.closest(CONTROL);
  if (!ctl) return true;
  // A control's tip that only repeats its name ("Send", "Close") adds nothing.
  if (el.getAttribute("data-tooltip") === el.getAttribute("aria-label") && !el.hasAttribute("data-tooltip-wrap")) return false;
  if (ctl.matches(":disabled, [aria-disabled='true']")) return true;
  if (ctl instanceof HTMLLabelElement && (ctl.control as HTMLInputElement | null)?.disabled) return true;
  return el === ctl && el.hasAttribute("data-tooltip-wrap");
}

/** The tip's text, or null: data-tooltip-overflow only while it's cut off. */
function tipText(el: Element): string | null {
  if (el.hasAttribute("data-tooltip")) return el.getAttribute("data-tooltip");
  return el.scrollWidth > el.clientWidth + 1 ? el.textContent : null;
}

function place(el: Element, side: Side): [number, number] {
  const r = el.getBoundingClientRect();
  if (side === "bottom") return [r.left + r.width / 2, r.bottom + GAP];
  if (side === "left") return [r.left - GAP, r.top + r.height / 2];
  if (side === "right") return [r.right + GAP, r.top + r.height / 2];
  return [r.left + r.width / 2, r.top - GAP];
}

/**
 * TooltipLayer — one floating tooltip for the whole app (the Peetal tooltip
 * look, as on the input's info icon). Any element with `data-tooltip` shows
 * it on hover or keyboard focus, after a short pause, and on touch when it
 * explains something a tap can't (see tapWorthy): a tap shows it at once, a
 * second tap or any other touch hides it, and it fades after a read;
 * `data-tooltip-side`
 * picks top (default), bottom, left or right, and a top tip near the screen
 * edge drops below instead. `data-tooltip-overflow` shows an ellipsized
 * element's full text, only while it's actually cut off. Nothing wraps the control, so layouts don't move.
 * Tips sit on one line; `data-tooltip-wrap` lets a long explanation run to
 * two or three. Mounted once in the root layout.
 * Usage: <button aria-label="Close" data-tooltip="Close">…</button>
 */
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const current = useRef<Element | null>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  // Keep the tip on screen: nudge it in from either edge by the overhang.
  useLayoutEffect(() => {
    const el = tipRef.current;
    if (!el) return;
    el.style.marginLeft = "0px";
    const r = el.getBoundingClientRect();
    const over = r.right - (window.innerWidth - GAP);
    const under = GAP - r.left;
    if (over > 0) el.style.marginLeft = `${-over}px`;
    else if (under > 0) el.style.marginLeft = `${under}px`;
  }, [tip]);

  useEffect(() => {
    // A tapped tip stays through the focus change its own tap causes.
    let tapped = false;
    const hide = () => {
      window.clearTimeout(timer.current);
      current.current = null;
      tapped = false;
      setTip(null);
    };
    const onFocusOut = () => !tapped && hide();
    const open = (el: Element, text: string, wait: number, hold?: number) => {
      current.current = el;
      tapped = !!hold;
      timer.current = window.setTimeout(() => {
        let side = (el.getAttribute("data-tooltip-side") as Side | null) ?? "top";
        if (side === "top" && el.getBoundingClientRect().top < 48) side = "bottom";
        const [x, y] = place(el, side);
        setTip({ text, side, wrap: el.hasAttribute("data-tooltip-wrap"), x, y });
        // A tapped tip fades on its own after a read.
        if (hold) timer.current = window.setTimeout(hide, hold);
      }, wait);
    };
    const show = (target: EventTarget | null) => {
      const el = (target as Element | null)?.closest?.(TOOLTIP);
      if (el === current.current) return;
      hide();
      if (!el) return;
      const text = tipText(el);
      if (text) open(el, text, DELAY);
    };
    const onOver = (e: PointerEvent) => e.pointerType !== "touch" && show(e.target);
    const onFocus = (e: FocusEvent) => (e.target as Element).matches?.(":focus-visible") && show(e.target);

    // Touch. Any press hides the tip, but remembers which one was up, so a
    // second tap on the same element closes it rather than reopening it.
    const pressed = { el: null as Element | null };
    const onDown = () => {
      pressed.el = current.current;
      hide();
    };
    // Taps are read from touch events, which reach disabled controls too.
    const start = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) [start.x, start.y] = [t.clientX, t.clientY];
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t || e.touches.length || Math.hypot(t.clientX - start.x, t.clientY - start.y) > TAP_SLOP) return;
      // The topmost element under the finger (disabled ones included).
      const el = document.elementFromPoint(t.clientX, t.clientY)?.closest(TOOLTIP);
      const again = !!el && el === pressed.el;
      pressed.el = null;
      if (!el || again || !tapWorthy(el)) return;
      const text = tipText(el);
      if (text) open(el, text, 0, tapHold(text));
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scroll", hide, true);
    return () => {
      hide();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", hide, true);
    };
  }, []);

  if (!tip) return null;
  return createPortal(
    <span ref={tipRef} role="tooltip" className={styles.tip} data-side={tip.side} data-wrap={tip.wrap || undefined} style={{ left: tip.x, top: tip.y }}>
      {tip.text}
    </span>,
    document.body,
  );
}
