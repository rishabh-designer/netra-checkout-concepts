"use client";

import { useEffect, useRef } from "react";
import { BotSvg, type BotSvgHandle } from "@/components/ui/NetraBot";
import type { BotDefinition, Expression } from "@/types/netrabot";

export interface BotThumbProps {
  definition: BotDefinition;
  expression: Expression;
  size: number;
}

/**
 * BotThumb - a still picture of an expression, redrawn whenever the
 * expression or the body changes (so list thumbnails follow live edits).
 * Usage: <BotThumb definition={def} expression={values} size={56} />
 */
export function BotThumb({ definition, expression, size }: BotThumbProps) {
  const handle = useRef<BotSvgHandle>(null);
  useEffect(() => {
    handle.current?.draw({
      expression: { ...expression, eyeMotion: "none", bodyMotion: "none" },
      blink: 1,
      timeMs: 0,
      closedHeight: 4,
    });
  }, [expression, definition]);
  return <BotSvg ref={handle} definition={definition} size={size} initial={expression} />;
}
