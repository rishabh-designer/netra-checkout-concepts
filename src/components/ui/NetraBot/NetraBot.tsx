"use client";

import { useEffect, useRef, useState } from "react";
import { getNetraBotDefinition } from "@/lib/api/netrabot";
import { useNetraBotPlayer } from "@/lib/hooks/useNetraBotPlayer";
import { usePointerTarget } from "@/lib/hooks/usePointerTarget";
import type { BotDefinition } from "@/types/netrabot";
import { BotSvg, type BotSvgHandle } from "./BotSvg";

export interface NetraBotProps {
  /** Which animation to play: "idle", "listening", "thinking", "answering", "success", "error". */
  state?: string;
  /** CSS size of the square (number = px). */
  size?: number | string;
  /** Pass a definition to skip the fetch (the studio does). */
  definition?: BotDefinition;
  paused?: boolean;
  /** off: looks ahead; page: looks at the pointer wherever it is on the page. */
  follow?: "off" | "page";
  className?: string;
  /** Accessible name. Omit when the bot sits beside text that already says what it is. */
  label?: string;
}

/* One fetch shared by every NetraBot on the page. */
let definitionRequest: Promise<BotDefinition> | null = null;
const loadDefinition = () => (definitionRequest ??= getNetraBotDefinition());

/**
 * NetraBot - the BimaNetra assistant: a small animated character that reacts to
 * what the product is doing. Change `state` and it tweens into the new
 * animation from wherever it currently is. With `follow="page"` it also
 * looks at the pointer.
 * Usage: <NetraBot state="thinking" size={24} />
 */
export function NetraBot({ state = "idle", size = 24, definition, paused, follow = "off", className, label }: NetraBotProps) {
  const [fetched, setFetched] = useState<BotDefinition | null>(null);
  const handle = useRef<BotSvgHandle>(null);
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const pointer = usePointerTarget({ scope: follow, element: svg });
  const active = definition ?? fetched;

  useEffect(() => {
    if (definition) return;
    let cancelled = false;
    loadDefinition().then((loaded) => {
      if (!cancelled) setFetched(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [definition]);

  useNetraBotPlayer({
    definition: active,
    animation: state,
    paused,
    getGaze: () => pointer.current,
    getHandles: () => [handle.current],
  });

  if (!active) return <span style={{ display: "inline-block", width: size, height: size }} aria-hidden />;
  return <BotSvg ref={handle} svgRef={setSvg} definition={active} size={size} className={className} label={label} />;
}
