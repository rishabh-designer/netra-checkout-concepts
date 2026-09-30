"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import type { PointerScope } from "@/lib/hooks/usePointerTarget";
import { getDefaultNetraBotDefinition } from "@/lib/api/netrabot";
import { addExpression, setExpressionField, updateExpression } from "@/lib/netrabot/edit";
import type { LabTabId } from "@/lib/netrabot/labCopy";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { resolveExpression } from "@/lib/netrabot/playback";
import { parseNetraBotDefinition } from "@/lib/netrabot/validate";
import type { BotDefinition, Expression } from "@/types/netrabot";

const STORAGE_KEY = "bimanetra:netrabot-lab:v2";

/** The saved design, or null (also null on the server, where there is no window). */
const readStored = (): BotDefinition | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const result = raw ? parseNetraBotDefinition(raw) : null;
    return result?.ok ? result.value : null;
  } catch {
    return null;
  }
};

const subscribeNever = () => () => {};

/**
 * useNetraLab - all of the studio's state: the edited definition (saved to
 * localStorage), which tab and which expression or animation is selected, the
 * live scratch pose, and stage playback controls. `currentRef` is owned by the
 * caller and holds a function returning the expression on screen right now.
 */
export function useNetraLab(currentRef: RefObject<() => Expression | null>) {
  /* false on the server and during hydration, true afterwards: the studio only renders once it can read storage. */
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);
  const [definition, setDefinition] = useState<BotDefinition>(() => readStored() ?? getDefaultNetraBotDefinition());
  const [tab, setTab] = useState<LabTabId>("pose");
  const [animationKey, setAnimationKey] = useState("");
  const [expressionKey, setExpressionKey] = useState("");
  const [pose, setPose] = useState<Expression>(() => resolveExpression(getDefaultNetraBotDefinition(), "neutral"));
  const [poseActive, setPoseActive] = useState(false);
  const [linked, setLinked] = useState(true);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [restartToken, setRestartToken] = useState(0);
  const [followOn, setFollowOn] = useState(true);
  const [followScope, setFollowScope] = useState<Exclude<PointerScope, "off">>("element");

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(definition));
    } catch {
      /* private mode or full storage: editing still works, it just won't persist */
    }
  }, [definition, ready]);

  const safeAnimation = definition.animations[animationKey] ? animationKey : definition.animationOrder[0];
  const safeExpression = definition.expressions[expressionKey] ? expressionKey : definition.expressionOrder[0];

  const editPose = (path: string, value: unknown) => {
    const base = poseActive ? pose : (currentRef.current() ?? pose);
    setPose(setExpressionField(base, path, value, linked));
    setPoseActive(true);
  };

  const editSelectedExpression = (path: string, value: unknown) => {
    const values = definition.expressions[safeExpression].values;
    setDefinition(updateExpression(definition, safeExpression, setExpressionField(values, path, value, linked)));
  };

  const savePoseAsExpression = () => {
    const added = addExpression(definition, LAB_COPY.pose.newExpressionName, pose);
    setDefinition(added.definition);
    setExpressionKey(added.key);
    setTab("expressions");
  };

  /** Freeze the bot on the frame the user is looking at, so the sliders match it. */
  const holdFrame = () => {
    setPose(currentRef.current() ?? pose);
    setPoseActive(true);
  };

  const resetPose = () => {
    setPose(resolveExpression(definition, definition.expressionOrder[0]));
    setPoseActive(true);
  };

  const stagePose =
    tab === "expressions" ? definition.expressions[safeExpression].values : tab === "pose" && poseActive ? pose : null;

  return {
    definition,
    setDefinition,
    ready,
    tab,
    setTab,
    animationKey: safeAnimation,
    setAnimationKey,
    expressionKey: safeExpression,
    setExpressionKey,
    pose,
    poseActive,
    setPoseActive,
    editPose,
    editSelectedExpression,
    savePoseAsExpression,
    resetPose,
    holdFrame,
    stagePose,
    linked,
    setLinked,
    paused,
    setPaused,
    speed,
    setSpeed,
    restartToken,
    followOn,
    setFollowOn,
    followScope,
    setFollowScope,
    /** What the pointer hook should do: the chosen scope when following is on, otherwise nothing. */
    follow: (followOn ? followScope : "off") as PointerScope,
    restart: () => setRestartToken((n) => n + 1),
  };
}

export type NetraLabApi = ReturnType<typeof useNetraLab>;
