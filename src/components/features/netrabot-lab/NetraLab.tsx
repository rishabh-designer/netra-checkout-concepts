"use client";

import { useEffect, useRef, useState } from "react";
import type { BotSvgHandle } from "@/components/ui/NetraBot";
import { useNetraBotPlayer } from "@/lib/hooks/useNetraBotPlayer";
import { usePointerTarget } from "@/lib/hooks/usePointerTarget";
import { LAB_COPY, LAB_TABS } from "@/lib/netrabot/labCopy";
import type { Expression } from "@/types/netrabot";
import { AnimationsPanel } from "./AnimationsPanel";
import { ExportPanel } from "./ExportPanel";
import { ExpressionsPanel } from "./ExpressionsPanel";
import { LabStage } from "./LabStage";
import { PosePanel } from "./PosePanel";
import { useNetraLab } from "./useNetraLab";
import styles from "./NetraLab.module.css";

/**
 * NetraLab - the NetraBot studio: a stage on one side, and Pose, Expressions,
 * Animations and Export panels on the other. One player feeds every bot on
 * screen; the design saves to this browser and exports as JSON.
 * Usage: <NetraLab /> (rendered by /netrabot)
 */
export function NetraLab() {
  const currentRef = useRef<() => Expression | null>(() => null);
  const lab = useNetraLab(currentRef);
  const handles = useRef(new Map<string, BotSvgHandle>());
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const pointer = usePointerTarget({ scope: lab.follow, element: stage });

  const register = (id: string) => (handle: BotSvgHandle | null) => {
    if (handle) handles.current.set(id, handle);
    else handles.current.delete(id);
  };

  const player = useNetraBotPlayer({
    definition: lab.ready ? lab.definition : null,
    animation: lab.animationKey,
    pose: lab.stagePose,
    paused: lab.paused,
    speed: lab.speed,
    restartToken: lab.restartToken,
    getGaze: () => pointer.current,
    getHandles: () => [...handles.current.values()],
  });

  useEffect(() => {
    currentRef.current = player.getCurrent;
  });

  if (!lab.ready) return null;

  return (
    <main className={styles.lab}>
      <header className={styles.header}>
        <h1 className={styles.title}>{LAB_COPY.title}</h1>
        <p className={styles.subtitle}>{LAB_COPY.subtitle}</p>
      </header>
      <div className={styles.layout}>
        <LabStage lab={lab} register={register} canvasRef={setStage} />
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
          {lab.tab === "pose" && <PosePanel lab={lab} />}
          {lab.tab === "expressions" && <ExpressionsPanel lab={lab} />}
          {lab.tab === "animations" && <AnimationsPanel lab={lab} />}
          {lab.tab === "export" && <ExportPanel lab={lab} />}
        </aside>
      </div>
    </main>
  );
}
