"use client";

import { useState, type Ref } from "react";
import { BotSvg, type BotSvgHandle } from "@/components/ui/NetraBot";
import { PillGroup } from "@/components/ui/PillGroup";
import { Slider } from "@/components/ui/Slider";
import { Sparks } from "@/components/ui/Sparks";
import { LAB_COPY, PREVIEW_SIZES } from "@/lib/netrabot/labCopy";
import { StageActions } from "./StageActions";
import type { NetraLabApi } from "./useNetraLab";
import { useStageDrag } from "./useStageDrag";
import styles from "./NetraLab.module.css";

export interface LabStageProps {
  lab: NetraLabApi;
  /** Returns a ref callback that adds a bot to the player's draw list. */
  register: (id: string) => (handle: BotSvgHandle | null) => void;
  /** The stage canvas element: the pointer is tracked relative to it. */
  canvasRef: Ref<HTMLDivElement>;
  /** Plays a reaction on the stage. */
  onReact: (key: string) => void;
  /** Bumped each time a step fires sparks. */
  burst: number;
}

type StageTone = "light" | "dark";

const SPARK_COUNT = 16;
const SPARK_DISTANCE: [number, number] = [150, 280];

/**
 * LabStage - the big bot, its playback and presence controls, and the bot at
 * the real sizes it will live at (a header icon is 16 to 24px). Every bot
 * shown here is driven by the same player, so they always agree.
 * Usage: <LabStage lab={lab} register={register} canvasRef={setStage} onReact={player.react} burst={burst} />
 */
export function LabStage({ lab, register, canvasRef, onReact, burst }: LabStageProps) {
  const copy = LAB_COPY.stage;
  const [tone, setTone] = useState<StageTone>("light");
  const { definition } = lab;
  const startDrag = useStageDrag(lab);

  const playing =
    lab.tab === "expressions"
      ? `${copy.expressionPrefix}: ${definition.expressions[lab.expressionKey].label}`
      : lab.poseActive && lab.tab === "pose"
        ? copy.livePose
        : lab.tryFace
          ? `${copy.trying}: ${definition.expressions[lab.tryFace].label}`
          : definition.animations[lab.animationKey].label;
  const caption = lab.visible ? playing : `${playing} · ${copy.hidden}`;

  return (
    <section className={styles.stage}>
      <div ref={canvasRef} className={styles.stageCanvas} data-tone={tone} onPointerDown={startDrag}>
        <span className={styles.stageCaption}>{caption}</span>
        <span className={styles.stageHint}>{copy.dragHint}</span>
        {/* Starts blank: the player's first frame is the stage's appear. */}
        <BotSvg ref={register("main")} definition={definition} size="min(100%, 340px)" padding={1.25} initialBlank />
        {burst > 0 && <Sparks key={burst} count={SPARK_COUNT} distance={SPARK_DISTANCE} />}
      </div>
      <StageActions lab={lab} onReact={onReact} />
      <div className={styles.stageControls}>
        <button type="button" className={styles.action} onClick={() => lab.setPaused(!lab.paused)}>
          {lab.paused ? copy.play : copy.pause}
        </button>
        <button type="button" className={styles.action} onClick={lab.restart}>
          {copy.restart}
        </button>
        <button type="button" className={styles.action} aria-pressed={lab.followOn} onClick={() => lab.setFollowOn(!lab.followOn)}>
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
      <Slider
        label={copy.speed}
        value={lab.speed}
        min={0.1}
        max={2}
        step={0.05}
        unit="x"
        onChange={lab.setSpeed}
        onReset={lab.speed !== 1 ? () => lab.setSpeed(1) : undefined}
        resetText={LAB_COPY.reset}
      />
      <div>
        <p className={styles.fieldLabel}>{copy.sizes}</p>
        <div className={styles.sizes} data-tone={tone}>
          {PREVIEW_SIZES.map((size) => (
            <span key={size} className={styles.sizeItem}>
              <BotSvg ref={register(`size-${size}`)} definition={definition} size={size} initialBlank />
              <span className={styles.sizeLabel}>{size}px</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
