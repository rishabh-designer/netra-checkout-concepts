"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import type { PointerScope } from "@/lib/hooks/usePointerTarget";
import { getDefaultNetraBotDefinition } from "@/lib/api/netrabot";
import { mirrorExpression, varyExpression, withIntensity } from "@/lib/netrabot/blend";
import type { DirectorEvent } from "@/lib/netrabot/director";
import {
  HELD_ANIMATION_KEY,
  addExpression,
  setExpressionField,
  updateExpression,
  updateExpressionDetails,
  withHeldExpression,
} from "@/lib/netrabot/edit";
import type { LabTabId } from "@/lib/netrabot/labCopy";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { expressionAtMood } from "@/lib/netrabot/mood";
import { colorDefaults, neutralExpression } from "@/lib/netrabot/playback";
import { settleVisibility } from "@/lib/netrabot/presence";
import { createRandom, randomSeed } from "@/lib/netrabot/random";
import { parseNetraBotDefinition } from "@/lib/netrabot/validate";
import type { BotDefinition, Expression, ExpressionCategory, MoodPoint } from "@/types/netrabot";
import { useUndoable, type Update } from "./useUndoable";

const STORAGE_KEY = "bimanetra:netrabot-lab:v2";
/** A per-viewer convenience: whether Advanced controls were left on. */
const ADVANCED_KEY = "bimanetra:netrabot-lab:advanced";
/** The design as it was before its first migration, kept once in case anything needs recovering. */
const BACKUP_KEY = `${STORAGE_KEY}:before-schema-2`;
/** Gaps for the stage's repeating reveal. */
const REAPPEAR_AFTER_MS = 900;
const HIDE_AFTER_MS = 1600;
/** A preview of an animation that plays once repeats after this gap. */
export const PREVIEW_REPLAY_MS = 1200;

export type EyeSide = "both" | "left" | "right";

/** The saved design, or null (also null on the server, where there is no window). */
const readStored = (presets: BotDefinition): BotDefinition | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const result = parseNetraBotDefinition(raw, { presets });
    if (result.ok && !raw.includes('"schemaVersion":2') && !window.localStorage.getItem(BACKUP_KEY)) {
      window.localStorage.setItem(BACKUP_KEY, raw);
    }
    return result.ok ? result.value : null;
  } catch {
    return null;
  }
};

const readAdvanced = () => {
  try {
    return window.localStorage.getItem(ADVANCED_KEY) === "1";
  } catch {
    return false;
  }
};

const subscribeNever = () => () => {};

interface LabDoc {
  definition: BotDefinition;
  /** The scratch face shaped on the Pose tab. */
  pose: Expression;
  poseActive: boolean;
}

/**
 * useNetraLab - all of the studio's state: the edited design and the scratch
 * pose (one undoable document, saved to localStorage), which tab and item is
 * selected, the emotion pad, and the stage (playback, presence, reactions).
 * `currentRef` is owned by the caller and holds a function returning the
 * expression on screen right now.
 */
export function useNetraLab(currentRef: RefObject<() => Expression | null>) {
  /* false on the server and during hydration, true afterwards: the studio only renders once it can read storage. */
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);
  const presets = useMemo(() => getDefaultNetraBotDefinition(), []);
  const doc = useUndoable<LabDoc>(() => ({
    definition: readStored(presets) ?? getDefaultNetraBotDefinition(),
    pose: neutralExpression(presets),
    poseActive: false,
  }));
  const { definition, pose, poseActive } = doc.value;

  const [tab, setTab] = useState<LabTabId>("library");
  const [animationKey, setAnimationKey] = useState("");
  const [expressionKey, setExpressionKey] = useState("");
  const [tryFace, setTryFace] = useState<string | null>(null);
  const [eyeSide, setEyeSide] = useState<EyeSide>("both");
  const [advanced, setAdvancedState] = useState(readAdvanced);
  const [mood, setMoodPoint] = useState<MoodPoint>({ valence: 0, energy: 0 });
  const [intensity, setIntensityValue] = useState(1);
  const [previewIntensity, setPreviewIntensity] = useState(1);
  const [selectedStep, setSelectedStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [restartToken, setRestartToken] = useState(0);
  const [followOn, setFollowOn] = useState(true);
  const [followScope, setFollowScope] = useState<Exclude<PointerScope, "off">>("element");
  const [visible, setVisibleState] = useState(true);
  const [enterToken, setEnterToken] = useState(0);
  const [enterKey, setEnterKey] = useState("blurRise");
  const [exitKey, setExitKey] = useState("blurAway");
  const [loopReveal, setLoopRevealState] = useState(false);
  const [reactionKey, setReactionKey] = useState("nodYes");
  const visibleRef = useRef(true);
  const loopRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(definition));
    } catch {
      /* private mode or full storage: editing still works, it just won't persist */
    }
  }, [definition, ready]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const safeAnimation = definition.animations[animationKey] ? animationKey : definition.animationOrder[0];
  const safeExpression = definition.expressions[expressionKey] ? expressionKey : definition.expressionOrder[0];
  const neutral = neutralExpression(definition);
  const linked = eyeSide === "both";

  const setDefinition = (next: Update<BotDefinition>, key?: string) =>
    doc.set((d) => ({ ...d, definition: typeof next === "function" ? next(d.definition) : next }), key);
  const setPose = (next: Expression, key?: string) => doc.set((d) => ({ ...d, pose: next, poseActive: true }), key);
  /** The frame on screen, fully visible (it may be mid-appear), to shape from. */
  const frozenFrame = () => {
    const frame = currentRef.current();
    return frame ? settleVisibility(frame) : pose;
  };
  /** What pose edits start from: the pose being shaped, or the frame on screen. */
  const poseBase = () => (poseActive ? pose : frozenFrame());

  const editPose = (path: string, value: unknown) => setPose(setExpressionField(poseBase(), path, value, linked), `pose:${path}`);

  const setMood = (point: MoodPoint) => {
    setMoodPoint(point);
    setPose(expressionAtMood(definition, point, intensity), "pose:mood");
  };

  const setIntensity = (value: number) => {
    setIntensityValue(value);
    setPose(expressionAtMood(definition, mood, value), "pose:intensity");
  };

  /** Look pad: x -1..1 turns, y -1..1 nods (up is positive). */
  const setLook = (x: number, y: number) =>
    setPose({ ...poseBase(), yaw: Math.round(x * 40), pitch: Math.round(y * 30) }, "pose:look");

  /** Start shaping the pose by dragging on the stage: freezes the frame on screen, opens Pose, and returns that frame. */
  const beginStageDrag = () => {
    const base = tab === "pose" && poseActive ? pose : frozenFrame();
    setTab("pose");
    setPose(base, "pose:drag");
    return base;
  };
  const dragPose = (next: Expression) => setPose(next, "pose:drag");

  const mirrorPose = () => setPose(mirrorExpression(poseBase(), neutral));
  const surprisePose = () => setPose(varyExpression(poseBase(), createRandom(randomSeed())));

  const editSelectedExpression = (path: string, value: unknown) => {
    const values = definition.expressions[safeExpression].values;
    setDefinition(updateExpression(definition, safeExpression, setExpressionField(values, path, value, linked)), `expr:${safeExpression}:${path}`);
  };

  const setExpressionDetails = (details: { category?: ExpressionCategory; mood?: MoodPoint | null }) =>
    setDefinition(updateExpressionDetails(definition, safeExpression, details), `expr:${safeExpression}:details`);

  const savePoseAsExpression = () => {
    const added = addExpression(definition, LAB_COPY.pose.newExpressionName, pose);
    setDefinition(added.definition);
    setExpressionKey(added.key);
    setTab("expressions");
  };

  /** Freeze the bot on the frame the user is looking at, so the sliders match it. */
  const holdFrame = () => setPose(frozenFrame());
  const resetPose = () => setPose(neutral);
  const setPoseActive = (active: boolean) => doc.set((d) => ({ ...d, poseActive: active }));

  const setAdvanced = (on: boolean) => {
    setAdvancedState(on);
    try {
      window.localStorage.setItem(ADVANCED_KEY, on ? "1" : "0");
    } catch {
      /* storage blocked: the switch still works for this visit */
    }
  };

  const restart = () => setRestartToken((n) => n + 1);

  /* Presence on the stage. Appearing while already shown replays the appear from the top. */
  const setVisible = (next: boolean) => {
    visibleRef.current = next;
    setVisibleState(next);
  };
  const appear = () => {
    window.clearTimeout(timer.current);
    if (visibleRef.current) setEnterToken((n) => n + 1);
    else setVisible(true);
  };
  const disappear = () => {
    window.clearTimeout(timer.current);
    setVisible(false);
  };
  const setLoopReveal = (on: boolean) => {
    loopRef.current = on;
    setLoopRevealState(on);
    window.clearTimeout(timer.current);
    if (on) appear();
  };
  /** The player's events: keeps the reveal repeating while Keep repeating is on. */
  const onPlayerEvent = (event: DirectorEvent) => {
    if (!loopRef.current) return;
    if (event.type === "exited") timer.current = window.setTimeout(appear, REAPPEAR_AFTER_MS);
    if (event.type === "entered") timer.current = window.setTimeout(disappear, HIDE_AFTER_MS);
  };

  /* What the stage shows: a face being tried or edited, the pose being shaped, or the animation. */
  const expressionPreview =
    tab === "expressions"
      ? withIntensity(neutral, definition.expressions[safeExpression].values, previewIntensity, colorDefaults(definition))
      : null;
  const stagePose = expressionPreview ?? (tab === "pose" && poseActive ? pose : null);
  const trying = tab === "library" && tryFace && definition.expressions[tryFace] ? tryFace : null;
  const stageDefinition = useMemo(
    () => (trying ? withHeldExpression(definition, trying) : definition),
    [definition, trying]
  );
  const stageAnimation = trying ? HELD_ANIMATION_KEY : safeAnimation;
  const previewsOnce = definition.animations[safeAnimation]?.kind !== "loop";

  return {
    definition,
    setDefinition,
    presets,
    ready,
    tab,
    setTab,
    animationKey: safeAnimation,
    setAnimationKey,
    expressionKey: safeExpression,
    setExpressionKey,
    tryFace: trying,
    setTryFace,
    pose,
    poseActive,
    setPoseActive,
    editPose,
    mood,
    setMood,
    intensity,
    setIntensity,
    setLook,
    beginStageDrag,
    dragPose,
    mirrorPose,
    surprisePose,
    editSelectedExpression,
    setExpressionDetails,
    previewIntensity,
    setPreviewIntensity,
    savePoseAsExpression,
    resetPose,
    holdFrame,
    neutral,
    eyeSide,
    setEyeSide,
    advanced,
    setAdvanced,
    selectedStep,
    setSelectedStep,
    stagePose,
    stageDefinition,
    stageAnimation,
    replayGapMs: !trying && previewsOnce ? PREVIEW_REPLAY_MS : null,
    paused,
    setPaused,
    speed,
    setSpeed,
    restartToken,
    restart,
    followOn,
    setFollowOn,
    followScope,
    setFollowScope,
    /** What the pointer hook should do: the chosen scope when following is on, otherwise nothing. */
    follow: (followOn ? followScope : "off") as PointerScope,
    visible,
    enterToken,
    enterKey,
    setEnterKey,
    exitKey,
    setExitKey,
    appear,
    disappear,
    loopReveal,
    setLoopReveal,
    reactionKey,
    setReactionKey,
    onPlayerEvent,
    undo: doc.undo,
    redo: doc.redo,
    canUndo: doc.canUndo,
    canRedo: doc.canRedo,
  };
}

export type NetraLabApi = ReturnType<typeof useNetraLab>;
