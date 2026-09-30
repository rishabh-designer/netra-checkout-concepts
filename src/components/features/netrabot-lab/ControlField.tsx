"use client";

import { PillGroup } from "@/components/ui/PillGroup";
import { Slider } from "@/components/ui/Slider";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import type { Control } from "@/lib/netrabot/controls";
import styles from "./NetraLab.module.css";

export interface ControlFieldProps {
  control: Control;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Colour shown (and used) when an optional colour is unset. */
  fallbackColor?: string;
}

/**
 * ControlField - renders one entry of the studio's control spec as the right
 * input: a slider, a pill group, a colour swatch or a switch.
 * Usage: <ControlField control={c} value={getPath(target, c.path)} onChange={…} />
 */
export function ControlField({ control, value, onChange, fallbackColor }: ControlFieldProps) {
  if (control.kind === "number") {
    return (
      <Slider
        label={control.label}
        value={typeof value === "number" ? value : control.min}
        min={control.min}
        max={control.max}
        step={control.step}
        unit={control.unit}
        onChange={onChange}
      />
    );
  }
  if (control.kind === "choice") {
    return (
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{control.label}</span>
        <PillGroup label={control.label} options={control.options} value={String(value)} onChange={onChange} />
      </div>
    );
  }
  if (control.kind === "toggle") {
    return (
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{control.label}</span>
        <ToggleSwitch checked={Boolean(value)} onChange={onChange} label={undefined} id={control.id} size="sm" />
      </div>
    );
  }
  const unset = control.optional && typeof value !== "string";
  const shown = typeof value === "string" ? value : (fallbackColor ?? "#000000");
  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{control.label}</span>
      <span className={styles.colour}>
        <input
          className={styles.swatch}
          type="color"
          aria-label={`${control.label} colour`}
          value={shown}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className={styles.hex}>{unset ? LAB_COPY.colour.useDefault : shown}</span>
        {control.optional && !unset && (
          <button type="button" className={styles.linkButton} onClick={() => onChange(undefined)}>
            {LAB_COPY.colour.useDefault}
          </button>
        )}
      </span>
    </div>
  );
}
