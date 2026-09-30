"use client";

import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { Sparks } from "@/components/ui/Sparks";
import { getNetraBotDefinition } from "@/lib/api/netrabot";
import { resolveBase, useNetraBotPlayer } from "@/lib/hooks/useNetraBotPlayer";
import { usePointerTarget } from "@/lib/hooks/usePointerTarget";
import { sampleDirector, startDirector } from "@/lib/netrabot/director";
import { HELD_ANIMATION_KEY, withHeldExpression } from "@/lib/netrabot/edit";
import type { BotDefinition } from "@/types/netrabot";
import { BotSvg, type BotSvgHandle } from "./BotSvg";
import styles from "./NetraBot.module.css";

export interface NetraBotHandle {
  /** Play an animation once ("nodYes", "celebrate", "oops"...), then go back to `state`. */
  react(animation: string): void;
}

export interface NetraBotProps {
  /** The resting animation: "idle", "listening", "thinking", "answering", "reading"... */
  state?: string;
  /** Hold a saved face instead of an animation (it still blinks and moves a little). */
  expression?: string;
  /** CSS size of the square (number = px). */
  size?: number | string;
  /** Pass a definition to skip the fetch (the studio does). */
  definition?: BotDefinition;
  paused?: boolean;
  /** off: looks ahead; page: looks at the pointer wherever it is on the page. */
  follow?: "off" | "page";
  /** Set it to animate presence: true plays `enter`, false plays `exit` and stays gone. Omit and the bot is simply there. */
  visible?: boolean;
  /** How it appears, e.g. "blurRise", "ditherBuild", "sparkPop", "peekUp", "dropIn". */
  enter?: string;
  /** How it disappears, e.g. "blurAway", "ditherOut", "poof", "duckDown", "flyUp". */
  exit?: string;
  onEntered?: () => void;
  /** After the disappear animation ends: unmount the bot here if you like. */
  onExited?: () => void;
  /** Sparks and other step effects. Defaults to on at 40px and up. */
  effects?: boolean;
  className?: string;
  /** Accessible name. Omit when the bot sits beside text that already says what it is. */
  label?: string;
  ref?: Ref<NetraBotHandle>;
}

const DEFAULT_ENTER = "blurRise";
const DEFAULT_EXIT = "blurAway";
const EFFECTS_MIN_SIZE = 40;
const SPARK_COUNT = 12;
/** Spark travel, as a share of the bot's size. */
const SPARK_REACH: [number, number] = [0.45, 1.05];

/* One fetch shared by every NetraBot on the page. */
let definitionRequest: Promise<BotDefinition> | null = null;
const loadDefinition = () => (definitionRequest ??= getNetraBotDefinition());

/**
 * NetraBot - the BimaNetra assistant: a small animated character that reacts to
 * what the product is doing. Change `state` and it tweens into the new
 * animation from wherever it currently is; `ref.react("nodYes")` plays a
 * one-off and returns. With `visible` it appears and disappears (`enter`,
 * `exit`); with `follow="page"` it looks at the pointer.
 * Usage: <NetraBot state="thinking" size={24} />
 *        <NetraBot visible={open} enter="blurRise" exit="ditherOut" onExited={…} />
 */
export function NetraBot({
  state = "idle",
  expression,
  size = 24,
  definition,
  paused,
  follow = "off",
  visible,
  enter,
  exit,
  onEntered,
  onExited,
  effects,
  className,
  label,
  ref,
}: NetraBotProps) {
  const [fetched, setFetched] = useState<BotDefinition | null>(null);
  const handle = useRef<BotSvgHandle>(null);
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [burst, setBurst] = useState(0);
  const pointer = usePointerTarget({ scope: follow, element: svg });
  const loaded = definition ?? fetched;
  const active = useMemo(
    () => (loaded && expression ? withHeldExpression(loaded, expression) : loaded),
    [loaded, expression]
  );
  const base = expression && active?.animations[HELD_ANIMATION_KEY] ? HELD_ANIMATION_KEY : state;
  const presence = visible !== undefined;
  const enterKey = presence ? (enter ?? DEFAULT_ENTER) : null;
  const exitKey = presence ? (exit ?? DEFAULT_EXIT) : null;
  const effectsOn = effects ?? (typeof size === "number" && size >= EFFECTS_MIN_SIZE);

  useEffect(() => {
    if (definition) return;
    let cancelled = false;
    loadDefinition().then((next) => {
      if (!cancelled) setFetched(next);
    });
    return () => {
      cancelled = true;
    };
  }, [definition]);

  const player = useNetraBotPlayer({
    definition: active,
    animation: base,
    paused,
    visible: visible ?? true,
    enter: enterKey,
    exit: exitKey,
    getGaze: () => pointer.current,
    getHandles: () => [handle.current],
    onEvent: (event) => {
      if (event.type === "step" && event.step.effect === "sparks" && effectsOn) setBurst((n) => n + 1);
      else if (event.type === "entered") onEntered?.();
      else if (event.type === "exited") onExited?.();
    },
  });

  useImperativeHandle(ref, () => ({ react: player.react }));

  // The first paint is the director's first frame, so a bot that is about to appear never flashes first.
  const first = useMemo(() => {
    if (!active) return null;
    const resolved = resolveBase(active, base);
    if (!resolved) return null;
    const started = startDirector(
      active,
      {
        base: resolved,
        restartToken: 0,
        visible: visible ?? true,
        enter: enterKey && active.animations[enterKey] ? enterKey : null,
        exit: exitKey && active.animations[exitKey] ? exitKey : null,
        reaction: null,
        enterToken: 0,
        replayGapMs: null,
      },
      0,
      null
    );
    return sampleDirector(active, started.state, 0);
    // Only the first paint uses this; later frames come from the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active || !first) return <span className={styles.frame} style={{ width: size, height: size }} aria-hidden />;
  const reach = typeof size === "number" ? size : 0;
  return (
    <span className={styles.frame} style={{ width: size, height: size }}>
      <BotSvg
        ref={handle}
        svgRef={setSvg}
        definition={active}
        size={size}
        initial={first.expression}
        initialBlank={first.blank}
        className={className}
        label={label}
      />
      {burst > 0 && effectsOn && (
        <Sparks key={burst} count={SPARK_COUNT} distance={[reach * SPARK_REACH[0], reach * SPARK_REACH[1]]} />
      )}
    </span>
  );
}
