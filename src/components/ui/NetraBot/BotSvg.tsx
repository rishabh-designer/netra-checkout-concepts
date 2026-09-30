"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from "react";
import { getViewBox, renderBotFrame, type DetailLevel } from "@/lib/netrabot/render";
import { resolveExpression } from "@/lib/netrabot/playback";
import { DITHER_CELL_PX, DITHER_ORDER, DITHER_SIZE, ditherCellShows } from "@/lib/netrabot/presence";
import type { BotDefinition, BotFrame, BotPresenceFrame, Expression } from "@/types/netrabot";
import styles from "./NetraBot.module.css";

export interface BotDrawInput {
  expression: Expression;
  /** 1 = eyes open, 0 = shut. */
  blink: number;
  /** Clock for ambient motion, ms. */
  timeMs: number;
  /** Shut height of a blinking eye, face units. */
  closedHeight: number;
  /** Draw nothing (the bot has gone and there is no disappear face to hold). */
  blank?: boolean;
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
  /** Start invisible (a bot that has not appeared yet). */
  initialBlank?: boolean;
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
/** Below this, blur (CSS px) is not worth a filter. */
const MIN_BLUR_PX = 0.05;
/** How far past the view box the dither mask and floor clip reach, in view boxes (for lifts and drops). */
const REACH = 3;

/** A 24px icon cannot show a facet, so it does not pay for one. */
const detailForSize = (size: number | string): DetailLevel => {
  if (typeof size !== "number") return "high";
  if (size <= LOW_DETAIL_MAX_SIZE) return "low";
  return size <= MEDIUM_DETAIL_MAX_SIZE ? "medium" : "high";
};
/** A hairline stroke in each layer's own colour hides seams between adjacent facets. */
const SEAM_WIDTH = 0.6;

/** Which face feature each feature path draws, for anything that needs to tell them apart (dragging on the stage). */
const FEATURE_NAMES = ["left", "right", "nose"] as const;

const setOrRemove = (node: Element, name: string, value: string | null) =>
  value === null ? node.removeAttribute(name) : node.setAttribute(name, value);

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/**
 * BotSvg - the bot's SVG: one path per shading band of the body, and three
 * feature paths (two eyes and the nose), inside a presence group that carries
 * lift, size, squash and opacity. A dither mask (dissolve) and a floor clip
 * (peek and duck) switch on only while they are used, and blur is a CSS
 * filter, so a resting bot costs nothing extra. It draws a static first
 * frame, then lets a player drive it through the `ref` handle.
 * Usage: <BotSvg definition={def} size={24} ref={handleRef} />
 */
export function BotSvg({
  definition,
  size = "100%",
  padding,
  detail,
  initial,
  initialBlank,
  ref,
  svgRef,
  className,
  label,
}: BotSvgProps) {
  const ids = useId();
  const maskId = `${ids}-dither-mask`;
  const patternId = `${ids}-dither`;
  const clipId = `${ids}-floor`;
  const svgNode = useRef<SVGSVGElement | null>(null);
  const presenceRef = useRef<SVGGElement>(null);
  const effectsRef = useRef<SVGGElement>(null);
  const patternRef = useRef<SVGPatternElement>(null);
  const cellRefs = useRef<(SVGRectElement | null)[]>([]);
  const floorRef = useRef<SVGRectElement>(null);
  const layerRefs = useRef<(SVGPathElement | null)[]>([]);
  const featureRefs = useRef<(SVGPathElement | null)[]>([]);
  /** CSS px per view-box unit, measured. */
  const pxPerUnit = useRef(0);
  const shownCells = useRef(-1);
  const viewBox = getViewBox(definition.body, padding);
  const level = detail ?? detailForSize(size);

  const [firstFrame] = useState<BotFrame>(() =>
    renderBotFrame(definition.body, {
      expression: initial ?? resolveExpression(definition, definition.expressionOrder[0]),
      blink: 1,
      timeMs: 0,
      closedHeight: DEFAULT_CLOSED_HEIGHT,
      defaultEyeColor: definition.eyeColor,
      detail: level,
    })
  );
  const firstPresence = firstFrame.presence;
  const firstCell = typeof size === "number" ? (DITHER_CELL_PX * viewBox.size) / size : 1;

  /** Size the dither cells to the rendered size, so they stay 2 CSS px however big the bot is. */
  const sizeCells = () => {
    const pattern = patternRef.current;
    if (!pattern || pxPerUnit.current <= 0) return;
    const cell = DITHER_CELL_PX / pxPerUnit.current;
    pattern.setAttribute("width", String(cell * DITHER_SIZE));
    pattern.setAttribute("height", String(cell * DITHER_SIZE));
    cellRefs.current.forEach((rect, index) => {
      if (!rect) return;
      rect.setAttribute("x", String((index % DITHER_SIZE) * cell));
      rect.setAttribute("y", String(Math.floor(index / DITHER_SIZE) * cell));
      rect.setAttribute("width", String(cell));
      rect.setAttribute("height", String(cell));
    });
  };

  useEffect(() => {
    const svg = svgNode.current;
    if (!svg) return;
    const measure = () => {
      const width = svg.getBoundingClientRect().width;
      if (width > 0) pxPerUnit.current = width / viewBox.size;
      sizeCells();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [viewBox.size]);

  const applyPresence = (presence: BotPresenceFrame, blank: boolean) => {
    const group = presenceRef.current;
    const effects = effectsRef.current;
    const svg = svgNode.current;
    if (!group || !effects || !svg) return;
    setOrRemove(group, "transform", presence.transform || null);
    const opacity = blank ? 0 : presence.opacity;
    setOrRemove(group, "opacity", opacity < 1 ? String(Math.round(opacity * 1000) / 1000) : null);

    const blurPx = presence.blur * pxPerUnit.current;
    svg.style.filter = blurPx > MIN_BLUR_PX ? `blur(${blurPx.toFixed(2)}px)` : "";

    const dissolving = presence.dissolve > 0.001;
    setOrRemove(effects, "mask", dissolving ? `url(#${maskId})` : null);
    if (dissolving) {
      const shown = DITHER_ORDER.filter((_, index) => ditherCellShows(index, presence.dissolve)).length;
      if (shown !== shownCells.current) {
        shownCells.current = shown;
        cellRefs.current.forEach((rect, index) =>
          rect?.setAttribute("visibility", ditherCellShows(index, presence.dissolve) ? "visible" : "hidden")
        );
      }
    }
    setOrRemove(effects, "clip-path", presence.grounded ? `url(#${clipId})` : null);
    const floor = floorRef.current;
    if (floor && presence.grounded) {
      const top = viewBox.y - viewBox.size * REACH;
      floor.setAttribute("height", String(Math.max(0, presence.floorY - top)));
    }
  };

  useImperativeHandle(ref, () => ({
    draw({ expression, blink, timeMs, closedHeight, blank = false }) {
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
      applyPresence(frame.presence, blank);
    },
  }));

  const reachX = viewBox.x - viewBox.size * REACH;
  const reachY = viewBox.y - viewBox.size * REACH;
  const reachSize = viewBox.size * (REACH * 2 + 1);
  const firstOpacity = initialBlank ? 0 : firstPresence.opacity;

  return (
    <svg
      ref={(node) => {
        svgNode.current = node;
        assignRef(svgRef, node);
      }}
      className={className ? `${styles.svg} ${className}` : styles.svg}
      style={{ width: size, height: size }}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.size} ${viewBox.size}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <pattern
          ref={patternRef}
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={firstCell * DITHER_SIZE}
          height={firstCell * DITHER_SIZE}
        >
          {DITHER_ORDER.map((_, index) => (
            <rect
              key={index}
              ref={(node) => {
                cellRefs.current[index] = node;
              }}
              x={(index % DITHER_SIZE) * firstCell}
              y={Math.floor(index / DITHER_SIZE) * firstCell}
              width={firstCell}
              height={firstCell}
              fill="white"
              visibility={ditherCellShows(index, firstPresence.dissolve) ? "visible" : "hidden"}
            />
          ))}
        </pattern>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={reachX} y={reachY} width={reachSize} height={reachSize}>
          <rect x={reachX} y={reachY} width={reachSize} height={reachSize} fill={`url(#${patternId})`} />
        </mask>
        <clipPath id={clipId}>
          <rect ref={floorRef} x={reachX} y={reachY} width={reachSize} height={Math.max(0, firstPresence.floorY - reachY)} />
        </clipPath>
      </defs>
      <g
        ref={effectsRef}
        mask={firstPresence.dissolve > 0.001 ? `url(#${maskId})` : undefined}
        clipPath={firstPresence.grounded ? `url(#${clipId})` : undefined}
      >
        <g
          ref={presenceRef}
          transform={firstPresence.transform || undefined}
          opacity={firstOpacity < 1 ? firstOpacity : undefined}
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
              data-feature={FEATURE_NAMES[index]}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
