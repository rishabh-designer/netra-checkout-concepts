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
  /** The value Reset goes back to. Omit for no Reset. */
  reference?: unknown;
}

/** Up to this many options show as pills; more become a menu. */
const MAX_PILLS = 4;

const differs = (control: Control, value: unknown, reference: unknown) => {
  if (reference === undefined) return false;
  if (control.kind === "number" && typeof value === "number" && typeof reference === "number") {
    return Math.abs(value - reference) > control.step / 2;
  }
  return value !== reference;
};

/**
 * ControlField - renders one entry of the studio's control spec as the right
 * input: a slider, pills or a menu, a colour swatch or a switch. When the
 * value has moved from its reference, a Reset puts it back.
 * Usage: <ControlField control={c} value={getPath(target, c.path)} reference={…} onChange={…} />
 */
export function ControlField({ control, value, onChange, fallbackColor, reference }: ControlFieldProps) {
  const dirty = differs(control, value, reference);
  const reset = dirty ? () => onChange(reference) : undefined;
  const resetButton = reset && (
    <button type="button" className={styles.resetLink} aria-label={LAB_COPY.resetLabel(control.label)} onClick={reset}>
      {LAB_COPY.reset}
    </button>
  );
  const label = (
    <span className={styles.fieldLabel} data-tooltip={control.hint} data-hint={control.hint ? true : undefined}>
      {control.label}
    </span>
  );

  if (control.kind === "number") {
    return (
      <Slider
        label={control.label}
        value={typeof value === "number" ? value : control.min}
        min={control.min}
        max={control.max}
        step={control.step}
        unit={control.unit}
        hint={control.hint}
        onChange={onChange}
        onReset={reset}
        resetText={LAB_COPY.reset}
        resetLabel={LAB_COPY.resetLabel(control.label)}
      />
    );
  }
  if (control.kind === "choice") {
    return (
      <div className={styles.fieldRow}>
        {label}
        <span className={styles.fieldEnd}>
          {resetButton}
          {control.options.length <= MAX_PILLS ? (
            <PillGroup label={control.label} options={control.options} value={String(value)} onChange={onChange} />
          ) : (
            <select
              className={styles.inlineSelect}
              aria-label={control.label}
              value={String(value)}
              onChange={(event) => onChange(event.target.value)}
            >
              {control.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </span>
      </div>
    );
  }
  if (control.kind === "toggle") {
    const checked = control.numeric ? Number(value) >= 0.5 : Boolean(value);
    return (
      <div className={styles.fieldRow}>
        {label}
        <span className={styles.fieldEnd}>
          {resetButton}
          <ToggleSwitch
            checked={checked}
            onChange={(next) => onChange(control.numeric ? (next ? 1 : 0) : next)}
            label={undefined}
            id={control.id}
            size="sm"
          />
        </span>
      </div>
    );
  }
  const unset = control.optional && typeof value !== "string";
  const shown = typeof value === "string" ? value : (fallbackColor ?? "#000000");
  return (
    <div className={styles.fieldRow}>
      {label}
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
