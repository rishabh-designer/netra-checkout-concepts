"use client";

import type { Ref } from "react";
import { ANIMATION_KIND_OPTIONS, BLINK_SECTION, KIND_CONTROL, PLAYBACK_CONTROL } from "@/lib/netrabot/controls";
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
import { KIND_LABELS, LAB_COPY } from "@/lib/netrabot/labCopy";
import type { AnimationKind, NetraAnimation } from "@/types/netrabot";
import { ControlField } from "./ControlField";
import { ControlSections } from "./ControlSections";
import { StepCard } from "./StepCard";
import { Timeline, type TimelineHandle } from "./Timeline";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

export interface AnimationsPanelProps {
  lab: NetraLabApi;
  /** The stage player's seek, for clicking the timeline. */
  onSeek: (ms: number) => void;
  timelineRef: Ref<TimelineHandle>;
}

/**
 * AnimationsPanel - moods, reactions, appears and disappears. Pick one to
 * play it on the stage; see it laid out on the timeline and edit its steps
 * (expression, hold, travel, easing, bounce, intensity, effect), its kind,
 * playback mode and blinking.
 * Usage: <AnimationsPanel lab={lab} onSeek={player.seek} timelineRef={timelineRef} />
 */
export function AnimationsPanel({ lab, onSeek, timelineRef }: AnimationsPanelProps) {
  const { definition, animationKey } = lab;
  const copy = LAB_COPY.animations;
  const animation = definition.animations[animationKey];
  const builtIn = lab.presets.animations[animationKey];
  const edit = (next: NetraAnimation, key?: string) => lab.setDefinition(updateAnimation(definition, animationKey, next), key);
  const groups = ANIMATION_KIND_OPTIONS.map((option) => ({
    kind: option.value as AnimationKind,
    keys: definition.animationOrder.filter((key) => definition.animations[key]?.kind === option.value),
  })).filter((group) => group.keys.length > 0);

  const create = (from?: NetraAnimation, label: string = copy.newName) => {
    const added = addAnimation(definition, label, from, animation.kind);
    lab.setDefinition(added.definition);
    lab.setAnimationKey(added.key);
  };

  const selectStep = (index: number) => {
    lab.setSelectedStep(index);
    document.getElementById(`netrabot-step-${index}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{copy.intro}</p>
      {groups.map((group) => (
        <div key={group.kind} className={styles.group}>
          <h3 className={styles.groupTitle}>{KIND_LABELS[group.kind]}</h3>
          <ul className={styles.chips}>
            {group.keys.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  className={styles.chip}
                  data-selected={key === animationKey || undefined}
                  data-tooltip={definition.animations[key].description || undefined}
                  onClick={() => {
                    lab.setAnimationKey(key);
                    lab.setSelectedStep(0);
                    lab.restart();
                  }}
                >
                  {definition.animations[key].label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
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
      <Timeline
        ref={timelineRef}
        definition={definition}
        animationKey={animationKey}
        selectedStep={lab.selectedStep}
        onSelectStep={selectStep}
        onSeek={onSeek}
        onChangeStep={(index, patch) =>
          edit(
            Object.entries(patch).reduce((next, [path, value]) => updateStep(next, index, path, value), animation),
            `timeline:${animationKey}:${index}`
          )
        }
      />
      {(["label", "group", "description"] as const).map((field) => (
        <label key={field} className={styles.textField}>
          <span className={styles.fieldLabel}>{field === "label" ? copy.name : copy[field]}</span>
          <input
            className={styles.textInput}
            value={animation[field]}
            onChange={(event) => edit(setPath(animation, field, event.target.value), `anim:${animationKey}:${field}`)}
          />
        </label>
      ))}
      <ControlField
        control={KIND_CONTROL}
        value={animation.kind}
        reference={builtIn?.kind}
        onChange={(value) => edit(setPath(animation, "kind", value))}
      />
      <ControlField
        control={PLAYBACK_CONTROL}
        value={animation.playbackMode}
        reference={builtIn?.playbackMode}
        onChange={(value) => edit(setPath(animation, "playbackMode", value))}
      />
      <ControlSections
        sections={[BLINK_SECTION]}
        target={animation}
        reference={builtIn}
        onChange={(path, value) => edit(setPath(animation, path, value), `anim:${animationKey}:${path}`)}
        advanced={lab.advanced}
      />
      <h3 className={styles.sectionTitle}>{copy.steps}</h3>
      <ol className={styles.steps}>
        {animation.steps.map((step, index) => (
          <StepCard
            key={index}
            index={index}
            step={step}
            definition={definition}
            reference={builtIn?.steps[index]}
            selected={index === lab.selectedStep}
            onSelect={() => lab.setSelectedStep(index)}
            onChange={(path, value) => edit(updateStep(animation, index, path, value), `step:${animationKey}:${index}:${path}`)}
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
