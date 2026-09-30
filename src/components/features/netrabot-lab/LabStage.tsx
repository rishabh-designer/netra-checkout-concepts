"use client";

import { useState, type Ref } from "react";
import { BotSvg, type BotSvgHandle } from "@/components/ui/NetraBot";
import { PillGroup } from "@/components/ui/PillGroup";
import { Slider } from "@/components/ui/Slider";
import { LAB_COPY, PREVIEW_SIZES } from "@/lib/netrabot/labCopy";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

export interface LabStageProps {
  lab: NetraLabApi;
  /** Returns a ref callback that adds a bot to the player's draw list. */
  register: (id: string) => (handle: BotSvgHandle | null) => void;
  /** The stage canvas element: the pointer is tracked relative to it. */
  canvasRef: Ref<HTMLDivElement>;
}

type StageTone = "light" | "dark";

/**
 * LabStage - the big bot, its playback controls, and the bot at the real
 * sizes it will live at (a header icon is 16 to 24px). Every bot shown here
 * is driven by the same player, so they always agree.
 * Usage: <LabStage lab={lab} register={register} />
 */
export function LabStage({ lab, register, canvasRef }: LabStageProps) {
  const copy = LAB_COPY.stage;
  const [tone, setTone] = useState<StageTone>("light");
  const { definition } = lab;

  const caption =
    lab.tab === "expressions"
      ? `${copy.expressionPrefix}: ${definition.expressions[lab.expressionKey].label}`
      : lab.poseActive && lab.tab === "pose"
        ? copy.livePose
        : definition.animations[lab.animationKey].label;

  return (
    <section className={styles.stage}>
      <div ref={canvasRef} className={styles.stageCanvas} data-tone={tone}>
        <span className={styles.stageCaption}>{caption}</span>
        <BotSvg ref={register("main")} definition={definition} size="min(100%, 340px)" padding={1.25} />
      </div>
      <div className={styles.stageControls}>
        <button type="button" className={styles.action} onClick={() => lab.setPaused(!lab.paused)}>
          {lab.paused ? copy.play : copy.pause}
        </button>
        <button type="button" className={styles.action} onClick={lab.restart}>
          {copy.restart}
        </button>
        <button
          type="button"
          className={styles.action}
          aria-pressed={lab.followOn}
          onClick={() => lab.setFollowOn(!lab.followOn)}
        >
          {copy.followToggle}
        </button>
        <PillGroup
          label={copy.background}
          options={[
            { value: "light", label: copy.light },
            { value: "dark", label: copy.dark },
          ]}
          value={tone}
          onChange={setTone}
        />
      </div>
      {lab.followOn && (
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{copy.followWithin}</span>
          <PillGroup
            label={copy.followWithin}
            options={[
              { value: "element", label: copy.followStage },
              { value: "page", label: copy.followPage },
            ]}
            value={lab.followScope}
            onChange={lab.setFollowScope}
          />
        </div>
      )}
      <Slider label={copy.speed} value={lab.speed} min={0.1} max={2} step={0.05} unit="x" onChange={lab.setSpeed} />
      <div>
        <p className={styles.fieldLabel}>{copy.sizes}</p>
        <div className={styles.sizes} data-tone={tone}>
          {PREVIEW_SIZES.map((size) => (
            <span key={size} className={styles.sizeItem}>
              <BotSvg ref={register(`size-${size}`)} definition={definition} size={size} />
              <span className={styles.sizeLabel}>{size}px</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
