"use client";

import { STEP_CONTROLS } from "@/lib/netrabot/controls";
import { getPath } from "@/lib/netrabot/edit";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import type { AnimationStep, BotDefinition } from "@/types/netrabot";
import { BotThumb } from "./BotThumb";
import { ControlField } from "./ControlField";
import styles from "./NetraLab.module.css";

export interface StepCardProps {
  index: number;
  step: AnimationStep;
  definition: BotDefinition;
  onChange: (path: string, value: unknown) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  isOnly: boolean;
}

/**
 * StepCard - one step of an animation: which expression, how long to hold it,
 * how long to travel to it, and the easing and bounce of the travel.
 * Usage: <StepCard index={0} step={step} definition={def} onChange={…} … />
 */
export function StepCard({ index, step, definition, onChange, onMove, onRemove, isFirst, isLast, isOnly }: StepCardProps) {
  const copy = LAB_COPY.animations;
  const expression = definition.expressions[step.expression] ?? definition.expressions[definition.expressionOrder[0]];
  return (
    <li className={styles.step}>
      <div className={styles.stepHead}>
        <BotThumb definition={definition} expression={expression.values} size={36} />
        <span className={styles.stepIndex}>
          {copy.stepLabel} {index + 1}
        </span>
        <span className={styles.stepActions}>
          <button type="button" className={styles.miniButton} disabled={isFirst} onClick={() => onMove(-1)} aria-label={copy.moveUp}>
            ↑
          </button>
          <button type="button" className={styles.miniButton} disabled={isLast} onClick={() => onMove(1)} aria-label={copy.moveDown}>
            ↓
          </button>
          <button type="button" className={styles.miniButton} disabled={isOnly} onClick={onRemove} aria-label={copy.removeStep}>
            ×
          </button>
        </span>
      </div>
      <label className={styles.textField}>
        <span className={styles.fieldLabel}>{copy.expression}</span>
        <select className={styles.select} value={step.expression} onChange={(event) => onChange("expression", event.target.value)}>
          {definition.expressionOrder.map((key) => (
            <option key={key} value={key}>
              {definition.expressions[key].label}
            </option>
          ))}
        </select>
      </label>
      {STEP_CONTROLS.map((control) => (
        <ControlField key={control.id} control={control} value={getPath(step, control.path)} onChange={(value) => onChange(control.path, value)} />
      ))}
    </li>
  );
}
