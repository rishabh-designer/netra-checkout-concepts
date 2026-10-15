"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { MARK_BLOCK, MARK_CURVE, MARK_LETTERS, MARK_LETTERS_AT } from "./bkMark";
import { C, DUST, SPARKS, STAR, TWINKLES, hexagon } from "./medalShape";
import styles from "./RiskScore.module.css";

const BODY = hexagon(94, 13);
const WALL = hexagon(87.5, 11.5);
const FACE = hexagon(84, 11);
const MARK_AT = `translate(${C} 56) scale(1.5) translate(-12.55 -11.73)`;

export interface MedalFaceProps {
  /** The score's word, engraved large ("Excellent", or a provisional "Excellent*"). */
  score: string;
  /** Engraved under it in small capitals ("Business Health" → BUSINESS HEALTH). */
  label: string;
  /** Places the face in the medal's 3D body (front, or the back turned round). */
  style?: CSSProperties;
}

/**
 * MedalFace — one face of the gold medal: a bevelled rim, lit up-left, falling
 * to a recessed satin face; the BK mark raised in glittering gold; the score's
 * word (Instrument Serif) and the label (Anek) engraved in; a band of light
 * sweeping across, twinkling glints and
 * drifting gold dust (still for reduced motion). The medal shows it on both
 * sides of its body.
 * Usage: <MedalFace score="Excellent" label="Business Health" />
 */
export function MedalFace({ score, label, style }: MedalFaceProps) {
  const id = useId().replace(/:/g, "");
  const u = (n: string) => `${id}-${n}`;
  const still = useReducedMotion();
  const stops = (list: [number, string, number?][]) =>
    list.map(([o, c, a]) => <stop key={o} offset={o} style={{ stopColor: `var(--color-medal${c})` }} stopOpacity={a ?? 1} />);
  // An engraving: a lit lower lip, a shaded upper edge, then the cut itself.
  const engrave = (draw: (fill: string) => ReactNode) => (
    <>
      <g transform="translate(0 0.9)" opacity="0.65">{draw("var(--color-medal-glint)")}</g>
      <g transform="translate(0 -0.7)" opacity="0.4">{draw("var(--color-medal-shadow)")}</g>
      {draw(`url(#${u("cut")})`)}
    </>
  );
  const text = (value: string, y: number, size: number, serif: boolean) =>
    engrave((fill) => (
      <text
        x={C}
        y={y}
        textAnchor="middle"
        className={serif ? styles.medalScore : styles.medalText}
        // The serif's hairlines are thin for an engraving: a fine stroke in the same tone gives them body.
        style={{ fill, fontSize: size, fontWeight: serif ? 400 : 600, ...(serif ? { stroke: fill, strokeWidth: 0.35 } : { letterSpacing: "0.14em" }) }}
      >
        {value}
      </text>
    ));
  const loop = (attr: string, values: string, dur: number, begin = 0) =>
    still ? null : <animate attributeName={attr} values={values} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />;
  return (
    <svg viewBox="0 0 200 200" className={styles.medal} style={style}>
      <defs>
        <linearGradient id={u("rim")} x1="0.1" y1="0" x2="0.85" y2="1">{stops([[0, "-glint"], [0.18, "-light"], [0.45, ""], [0.75, "-mid"], [1, "-deep"]])}</linearGradient>
        <linearGradient id={u("ridge")} x1="0" y1="0" x2="0.7" y2="0.8">{stops([[0, "-glint", 1], [0.4, "-glint", 0.5], [1, "-light", 0]])}</linearGradient>
        <linearGradient id={u("lip")} x1="1" y1="1" x2="0.3" y2="0.3">{stops([[0, "-light", 0.9], [0.35, "-light", 0]])}</linearGradient>
        <linearGradient id={u("wall")} x1="0.15" y1="0" x2="0.85" y2="1">{stops([[0, "-deep"], [0.5, "-mid"], [1, "-light"]])}</linearGradient>
        <linearGradient id={u("face")} x1="0.2" y1="0" x2="0.8" y2="1">{stops([[0, "-light"], [0.45, ""], [1, "-mid"]])}</linearGradient>
        <radialGradient id={u("sheen")} cx="0.34" cy="0.2" r="0.55">{stops([[0, "-glint", 0.6], [1, "-glint", 0]])}</radialGradient>
        <linearGradient id={u("fall")} x1="0.3" y1="0.2" x2="0.9" y2="1">{stops([[0.5, "-deep", 0], [1, "-deep", 0.45]])}</linearGradient>
        {/* The band of light that sweeps the face. */}
        <linearGradient id={u("sweep")} gradientUnits="userSpaceOnUse" x1="40" y1="20" x2="160" y2="180">{stops([[0.38, "-glint", 0], [0.5, "-glint", 0.7], [0.62, "-glint", 0]])}</linearGradient>
        <linearGradient id={u("cut")} x1="0" y1="0" x2="0" y2="1">{stops([[0, "-shadow"], [1, "-deep"]])}</linearGradient>
        <linearGradient id={u("mark")} x1="0" y1="0" x2="1" y2="1">{stops([[0, "-light"], [0.45, ""], [1, "-mid"]])}</linearGradient>
        <filter id={u("grain")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="11" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.18  0 0 0 0 0.06  0 0 0 0.12 0" />
        </filter>
        <filter id={u("glitter")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="1" seed="3" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.96  0 0 0 0 0.82  0 0 0 9 -5.2" />
        </filter>
        <clipPath id={u("faceClip")}><path d={FACE} /></clipPath>
        <clipPath id={u("markClip")}><path d={MARK_BLOCK} /></clipPath>
      </defs>

      {/* The bevelled rim, the wall falling to the recessed face. */}
      <path d={BODY} fill={`url(#${u("rim")})`} />
      <path d={hexagon(92.4, 12.6)} fill="none" strokeWidth="1.6" stroke={`url(#${u("ridge")})`} />
      <path d={hexagon(93, 12.8)} fill="none" strokeWidth="1" stroke={`url(#${u("lip")})`} />
      <path d={BODY} fill="none" strokeWidth="0.8" opacity="0.6" style={{ stroke: "var(--color-medal-shadow)" }} />
      <path d={WALL} fill={`url(#${u("wall")})`} />
      <path d={hexagon(87.8, 11.6)} fill="none" strokeWidth="0.7" stroke={`url(#${u("ridge")})`} />
      <path d={FACE} fill={`url(#${u("face")})`} />
      <g clipPath={`url(#${u("faceClip")})`}>
        <rect width="200" height="200" fill={`url(#${u("sheen")})`} style={{ mixBlendMode: "screen" }} />
        <rect width="200" height="200" fill={`url(#${u("fall")})`} style={{ mixBlendMode: "multiply" }} />
        <rect width="200" height="200" filter={`url(#${u("grain")})`} />
      </g>
      <path d={FACE} fill="none" strokeWidth="0.6" opacity="0.5" style={{ stroke: "var(--color-medal-deep)" }} />

      {/* The BK mark, raised in glittering gold, curve and letters cut in. */}
      <g transform={MARK_AT}>
        {/* Its own small thickness and shadow, so it sits proud of the face. */}
        <path d={MARK_BLOCK} transform="translate(0.5 0.8)" style={{ fill: "var(--color-medal-shadow)" }} opacity="0.5" />
        <path d={MARK_BLOCK} transform="translate(0.25 0.4)" style={{ fill: "var(--color-medal-deep)" }} />
        <path d={MARK_BLOCK} fill={`url(#${u("mark")})`} />
        <g clipPath={`url(#${u("markClip")})`}>
          <rect width="26" height="24" filter={`url(#${u("glitter")})`} style={{ mixBlendMode: "screen" }} />
          {SPARKS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} opacity={s.o} style={{ fill: "var(--color-medal-glint)" }} />)}
          <path d={MARK_CURVE} fill="none" strokeWidth="0.8" style={{ stroke: "var(--color-medal-deep)" }} />
        </g>
        <path d={MARK_BLOCK} fill="none" strokeWidth="0.2" style={{ stroke: "var(--color-medal-glint)" }} opacity="0.9" />
        <g transform={MARK_LETTERS_AT} style={{ fill: "var(--color-medal-deep)" }}>
          {MARK_LETTERS.map((d) => <path key={d.slice(0, 12)} d={d} />)}
        </g>
      </g>

      {text(score, 119, 38, true)}
      {text(label.toUpperCase(), 143, 9.5, false)}

      {/* The sweep of light across the face (and over the rim). */}
      <g clipPath={`url(#${u("faceClip")})`}>
        <rect x="-100" y="-100" width="400" height="400" fill={`url(#${u("sweep")})`} style={{ mixBlendMode: "screen" }}>
          {!still && <animateTransform attributeName="transform" type="translate" values="-150 -150; 150 150; 150 150" keyTimes="0; 0.4; 1" dur="5s" repeatCount="indefinite" />}
        </rect>
      </g>

      {/* Glints twinkling on the rim and round it, and drifting gold dust. */}
      {TWINKLES.map((t, i) => (
        <path key={i} d={STAR} transform={`translate(${t.x} ${t.y}) scale(${t.s})`} opacity={still ? 0.7 : 0} style={{ fill: "var(--color-medal-glint)" }}>
          {loop("opacity", "0;0;1;0;0", 3.6, t.delay)}
        </path>
      ))}
      {DUST.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} opacity={still ? 0.5 : 0} style={{ fill: "var(--color-medal-light)" }}>
          {loop("opacity", "0;0.9;0", d.dur, d.delay)}
        </circle>
      ))}
    </svg>
  );
}
