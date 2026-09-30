"use client";

import { useMemo } from "react";
import type { BotSvgHandle } from "@/components/ui/NetraBot";
import { useNetraBotPlayer } from "@/lib/hooks/useNetraBotPlayer";
import { HELD_ANIMATION_KEY, withHeldExpression } from "@/lib/netrabot/edit";
import type { BotDefinition } from "@/types/netrabot";

export interface HoverPreviewProps {
  definition: BotDefinition;
  /** "face:<key>" holds that face (blinking); "anim:<key>" plays that animation. */
  item: string;
  getHandle: () => BotSvgHandle | null | undefined;
}

/** A one-off animation or reveal in a card repeats after this gap. */
const REPLAY_MS = 500;

/**
 * HoverPreview - plays one library card's face or animation in its thumbnail
 * while it is hovered. Mount it keyed by the card, so every hover starts from
 * the top. Renders nothing itself.
 * Usage: {hovered && <HoverPreview key={hovered} item={hovered} definition={def} getHandle={…} />}
 */
export function HoverPreview({ definition, item, getHandle }: HoverPreviewProps) {
  const face = item.startsWith("face:") ? item.slice(5) : null;
  const held = useMemo(() => (face ? withHeldExpression(definition, face) : definition), [definition, face]);
  useNetraBotPlayer({
    definition: held,
    animation: face ? HELD_ANIMATION_KEY : item.slice(5),
    replayGapMs: REPLAY_MS,
    getHandles: () => [getHandle()],
  });
  return null;
}
