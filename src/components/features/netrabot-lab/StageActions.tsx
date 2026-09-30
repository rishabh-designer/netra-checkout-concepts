"use client";

import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import type { AnimationKind } from "@/types/netrabot";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

export interface StageActionsProps {
  lab: NetraLabApi;
  /** Plays a reaction on the stage, then returns to what was playing. */
  onReact: (key: string) => void;
}

/**
 * StageActions - try the bot the way the product will use it: appear and
 * disappear with any reveal (or keep repeating them), and fire a reaction
 * on top of whatever is playing.
 * Usage: <StageActions lab={lab} onReact={player.react} />
 */
export function StageActions({ lab, onReact }: StageActionsProps) {
  const { definition } = lab;
  const copy = LAB_COPY.stage;
  const ofKind = (kind: AnimationKind) => definition.animationOrder.filter((key) => definition.animations[key]?.kind === kind);
  const options = (keys: string[]) =>
    keys.map((key) => (
      <option key={key} value={key}>
        {definition.animations[key].label}
      </option>
    ));

  return (
    <div className={styles.stageActions}>
      <div className={styles.stageAction}>
        <select className={styles.inlineSelect} aria-label={copy.appearWith} value={lab.enterKey} onChange={(event) => lab.setEnterKey(event.target.value)}>
          {options(ofKind("enter"))}
        </select>
        <button type="button" className={styles.action} data-tone="primary" onClick={lab.appear}>
          {copy.appear}
        </button>
      </div>
      <div className={styles.stageAction}>
        <select
          className={styles.inlineSelect}
          aria-label={copy.disappearWith}
          value={lab.exitKey}
          onChange={(event) => lab.setExitKey(event.target.value)}
        >
          {options(ofKind("exit"))}
        </select>
        <button type="button" className={styles.action} onClick={lab.disappear}>
          {copy.disappear}
        </button>
      </div>
      <div className={styles.stageAction}>
        <select className={styles.inlineSelect} aria-label={copy.reaction} value={lab.reactionKey} onChange={(event) => lab.setReactionKey(event.target.value)}>
          {options(ofKind("reaction"))}
        </select>
        <button type="button" className={styles.action} onClick={() => onReact(lab.reactionKey)}>
          {copy.playReaction}
        </button>
      </div>
      <ToggleSwitch label={copy.loopReveal} checked={lab.loopReveal} onChange={lab.setLoopReveal} size="sm" />
    </div>
  );
}
