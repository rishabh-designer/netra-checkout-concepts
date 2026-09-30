"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./Slider.module.css";

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Shown after the number, e.g. "px", "°", "ms". */
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

const decimalsOf = (step: number) => (step >= 1 ? 0 : Math.min(3, Math.ceil(-Math.log10(step))));

/**
 * Slider - a labelled range with a typed-number box beside it. Drag for feel,
 * type for precision. The track fills up to the thumb in the brand purple.
 * Usage: <Slider label="Width" value={w} min={4} max={80} step={1} unit="px" onChange={setW} />
 */
export function Slider({ label, value, min, max, step, unit, onChange, className }: SliderProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const decimals = decimalsOf(step);
  const fill = ((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100;

  return (
    <div className={cn(styles.slider, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <span className={styles.readout}>
        <input
          className={styles.number}
          type="text"
          inputMode="decimal"
          aria-label={`${label} value`}
          value={draft ?? value.toFixed(decimals)}
          onChange={(event) => {
            setDraft(event.target.value);
            const parsed = parseFloat(event.target.value);
            if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
          }}
          onBlur={() => setDraft(null)}
        />
        {unit && <span className={styles.unit}>{unit}</span>}
      </span>
      <input
        id={id}
        className={styles.range}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
        onChange={(event) => {
          setDraft(null);
          onChange(parseFloat(event.target.value));
        }}
      />
    </div>
  );
}
