/**
 * NetraBot director: decides what the bot is playing, frame by frame.
 *
 *   entering -> base -> reaction -> base -> ... -> exiting -> gone
 *
 * The base is the bot's resting state (`state="thinking"`). A reaction plays
 * once and hands back to the base. Appearing and disappearing are their own
 * animations, run when `visible` changes. Switching the base mid-appear or
 * mid-reaction is remembered and picked up when they finish. Pure: the caller
 * owns the clock, the random source and the current face.
 */

import type { AnimationStep, BotDefinition, Expression } from "@/types/netrabot";
import {
  advancePlayback,
  playedThrough,
  samplePlayback,
  startPlayback,
  stepExpression,
  type PlaybackSample,
  type PlaybackState,
  type Random,
} from "./playback";
import { buildSequence } from "./timeline";

export type DirectorPhase = "entering" | "base" | "reaction" | "exiting" | "gone";

export interface DirectorInput {
  /** The resting animation. Must exist in the definition. */
  base: string;
  /** Change it to restart the base from the top. */
  restartToken: number;
  visible: boolean;
  /** Appear and disappear animations; null skips straight to shown or gone. */
  enter: string | null;
  exit: string | null;
  /** Bump the token to play `key` once, then return to the base. */
  reaction: { key: string; token: number } | null;
  /** Bump it to play the appear again from the top while the bot is shown. */
  enterToken: number;
  /** Replay a base that plays once after this gap (the studio's preview); null holds its last frame. */
  replayGapMs: number | null;
}

export interface DirectorState {
  phase: DirectorPhase;
  playback: PlaybackState;
  base: string;
  restartToken: number;
  reactionToken: number;
  enterToken: number;
  visible: boolean;
  /** Gone with no disappear animation to show the hidden face: the caller draws nothing. */
  blank: boolean;
}

export type DirectorEvent =
  | { type: "step"; animation: string; position: number; stepIndex: number; step: AnimationStep }
  | { type: "entered" }
  | { type: "exited" };

export interface DirectorResult {
  state: DirectorState;
  events: DirectorEvent[];
}

const has = (definition: BotDefinition, key: string | null): key is string => !!key && !!definition.animations[key];

/** The last face of an animation, as it ends. */
function landing(definition: BotDefinition, key: string): Expression {
  const animation = definition.animations[key];
  const sequence = buildSequence(animation);
  return stepExpression(definition, animation.steps[sequence[sequence.length - 1]]);
}

/** A still playback holding an animation's last face (the bot after it disappeared). */
function holdAtEnd(definition: BotDefinition, key: string, now: number): PlaybackState {
  const animation = definition.animations[key];
  const last = buildSequence(animation).length - 1;
  return { ...startPlayback(definition, key, now, landing(definition, key), 0), position: last, finished: true };
}

/** A still playback holding an animation's first face (the bot before it appears). */
function holdAtStart(definition: BotDefinition, key: string, now: number): PlaybackState {
  return { ...startPlayback(definition, key, now, null, 0), finished: true };
}

function gonePlayback(definition: BotDefinition, input: DirectorInput, now: number) {
  if (has(definition, input.exit)) return { playback: holdAtEnd(definition, input.exit, now), blank: false };
  if (has(definition, input.enter)) return { playback: holdAtStart(definition, input.enter, now), blank: false };
  return { playback: startPlayback(definition, input.base, now, null), blank: true };
}

function stepEvent(definition: BotDefinition, playback: PlaybackState): DirectorEvent {
  const animation = definition.animations[playback.animation];
  const sequence = buildSequence(animation);
  const position = Math.min(playback.position, sequence.length - 1);
  const stepIndex = sequence[position];
  return { type: "step", animation: playback.animation, position, stepIndex, step: animation.steps[stepIndex] };
}

export function startDirector(
  definition: BotDefinition,
  input: DirectorInput,
  now: number,
  current: Expression | null
): DirectorResult {
  const common = {
    base: input.base,
    restartToken: input.restartToken,
    reactionToken: input.reaction?.token ?? 0,
    enterToken: input.enterToken,
    visible: input.visible,
  };
  if (!input.visible) {
    return { state: { ...common, phase: "gone", ...gonePlayback(definition, input, now) }, events: [] };
  }
  const entering = has(definition, input.enter);
  const playback = entering
    ? startPlayback(definition, input.enter!, now, null)
    : startPlayback(definition, input.base, now, current);
  const state: DirectorState = { ...common, phase: entering ? "entering" : "base", playback, blank: false };
  return { state, events: [stepEvent(definition, playback)] };
}

export function stepDirector(
  definition: BotDefinition,
  previous: DirectorState,
  input: DirectorInput,
  now: number,
  random: Random,
  current: Expression
): DirectorResult {
  const state: DirectorState = { ...previous };
  const events: DirectorEvent[] = [];
  let started = false;
  const play = (key: string, from: Expression | null, position = 0) => {
    state.playback = startPlayback(definition, key, now, from, position);
    started = true;
  };

  // Appear and disappear.
  if (input.visible !== state.visible) {
    state.visible = input.visible;
    if (!input.visible && state.phase !== "gone" && state.phase !== "exiting") {
      if (has(definition, input.exit)) {
        state.phase = "exiting";
        play(input.exit, current);
      } else {
        state.phase = "gone";
        Object.assign(state, gonePlayback(definition, input, now));
        events.push({ type: "exited" });
      }
    } else if (input.visible && (state.phase === "gone" || state.phase === "exiting")) {
      const interrupting = state.phase === "exiting";
      state.blank = false;
      if (has(definition, input.enter)) {
        // Back mid-disappear: skip the appear's "start hidden" step and tween from where the bot is.
        const firstIsASet = definition.animations[input.enter].steps[0].transitionMs === 0;
        state.phase = "entering";
        play(input.enter, interrupting ? current : null, interrupting && firstIsASet ? 1 : 0);
      } else {
        state.phase = "base";
        play(state.base, current);
        events.push({ type: "entered" });
      }
    }
  }

  // Replaying the appear while shown: straight back to its first frame.
  if (input.enterToken !== state.enterToken) {
    state.enterToken = input.enterToken;
    if (input.visible && state.phase !== "exiting" && has(definition, input.enter)) {
      state.phase = "entering";
      state.blank = false;
      play(input.enter, null);
    }
  }

  // A new base (or a restart) plays now if the bot is resting, otherwise when it gets back.
  if (input.base !== state.base || input.restartToken !== state.restartToken) {
    state.base = input.base;
    state.restartToken = input.restartToken;
    if (state.phase === "base") play(state.base, current);
  }

  if (input.reaction && input.reaction.token !== state.reactionToken) {
    state.reactionToken = input.reaction.token;
    if ((state.phase === "base" || state.phase === "reaction") && has(definition, input.reaction.key)) {
      state.phase = "reaction";
      play(input.reaction.key, current);
    }
  }

  const before = state.playback;
  if (state.phase !== "gone") state.playback = advancePlayback(definition, state.playback, now, random);

  if ((state.phase === "entering" || state.phase === "reaction") && playedThrough(state.playback)) {
    if (state.phase === "entering") events.push({ type: "entered" });
    const from = landing(definition, state.playback.animation);
    state.phase = "base";
    play(state.base, from);
  } else if (state.phase === "exiting" && playedThrough(state.playback)) {
    state.phase = "gone";
    state.playback = holdAtEnd(definition, state.playback.animation, now);
    events.push({ type: "exited" });
  } else if (
    state.phase === "base" &&
    input.replayGapMs !== null &&
    state.playback.finished &&
    now >= state.playback.positionStartedAt + input.replayGapMs
  ) {
    play(state.base, null);
  }

  const after = state.playback;
  if (
    state.phase !== "gone" &&
    (started || after.animation !== before.animation || after.position !== before.position || after.lap !== before.lap)
  ) {
    events.push(stepEvent(definition, after));
  }
  return { state, events };
}

/** The face the director shows right now. `blank` means draw nothing (gone, with no disappear face). */
export function sampleDirector(definition: BotDefinition, state: DirectorState, now: number): PlaybackSample & { blank: boolean } {
  return { ...samplePlayback(definition, state.playback, now), blank: state.blank };
}
