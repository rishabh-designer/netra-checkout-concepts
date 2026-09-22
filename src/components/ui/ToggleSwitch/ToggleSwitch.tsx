"use client";

import { cn } from "@/lib/utils";
import styles from "./ToggleSwitch.module.css";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Optional text shown before the switch. */
  label?: string;
  id?: string;
  className?: string;
}

/**
 * ToggleSwitch — a sliding on/off switch (brand-purple track when on, round
 * knob). The only sliding switch in the app; distinct from SegmentedField's
 * Yes/No pills. Usage: <ToggleSwitch checked={on} onChange={setOn} label="…" />
 */
export function ToggleSwitch({ checked, onChange, label, id, className }: ToggleSwitchProps) {
  return (
    <span className={cn(styles.wrap, className)}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        id={id}
        className={styles.track}
        data-on={checked || undefined}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} />
      </button>
    </span>
  );
}
