"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { setExpressionField } from "@/lib/netrabot/edit";
import { clamp } from "@/lib/netrabot/math";
import type { Expression } from "@/types/netrabot";
import type { NetraLabApi } from "./useNetraLab";

/** Degrees of head turn, nod and tilt per px dragged. */
const TURN_PER_PX = 0.35;
const NOD_PER_PX = 0.3;
const TILT_PER_PX = 0.3;
type Feature = "left" | "right" | "nose";

/**
 * useStageDrag - shape the face by grabbing the bot on the stage: drag the
 * body to turn and nod the head, Shift-drag to tilt it, drag an eye or the
 * nose to move it (with Both eyes on, the other eye follows). The first drag
 * freezes the frame on screen and opens the Pose tab, so the sliders follow
 * along. Mouse and pen only: on touch screens the stage still scrolls.
 * Usage: <div onPointerDown={useStageDrag(lab)}>…</div>
 */
export function useStageDrag(lab: NetraLabApi) {
  return (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest("button, select, input, [role='switch']")) return;
    const svg = target.closest("svg");
    const viewBox = svg?.viewBox.baseVal;
    const width = svg?.getBoundingClientRect().width ?? 0;
    if (!svg || !viewBox || width === 0) return;

    event.preventDefault();
    const unitsPerPx = viewBox.width / width;
    const feature = (target as SVGElement).dataset?.feature as Feature | undefined;
    const start: Expression = lab.beginStageDrag();
    const startX = event.clientX;
    const startY = event.clientY;
    const surface = event.currentTarget;
    surface.setPointerCapture(event.pointerId);
    surface.dataset.dragging = "true";

    const move = (next: PointerEvent) => {
      const dx = next.clientX - startX;
      const dy = next.clientY - startY;
      if (feature) {
        const x = start[feature].x + dx * unitsPerPx;
        // Face y runs up; screen y runs down.
        const y = start[feature].y - dy * unitsPerPx;
        const linked = lab.eyeSide === "both";
        let pose = setExpressionField(start, `${feature}.x`, Math.round(x * 10) / 10, linked);
        pose = setExpressionField(pose, `${feature}.y`, Math.round(y * 10) / 10, linked);
        lab.dragPose(pose);
      } else if (next.shiftKey) {
        lab.dragPose({ ...start, roll: clamp(Math.round(start.roll + dx * TILT_PER_PX), -45, 45) });
      } else {
        lab.dragPose({
          ...start,
          yaw: clamp(Math.round(start.yaw + dx * TURN_PER_PX), -90, 90),
          pitch: clamp(Math.round(start.pitch - dy * NOD_PER_PX), -60, 60),
        });
      }
    };
    const end = () => {
      delete surface.dataset.dragging;
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", end);
      surface.removeEventListener("pointercancel", end);
    };
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerup", end);
    surface.addEventListener("pointercancel", end);
  };
}
