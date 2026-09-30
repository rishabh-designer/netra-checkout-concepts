"use client";

import { EXPRESSION_SECTIONS } from "@/lib/netrabot/controls";
import { addExpression, removeExpression, renameExpression } from "@/lib/netrabot/edit";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { BotThumb } from "./BotThumb";
import { ControlSections } from "./ControlSections";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

/**
 * ExpressionsPanel - the saved faces. Pick one to see it on the stage and edit
 * every field in place; duplicate to branch a new one, delete to drop it.
 * Usage: <ExpressionsPanel lab={lab} />
 */
export function ExpressionsPanel({ lab }: { lab: NetraLabApi }) {
  const { definition, expressionKey } = lab;
  const copy = LAB_COPY.expressions;
  const selected = definition.expressions[expressionKey];

  const duplicate = () => {
    const added = addExpression(definition, `${selected.label} ${copy.copySuffix}`, selected.values);
    lab.setDefinition(added.definition);
    lab.setExpressionKey(added.key);
  };

  const remove = () => {
    lab.setDefinition(removeExpression(definition, expressionKey));
    lab.setExpressionKey("");
  };

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{copy.intro}</p>
      <ul className={styles.cards}>
        {definition.expressionOrder.map((key) => (
          <li key={key}>
            <button
              type="button"
              className={styles.card}
              data-selected={key === expressionKey || undefined}
              onClick={() => lab.setExpressionKey(key)}
            >
              <BotThumb definition={definition} expression={definition.expressions[key].values} size={56} />
              <span className={styles.cardLabel}>{definition.expressions[key].label}</span>
            </button>
          </li>
        ))}
      </ul>
      <label className={styles.textField}>
        <span className={styles.fieldLabel}>{copy.name}</span>
        <input
          className={styles.textInput}
          value={selected.label}
          onChange={(event) => lab.setDefinition(renameExpression(definition, expressionKey, event.target.value))}
        />
      </label>
      <div className={styles.toolbar}>
        <button type="button" className={styles.action} onClick={duplicate}>
          {copy.add}
        </button>
        <button
          type="button"
          className={styles.action}
          data-tone="danger"
          disabled={definition.expressionOrder.length <= 1}
          onClick={remove}
        >
          {copy.remove}
        </button>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{copy.linkEyes}</span>
        <ToggleSwitch checked={lab.linked} onChange={lab.setLinked} size="sm" />
      </div>
      <ControlSections
        sections={EXPRESSION_SECTIONS}
        target={selected.values}
        onChange={lab.editSelectedExpression}
        fallbackColors={{ bodyColor: definition.body.color, eyeColor: definition.eyeColor }}
      />
    </div>
  );
}
