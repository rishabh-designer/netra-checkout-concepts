"use client";

import { BLINK_SECTION, PLAYBACK_CONTROL } from "@/lib/netrabot/controls";
import {
  addAnimation,
  addStep,
  moveStep,
  removeAnimation,
  removeStep,
  setPath,
  updateAnimation,
  updateStep,
} from "@/lib/netrabot/edit";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { ControlField } from "./ControlField";
import { ControlSections } from "./ControlSections";
import { StepCard } from "./StepCard";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

/**
 * AnimationsPanel - the moods. Pick one to play it on the stage; edit its
 * steps (expression, hold, travel, easing, bounce), playback mode and blinking.
 * Usage: <AnimationsPanel lab={lab} />
 */
export function AnimationsPanel({ lab }: { lab: NetraLabApi }) {
  const { definition, animationKey } = lab;
  const copy = LAB_COPY.animations;
  const animation = definition.animations[animationKey];
  const edit = (next: typeof animation) => lab.setDefinition(updateAnimation(definition, animationKey, next));

  const create = (from?: typeof animation, label: string = copy.newName) => {
    const added = addAnimation(definition, label, from);
    lab.setDefinition(added.definition);
    lab.setAnimationKey(added.key);
  };

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{copy.intro}</p>
      <ul className={styles.list}>
        {definition.animationOrder.map((key) => (
          <li key={key}>
            <button
              type="button"
              className={styles.listItem}
              data-selected={key === animationKey || undefined}
              onClick={() => {
                lab.setAnimationKey(key);
                lab.restart();
              }}
            >
              <span className={styles.cardLabel}>{definition.animations[key].label}</span>
              <span className={styles.listMeta}>{definition.animations[key].group}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.toolbar}>
        <button type="button" className={styles.action} data-tone="primary" onClick={() => create()}>
          {copy.add}
        </button>
        <button type="button" className={styles.action} onClick={() => create(animation, `${animation.label} ${copy.copySuffix}`)}>
          {copy.duplicate}
        </button>
        <button
          type="button"
          className={styles.action}
          data-tone="danger"
          disabled={definition.animationOrder.length <= 1}
          onClick={() => {
            lab.setDefinition(removeAnimation(definition, animationKey));
            lab.setAnimationKey("");
          }}
        >
          {copy.remove}
        </button>
      </div>
      {(["label", "group", "description"] as const).map((field) => (
        <label key={field} className={styles.textField}>
          <span className={styles.fieldLabel}>{field === "label" ? copy.name : copy[field]}</span>
          <input className={styles.textInput} value={animation[field]} onChange={(event) => edit(setPath(animation, field, event.target.value))} />
        </label>
      ))}
      <ControlField control={PLAYBACK_CONTROL} value={animation.playbackMode} onChange={(value) => edit(setPath(animation, "playbackMode", value))} />
      <ControlSections sections={[BLINK_SECTION]} target={animation} onChange={(path, value) => edit(setPath(animation, path, value))} />
      <h3 className={styles.sectionTitle}>{copy.steps}</h3>
      <ol className={styles.steps}>
        {animation.steps.map((step, index) => (
          <StepCard
            key={index}
            index={index}
            step={step}
            definition={definition}
            onChange={(path, value) => edit(updateStep(animation, index, path, value))}
            onMove={(direction) => edit(moveStep(animation, index, direction))}
            onRemove={() => edit(removeStep(animation, index))}
            isFirst={index === 0}
            isLast={index === animation.steps.length - 1}
            isOnly={animation.steps.length === 1}
          />
        ))}
      </ol>
      <button type="button" className={styles.action} onClick={() => edit(addStep(animation, animation.steps[animation.steps.length - 1].expression))}>
        {copy.addStep}
      </button>
    </div>
  );
}
