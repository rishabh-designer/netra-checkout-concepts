"use client";

import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { clamp } from "@/lib/netrabot/math";
import styles from "./Pad2D.module.css";

export interface PadMark {
  key: string;
  label: string;
  x: number;
  y: number;
}

export interface Pad2DProps {
  /** Accessible name. */
  label: string;
  /** -1 to 1 on each axis; y is up. */
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  /** Spoken value, e.g. "Mood 0.4, energy 0.2". */
  valueText: string;
  axes: { left: string; right: string; top: string; bottom: string };
  /** Points to click to (the preset faces on the emotion pad). */
  marks?: PadMark[];
  /** Highlighted marks (the faces being blended). */
  activeMarks?: string[];
  /** Double-click (or 0) puts the handle back here. */
  home?: { x: number; y: number };
  size?: "large" | "small";
  children?: ReactNode;
}

const KEY_STEP = 0.05;
const KEY_STEP_LARGE = 0.2;

const toPercent = (x: number, y: number) => ({ left: `${((x + 1) / 2) * 100}%`, top: `${((1 - y) / 2) * 100}%` });

/**
 * Pad2D - a square you drag a handle across to set two values at once (the
 * emotion pad: mood across, energy up; the look pad: turn and nod). Marks are
 * clickable points on it; arrow keys nudge the handle, Shift for bigger steps.
 * Usage: <Pad2D label="Look" x={x} y={y} onChange={set} valueText="…" axes={…} />
 */
export function Pad2D({ label, x, y, onChange, valueText, axes, marks = [], activeMarks = [], home, size = "large", children }: Pad2DProps) {
  const area = useRef<HTMLDivElement>(null);

  const moveTo = (event: PointerEvent) => {
    const box = area.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    onChange(
      clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1),
      clamp(1 - ((event.clientY - box.top) / box.height) * 2, -1, 1)
    );
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (moves[event.key]) {
      event.preventDefault();
      onChange(clamp(x + moves[event.key][0], -1, 1), clamp(y + moves[event.key][1], -1, 1));
    } else if ((event.key === "0" || event.key === "Home") && home) {
      event.preventDefault();
      onChange(home.x, home.y);
    }
  };

  return (
    <div className={styles.pad} data-size={size}>
      <span className={styles.axisTop}>{axes.top}</span>
      <div className={styles.row}>
        <span className={styles.axisSide}>{axes.left}</span>
        <div
          ref={area}
          className={styles.area}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={Math.round(x * 100)}
          aria-valuetext={valueText}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest("button")) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            moveTo(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTo(event);
          }}
          onDoubleClick={() => home && onChange(home.x, home.y)}
          onKeyDown={onKeyDown}
        >
          <span className={styles.crossX} aria-hidden />
          <span className={styles.crossY} aria-hidden />
          {marks.map((mark) => (
            <button
              key={mark.key}
              type="button"
              tabIndex={-1}
              className={styles.mark}
              data-active={activeMarks.includes(mark.key) || undefined}
              style={toPercent(mark.x, mark.y)}
              data-tooltip={mark.label}
              aria-label={mark.label}
              onClick={() => onChange(mark.x, mark.y)}
            />
          ))}
          {children}
          <span className={styles.handle} style={toPercent(x, y)} aria-hidden />
        </div>
        <span className={styles.axisSide}>{axes.right}</span>
      </div>
      <span className={styles.axisBottom}>{axes.bottom}</span>
    </div>
  );
}
