"use client";

import { useEffect, useImperativeHandle, useRef, type PointerEvent, type Ref } from "react";
import type { PlayerFrameInfo } from "@/lib/hooks/useNetraBotPlayer";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { stepExpression } from "@/lib/netrabot/playback";
import { layoutTimeline, type TimelineSegment } from "@/lib/netrabot/timeline";
import type { AnimationStep, BotDefinition } from "@/types/netrabot";
import { BotThumb } from "./BotThumb";
import styles from "./Timeline.module.css";

export interface TimelineHandle {
  /** Called every frame by the player: moves the playhead (or hides it for another animation). */
  setPlayhead(frame: PlayerFrameInfo): void;
}

export interface TimelineProps {
  definition: BotDefinition;
  animationKey: string;
  selectedStep: number;
  onSelectStep: (index: number) => void;
  onSeek: (ms: number) => void;
  onChangeStep: (index: number, patch: Partial<Pick<AnimationStep, "holdMs" | "transitionMs">>) => void;
  ref?: Ref<TimelineHandle>;
}

/** Drags snap to this many ms. */
const SNAP_MS = 10;
const THUMB_SIZE = 28;

const snap = (ms: number) => Math.max(0, Math.round(ms / SNAP_MS) * SNAP_MS);
const seconds = (ms: number) => `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)}s`;

/**
 * Timeline - an animation as a strip: one block per step (ping-pong's way
 * back is shown fainter), sized by how long it lasts, with the travel part
 * hatched and a live playhead. Click to jump there; drag a block's right edge
 * to change its hold, or its travel mark to move time between travel and hold.
 * Usage: <Timeline definition={def} animationKey="idle" ref={timelineRef} onSeek={seek} … />
 */
export function Timeline({ definition, animationKey, selectedStep, onSelectStep, onSeek, onChangeStep, ref }: TimelineProps) {
  const copy = LAB_COPY.animations;
  const track = useRef<HTMLDivElement>(null);
  const playhead = useRef<HTMLSpanElement>(null);
  const blocks = useRef<(HTMLDivElement | null)[]>([]);
  const animation = definition.animations[animationKey];
  const layout = layoutTimeline(animation);
  const layoutRef = useRef(layout);
  useEffect(() => {
    layoutRef.current = layout;
  });

  /** Where `ms` sits on the strip, in px, from the blocks as they are drawn (short steps have a minimum width). */
  const xFor = (ms: number, segments: TimelineSegment[]) => {
    const index = segments.findIndex((s) => ms < s.end);
    const segment = segments[index === -1 ? segments.length - 1 : index];
    const block = blocks.current[segment.position];
    if (!block) return 0;
    const share = Math.min(1, Math.max(0, (ms - segment.start) / Math.max(1, segment.end - segment.start)));
    return block.offsetLeft + share * block.offsetWidth;
  };

  useImperativeHandle(ref, () => ({
    setPlayhead(frame) {
      const line = playhead.current;
      if (!line) return;
      if (frame.animation !== animationKey) {
        line.style.opacity = "0";
        return;
      }
      line.style.opacity = "1";
      line.style.transform = `translateX(${xFor(frame.elapsedMs, layoutRef.current.segments).toFixed(1)}px)`;
    },
  }));

  const seekTo = (event: PointerEvent) => {
    const area = track.current?.getBoundingClientRect();
    if (!area) return;
    const x = event.clientX - area.left;
    for (const segment of layoutRef.current.segments) {
      const block = blocks.current[segment.position];
      if (!block || x > block.offsetLeft + block.offsetWidth) continue;
      const share = Math.min(1, Math.max(0, (x - block.offsetLeft) / Math.max(1, block.offsetWidth)));
      onSeek(segment.start + share * (segment.end - segment.start));
      return;
    }
    onSeek(layoutRef.current.total);
  };

  /** Drag a handle: `apply` gets the ms moved since the drag began. */
  const drag = (event: PointerEvent, apply: (movedMs: number) => void) => {
    event.stopPropagation();
    const area = track.current?.getBoundingClientRect();
    if (!area || area.width === 0) return;
    const msPerPx = layoutRef.current.total / area.width;
    const startX = event.clientX;
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const move = (next: globalThis.PointerEvent) => apply((next.clientX - startX) * msPerPx);
    const end = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", end);
      target.removeEventListener("pointercancel", end);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", end);
    target.addEventListener("pointercancel", end);
  };

  return (
    <div className={styles.timeline}>
      <div className={styles.head}>
        <span className={styles.title}>{copy.timeline}</span>
        <span className={styles.total}>
          {copy.total} {seconds(layout.total)}
        </span>
      </div>
      <div ref={track} className={styles.track} onPointerDown={seekTo}>
        {layout.segments.map((segment) => {
          const step = animation.steps[segment.stepIndex];
          const face = definition.expressions[step.expression];
          const duration = segment.end - segment.start;
          const travelShare = duration > 0 ? (segment.travel / duration) * 100 : 0;
          return (
            <div
              key={segment.position}
              ref={(node) => {
                blocks.current[segment.position] = node;
              }}
              className={styles.block}
              style={{ flexGrow: Math.max(1, duration) }}
              data-returning={segment.returning || undefined}
              data-selected={(!segment.returning && segment.stepIndex === selectedStep) || undefined}
              data-tooltip={`${segment.stepIndex + 1}. ${face?.label ?? step.expression}${segment.returning ? ` (${copy.returning.toLowerCase()})` : ""}`}
              onClick={() => onSelectStep(segment.stepIndex)}
            >
              <span className={styles.travel} style={{ width: `${travelShare}%` }} aria-hidden />
              <span className={styles.thumb}>
                <BotThumb definition={definition} expression={stepExpression(definition, step)} size={THUMB_SIZE} />
              </span>
              {!segment.returning && (
                <>
                  <span
                    className={styles.travelMark}
                    style={{ left: `${travelShare}%` }}
                    onPointerDown={(event) =>
                      drag(event, (moved) => {
                        const travel = Math.min(duration, snap(step.transitionMs + moved));
                        onChangeStep(segment.stepIndex, { transitionMs: travel, holdMs: Math.max(0, duration - travel) });
                      })
                    }
                    aria-hidden
                  />
                  <span
                    className={styles.edge}
                    onPointerDown={(event) =>
                      drag(event, (moved) => onChangeStep(segment.stepIndex, { holdMs: snap(step.holdMs + moved) }))
                    }
                    aria-hidden
                  />
                </>
              )}
            </div>
          );
        })}
        <span ref={playhead} className={styles.playhead} aria-hidden />
      </div>
      <p className={styles.hint}>{copy.timelineHint}</p>
    </div>
  );
}
