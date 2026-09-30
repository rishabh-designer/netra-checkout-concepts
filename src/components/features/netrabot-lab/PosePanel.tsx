"use client";

import { BODY_SECTION, EXPRESSION_SECTIONS, GAZE_SECTION } from "@/lib/netrabot/controls";
import { setPath } from "@/lib/netrabot/edit";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ControlSections } from "./ControlSections";
import { OutlineField } from "./OutlineField";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

/**
 * PosePanel - direct manipulation. Touch any slider and the animation pauses
 * so the face can be shaped live; save the result as an expression when it
 * looks right. The body (shape and fill) is edited here too.
 * Usage: <PosePanel lab={lab} />
 */
export function PosePanel({ lab }: { lab: NetraLabApi }) {
  const { definition, pose, poseActive } = lab;
  const copy = LAB_COPY.pose;
  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{copy.intro}</p>
      <div className={styles.toolbar}>
        {poseActive ? (
          <button type="button" className={styles.action} onClick={() => lab.setPoseActive(false)}>
            {copy.backToAnimation}
          </button>
        ) : (
          <button type="button" className={styles.action} onClick={lab.holdFrame}>
            {copy.holdFrame}
          </button>
        )}
        <button type="button" className={styles.action} data-tone="primary" onClick={lab.savePoseAsExpression}>
          {copy.saveAsExpression}
        </button>
        <button type="button" className={styles.action} onClick={lab.resetPose}>
          {copy.reset}
        </button>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{copy.linkEyes}</span>
        <ToggleSwitch checked={lab.linked} onChange={lab.setLinked} size="sm" />
      </div>
      <ControlSections
        sections={EXPRESSION_SECTIONS}
        target={pose}
        onChange={lab.editPose}
        fallbackColors={{ bodyColor: definition.body.color, eyeColor: definition.eyeColor }}
      />
      <ControlSections
        sections={[BODY_SECTION]}
        target={definition}
        onChange={(path, value) => lab.setDefinition(setPath(definition, path, value))}
      />
      <ControlSections
        sections={[GAZE_SECTION]}
        target={definition}
        onChange={(path, value) => lab.setDefinition(setPath(definition, path, value))}
      />
      <OutlineField
        value={definition.body.outline}
        onChange={(outline) => lab.setDefinition(setPath(definition, "body.outline", outline))}
      />
    </div>
  );
}
