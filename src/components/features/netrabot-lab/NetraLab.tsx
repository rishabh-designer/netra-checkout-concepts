"use client";

import { useEffect, useRef, useState } from "react";
import type { BotSvgHandle } from "@/components/ui/NetraBot";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useNetraBotPlayer } from "@/lib/hooks/useNetraBotPlayer";
import { usePointerTarget } from "@/lib/hooks/usePointerTarget";
import { LAB_COPY, LAB_TABS } from "@/lib/netrabot/labCopy";
import type { Expression } from "@/types/netrabot";
import { AnimationsPanel } from "./AnimationsPanel";
import { ExportPanel } from "./ExportPanel";
import { ExpressionsPanel } from "./ExpressionsPanel";
import { LabStage } from "./LabStage";
import { LibraryPanel } from "./LibraryPanel";
import { PosePanel } from "./PosePanel";
import type { TimelineHandle } from "./Timeline";
import { useLabShortcuts } from "./useLabShortcuts";
import { useNetraLab } from "./useNetraLab";
import styles from "./NetraLab.module.css";

/**
 * NetraLab - the NetraBot studio: a stage on one side, and Library, Pose,
 * Expressions, Animations and Export panels on the other. One player feeds
 * every bot on the stage; the design saves to this browser, undoes and
 * redoes, and exports as JSON.
 * Usage: <NetraLab /> (rendered by /netrabot)
 */
export function NetraLab() {
  const currentRef = useRef<() => Expression | null>(() => null);
  const lab = useNetraLab(currentRef);
  const handles = useRef(new Map<string, BotSvgHandle>());
  const timeline = useRef<TimelineHandle>(null);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [burst, setBurst] = useState(0);
  const pointer = usePointerTarget({ scope: lab.follow, element: stage });
  const copy = LAB_COPY.header;

  const register = (id: string) => (handle: BotSvgHandle | null) => {
    if (handle) handles.current.set(id, handle);
    else handles.current.delete(id);
  };

  const player = useNetraBotPlayer({
    definition: lab.ready ? lab.stageDefinition : null,
    animation: lab.stageAnimation,
    pose: lab.stagePose,
    paused: lab.paused,
    speed: lab.speed,
    restartToken: lab.restartToken,
    visible: lab.visible,
    enter: lab.enterKey,
    exit: lab.exitKey,
    enterToken: lab.enterToken,
    replayGapMs: lab.replayGapMs,
    getGaze: () => pointer.current,
    getHandles: () => [...handles.current.values()],
    onEvent: (event) => {
      if (event.type === "step" && event.step.effect === "sparks") setBurst((n) => n + 1);
      lab.onPlayerEvent(event);
    },
    onFrame: (frame) => timeline.current?.setPlayhead(frame),
  });

  useEffect(() => {
    currentRef.current = player.getCurrent;
  });

  useLabShortcuts({
    togglePause: () => lab.setPaused(!lab.paused),
    restart: lab.restart,
    appear: lab.appear,
    disappear: lab.disappear,
    undo: lab.undo,
    redo: lab.redo,
  });

  if (!lab.ready) return null;

  return (
    <main className={styles.lab}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{LAB_COPY.title}</h1>
          <p className={styles.subtitle}>{LAB_COPY.subtitle}</p>
        </div>
        <div className={styles.headerTools}>
          <button type="button" className={styles.action} disabled={!lab.canUndo} onClick={lab.undo}>
            {copy.undo}
          </button>
          <button type="button" className={styles.action} disabled={!lab.canRedo} onClick={lab.redo}>
            {copy.redo}
          </button>
          <ToggleSwitch label={copy.advanced} checked={lab.advanced} onChange={lab.setAdvanced} size="sm" />
          <span className={styles.shortcuts}>{copy.shortcuts}</span>
        </div>
      </header>
      <div className={styles.layout}>
        <LabStage lab={lab} register={register} canvasRef={setStage} onReact={player.react} burst={burst} />
        <aside className={styles.side}>
          <div className={styles.tabs} role="tablist">
            {LAB_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={lab.tab === tab.id}
                className={styles.tab}
                data-selected={lab.tab === tab.id || undefined}
                onClick={() => lab.setTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {lab.tab === "library" && <LibraryPanel lab={lab} />}
          {lab.tab === "pose" && <PosePanel lab={lab} />}
          {lab.tab === "expressions" && <ExpressionsPanel lab={lab} />}
          {lab.tab === "animations" && <AnimationsPanel lab={lab} onSeek={player.seek} timelineRef={timeline} />}
          {lab.tab === "export" && <ExportPanel lab={lab} />}
        </aside>
      </div>
    </main>
  );
}
