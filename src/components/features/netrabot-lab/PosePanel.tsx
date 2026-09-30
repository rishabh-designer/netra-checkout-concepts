"use client";

import { Slider } from "@/components/ui/Slider";
import { BODY_SECTION, EXPRESSION_SECTIONS, GAZE_SECTION } from "@/lib/netrabot/controls";
import { setPath } from "@/lib/netrabot/edit";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { clamp } from "@/lib/netrabot/math";
import { moodFaces, moodWeights } from "@/lib/netrabot/mood";
import { ControlSections } from "./ControlSections";
import { EyeSideSwitch } from "./EyeSideSwitch";
import { OutlineField } from "./OutlineField";
import { Pad2D } from "./Pad2D";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

/** How far the look pad turns and nods the head at its edges, degrees. */
const LOOK_YAW = 40;
const LOOK_PITCH = 30;

/**
 * PosePanel - direct manipulation. The quick layer blends a face from the
 * emotion pad (mood across, energy up) at an intensity, points the head with
 * the look pad, and mirrors or varies the result. Fine-tune has every field.
 * Touch anything and the animation pauses so the face can be shaped live;
 * save it as an expression when it looks right.
 * Usage: <PosePanel lab={lab} />
 */
export function PosePanel({ lab }: { lab: NetraLabApi }) {
  const { definition, pose, poseActive } = lab;
  const copy = LAB_COPY.pose;
  const blending = poseActive ? moodWeights(definition, lab.mood).map((w) => w.key) : [];
  const marks = moodFaces(definition).map((face) => ({ key: face.key, label: face.label, x: face.mood.valence, y: face.mood.energy }));
  const editDefinition = (path: string, value: unknown) => lab.setDefinition(setPath(definition, path, value), `def:${path}`);

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{copy.intro}</p>
      <section className={styles.quick} aria-label={copy.moodPad}>
        <div className={styles.quickHead}>
          <h3 className={styles.quickTitle}>{copy.moodPad}</h3>
          <p className={styles.hint}>{copy.moodHint}</p>
        </div>
        <Pad2D
          label={copy.moodPad}
          x={lab.mood.valence}
          y={lab.mood.energy}
          onChange={(x, y) => lab.setMood({ valence: x, energy: y })}
          valueText={`${copy.axes.happy} ${lab.mood.valence.toFixed(2)}, ${copy.axes.excited} ${lab.mood.energy.toFixed(2)}`}
          axes={{ left: copy.axes.unhappy, right: copy.axes.happy, top: copy.axes.excited, bottom: copy.axes.calm }}
          marks={marks}
          activeMarks={blending}
          home={{ x: 0, y: 0 }}
        />
        <Slider
          label={copy.intensity}
          value={lab.intensity}
          min={0}
          max={1.5}
          step={0.05}
          unit="x"
          onChange={lab.setIntensity}
          onReset={lab.intensity !== 1 ? () => lab.setIntensity(1) : undefined}
          resetText={LAB_COPY.reset}
          resetLabel={LAB_COPY.resetLabel(copy.intensity)}
        />
        <div className={styles.quickRow}>
          <div className={styles.quickLook}>
            <h3 className={styles.quickTitle}>{copy.lookPad}</h3>
            <Pad2D
              size="small"
              label={copy.lookPad}
              x={clamp(pose.yaw / LOOK_YAW, -1, 1)}
              y={clamp(pose.pitch / LOOK_PITCH, -1, 1)}
              onChange={lab.setLook}
              valueText={`${Math.round(pose.yaw)}°, ${Math.round(pose.pitch)}°`}
              axes={{ left: copy.axes.left, right: copy.axes.right, top: copy.axes.up, bottom: copy.axes.down }}
              home={{ x: 0, y: 0 }}
            />
          </div>
          <div className={styles.quickActions}>
            <button type="button" className={styles.action} onClick={lab.mirrorPose}>
              {copy.mirror}
            </button>
            <button type="button" className={styles.action} onClick={lab.surprisePose}>
              {copy.surprise}
            </button>
            <button type="button" className={styles.action} onClick={lab.resetPose}>
              {copy.reset}
            </button>
          </div>
        </div>
      </section>
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
      </div>
      <h3 className={styles.sectionTitle}>{copy.fineTune}</h3>
      <ControlSections
        sections={EXPRESSION_SECTIONS}
        target={pose}
        reference={lab.neutral}
        onChange={lab.editPose}
        fallbackColors={{ bodyColor: definition.body.color, eyeColor: definition.eyeColor }}
        advanced={lab.advanced}
        eyeSide={lab.eyeSide}
        sectionHead={(section) => (section.eyes ? <EyeSideSwitch lab={lab} /> : null)}
      />
      <ControlSections
        sections={[BODY_SECTION, GAZE_SECTION]}
        target={definition}
        reference={lab.presets}
        onChange={editDefinition}
        advanced={lab.advanced}
      />
      {lab.advanced && (
        <OutlineField
          value={definition.body.outline}
          onChange={(outline) => lab.setDefinition(setPath(definition, "body.outline", outline), "def:outline")}
        />
      )}
    </div>
  );
}
