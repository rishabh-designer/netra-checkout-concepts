"use client";

import { useEffect, useRef } from "react";
import { BotSvg, type BotSvgHandle } from "@/components/ui/NetraBot";
import { presenceForThumb } from "@/lib/netrabot/presence";
import type { BotDefinition, Expression } from "@/types/netrabot";
import styles from "./NetraLab.module.css";

export interface BotThumbProps {
  definition: BotDefinition;
  expression: Expression;
  size: number;
  /** False while a player is driving this thumb (a hover preview); true draws the still face. */
  still?: boolean;
  /** The thumb's draw handle, for a player to drive. */
  onHandle?: (handle: BotSvgHandle | null) => void;
}

/**
 * BotThumb - a still picture of an expression, redrawn whenever the
 * expression or the body changes (so list thumbnails follow live edits).
 * Hidden and off-stage faces are tamed so they still read in a list, and the
 * picture is clipped to its box. Hand its handle to a player to animate it.
 * Usage: <BotThumb definition={def} expression={values} size={56} />
 */
export function BotThumb({ definition, expression, size, still = true, onHandle }: BotThumbProps) {
  const handle = useRef<BotSvgHandle | null>(null);
  const shown = presenceForThumb(expression);

  useEffect(() => {
    if (!still) return;
    handle.current?.draw({
      expression: { ...presenceForThumb(expression), eyeMotion: "none", bodyMotion: "none" },
      blink: 1,
      timeMs: 0,
      closedHeight: 4,
    });
  }, [expression, definition, still]);

  return (
    <BotSvg
      ref={(next: BotSvgHandle | null) => {
        handle.current = next;
        onHandle?.(next);
      }}
      definition={definition}
      size={size}
      initial={shown}
      className={styles.thumbSvg}
    />
  );
}
