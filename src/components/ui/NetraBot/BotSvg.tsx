"use client";

import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { getViewBox, renderBotFrame, type DetailLevel } from "@/lib/netrabot/render";
import { resolveExpression } from "@/lib/netrabot/playback";
import type { BotDefinition, Expression } from "@/types/netrabot";
import styles from "./NetraBot.module.css";

export interface BotDrawInput {
  expression: Expression;
  /** 1 = eyes open, 0 = shut. */
  blink: number;
  /** Clock for ambient motion, ms. */
  timeMs: number;
  /** Shut height of a blinking eye, face units. */
  closedHeight: number;
}

/** Imperative handle: a player calls draw() every frame without re-rendering React. */
export interface BotSvgHandle {
  draw(input: BotDrawInput): void;
}

export interface BotSvgProps {
  definition: BotDefinition;
  /** CSS size of the square (number = px). */
  size?: number | string;
  /** Room around the body, as a multiple of its radius. Raise it if a high perspective clips. */
  padding?: number;
  /** Mesh detail. Defaults from the size: small bots draw fewer facets. */
  detail?: DetailLevel;
  /** Shown until the first draw(); defaults to the first expression. */
  initial?: Expression;
  ref?: Ref<BotSvgHandle>;
  /** The underlying <svg>, for measuring where the bot is on the page. */
  svgRef?: Ref<SVGSVGElement>;
  className?: string;
  /** Accessible name. Omit for a purely decorative bot. */
  label?: string;
}

const DEFAULT_CLOSED_HEIGHT = 4;
const MEDIUM_DETAIL_MAX_SIZE = 180;
const LOW_DETAIL_MAX_SIZE = 64;

/** A 24px icon cannot show a facet, so it does not pay for one. */
const detailForSize = (size: number | string): DetailLevel => {
  if (typeof size !== "number") return "high";
  if (size <= LOW_DETAIL_MAX_SIZE) return "low";
  return size <= MEDIUM_DETAIL_MAX_SIZE ? "medium" : "high";
};
/** A hairline stroke in each layer's own colour hides seams between adjacent facets. */
const SEAM_WIDTH = 0.6;

/**
 * BotSvg - the bot's SVG: one path per shading band of the body, and three feature paths (two eyes and the nose). It draws a static
 * first frame, then lets a player drive it through the `ref` handle.
 * Usage: <BotSvg definition={def} size={24} ref={handleRef} />
 */
export function BotSvg({ definition, size = "100%", padding, detail, initial, ref, svgRef, className, label }: BotSvgProps) {
  const layerRefs = useRef<(SVGPathElement | null)[]>([]);
  const featureRefs = useRef<(SVGPathElement | null)[]>([]);
  const viewBox = getViewBox(definition.body, padding);
  const level = detail ?? detailForSize(size);

  const [firstFrame] = useState(() =>
    renderBotFrame(definition.body, {
      expression: initial ?? resolveExpression(definition, definition.expressionOrder[0]),
      blink: 1,
      timeMs: 0,
      closedHeight: DEFAULT_CLOSED_HEIGHT,
      defaultEyeColor: definition.eyeColor,
      detail: level,
    })
  );

  useImperativeHandle(ref, () => ({
    draw({ expression, blink, timeMs, closedHeight }) {
      const frame = renderBotFrame(definition.body, {
        expression,
        blink,
        timeMs,
        closedHeight,
        defaultEyeColor: definition.eyeColor,
        detail: level,
      });
      frame.layers.forEach((layer, index) => {
        const node = layerRefs.current[index];
        if (!node) return;
        node.setAttribute("d", layer.path);
        node.setAttribute("fill", layer.fill);
        node.setAttribute("stroke", layer.fill);
      });
      frame.features.forEach((feature, index) => {
        const node = featureRefs.current[index];
        if (!node) return;
        node.setAttribute("d", feature.path);
        node.setAttribute("fill", frame.eyeColor);
        node.setAttribute("opacity", String(feature.opacity));
      });
    },
  }));

  return (
    <svg
      ref={svgRef}
      className={className ? `${styles.svg} ${className}` : styles.svg}
      style={{ width: size, height: size }}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.size} ${viewBox.size}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {firstFrame.layers.map((layer, index) => (
        <path
          key={index}
          ref={(node) => {
            layerRefs.current[index] = node;
          }}
          d={layer.path}
          fill={layer.fill}
          stroke={layer.fill}
          strokeWidth={SEAM_WIDTH}
          strokeLinejoin="round"
        />
      ))}
      {firstFrame.features.map((feature, index) => (
        <path
          key={index}
          ref={(node) => {
            featureRefs.current[index] = node;
          }}
          d={feature.path}
          fill={firstFrame.eyeColor}
          opacity={feature.opacity}
        />
      ))}
    </svg>
  );
}
