"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

type Side = "top" | "bottom" | "left" | "right";
interface Tip {
  text: string;
  side: Side;
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
 * edge drops below instead. Nothing wraps the control, so layouts don't move.
 * Mounted once in the root layout.
 * Usage: <button aria-label="Close" data-tooltip="Close">…</button>
 */
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const current = useRef<Element | null>(null);

  useEffect(() => {
    const hide = () => {
      window.clearTimeout(timer.current);
      current.current = null;
      setTip(null);
    };
    const show = (target: EventTarget | null) => {
      const el = (target as Element | null)?.closest?.("[data-tooltip]");
      if (el === current.current) return;
      hide();
      if (!el) return;
      const text = el.getAttribute("data-tooltip");
      if (!text) return;
      current.current = el;
      timer.current = window.setTimeout(() => {
        let side = (el.getAttribute("data-tooltip-side") as Side | null) ?? "top";
        if (side === "top" && el.getBoundingClientRect().top < 48) side = "bottom";
        const [x, y] = place(el, side);
        setTip({ text, side, x, y });
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
    <span role="tooltip" className={styles.tip} data-side={tip.side} style={{ left: tip.x, top: tip.y }}>
      {tip.text}
    </span>,
    document.body,
  );
}
