"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/Slider";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { CATEGORY_OPTIONS, EXPRESSION_SECTIONS } from "@/lib/netrabot/controls";
import { addExpression, removeExpression, renameExpression } from "@/lib/netrabot/edit";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import type { ExpressionCategory } from "@/types/netrabot";
import { BotThumb } from "./BotThumb";
import { ControlSections } from "./ControlSections";
import { EyeSideSwitch } from "./EyeSideSwitch";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

const ALL = "all";

/**
 * ExpressionsPanel - the saved faces, filterable by category. Pick one to see
 * it on the stage (at a preview intensity) and edit every field in place, its
 * category and its place on the emotion pad; duplicate to branch a new one.
 * Usage: <ExpressionsPanel lab={lab} />
 */
export function ExpressionsPanel({ lab }: { lab: NetraLabApi }) {
  const { definition, expressionKey } = lab;
  const copy = LAB_COPY.expressions;
  const [filter, setFilter] = useState<string>(ALL);
  const selected = definition.expressions[expressionKey];
  const reference = lab.presets.expressions[expressionKey]?.values ?? lab.neutral;
  const keys = definition.expressionOrder.filter((key) => filter === ALL || definition.expressions[key]?.category === filter);

  const duplicate = () => {
    const added = addExpression(definition, `${selected.label} ${copy.copySuffix}`, selected.values, {
      category: selected.category === "presence" ? "presence" : "mine",
    });
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
      <select className={styles.select} aria-label={copy.category} value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option value={ALL}>{LAB_COPY.library.all}</option>
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ul className={`${styles.cards} ${styles.cardsScroll}`}>
        {keys.map((key) => (
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
          onChange={(event) => lab.setDefinition(renameExpression(definition, expressionKey, event.target.value), `name:${expressionKey}`)}
        />
      </label>
      <label className={styles.textField}>
        <span className={styles.fieldLabel}>{copy.category}</span>
        <select
          className={styles.select}
          value={selected.category}
          onChange={(event) => lab.setExpressionDetails({ category: event.target.value as ExpressionCategory })}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{copy.onPad}</span>
        <ToggleSwitch
          checked={!!selected.mood}
          onChange={(on) => lab.setExpressionDetails({ mood: on ? { valence: 0, energy: 0 } : null })}
          size="sm"
        />
      </div>
      {selected.mood && (
        <>
          <Slider
            label={copy.mood}
            value={selected.mood.valence}
            min={-1}
            max={1}
            step={0.05}
            onChange={(valence) => lab.setExpressionDetails({ mood: { ...selected.mood!, valence } })}
          />
          <Slider
            label={copy.energy}
            value={selected.mood.energy}
            min={-1}
            max={1}
            step={0.05}
            onChange={(energy) => lab.setExpressionDetails({ mood: { ...selected.mood!, energy } })}
          />
        </>
      )}
      <Slider
        label={copy.previewIntensity}
        value={lab.previewIntensity}
        min={0}
        max={1.5}
        step={0.05}
        unit="x"
        onChange={lab.setPreviewIntensity}
        onReset={lab.previewIntensity !== 1 ? () => lab.setPreviewIntensity(1) : undefined}
        resetText={LAB_COPY.reset}
      />
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
      <ControlSections
        sections={EXPRESSION_SECTIONS}
        target={selected.values}
        reference={reference}
        onChange={lab.editSelectedExpression}
        fallbackColors={{ bodyColor: definition.body.color, eyeColor: definition.eyeColor }}
        advanced={lab.advanced}
        eyeSide={lab.eyeSide}
        sectionHead={(section) => (section.eyes ? <EyeSideSwitch lab={lab} /> : null)}
      />
    </div>
  );
}
