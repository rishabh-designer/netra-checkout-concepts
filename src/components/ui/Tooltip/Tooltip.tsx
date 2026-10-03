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
 * it on hover or keyboard focus, after a short pause; `data-tooltip-side`
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
    const hide = () => {
      window.clearTimeout(timer.current);
      current.current = null;
      setTip(null);
    };
    const show = (target: EventTarget | null) => {
      const el = (target as Element | null)?.closest?.("[data-tooltip], [data-tooltip-overflow]");
      if (el === current.current) return;
      hide();
      if (!el) return;
      // data-tooltip-overflow: the element's own text, only while it's cut off.
      const text = el.hasAttribute("data-tooltip")
        ? el.getAttribute("data-tooltip")
        : el.scrollWidth > el.clientWidth + 1
          ? el.textContent
          : null;
      if (!text) return;
      current.current = el;
      timer.current = window.setTimeout(() => {
        let side = (el.getAttribute("data-tooltip-side") as Side | null) ?? "top";
        if (side === "top" && el.getBoundingClientRect().top < 48) side = "bottom";
        const [x, y] = place(el, side);
        setTip({ text, side, wrap: el.hasAttribute("data-tooltip-wrap"), x, y });
      }, DELAY);
    };
    const onOver = (e: PointerEvent) => e.pointerType !== "touch" && show(e.target);
    const onFocus = (e: FocusEvent) => (e.target as Element).matches?.(":focus-visible") && show(e.target);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", hide);
    document.addEventListener("pointerdown", hide);
    window.addEventListener("scroll", hide, true);
    return () => {
      hide();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("pointerdown", hide);
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
