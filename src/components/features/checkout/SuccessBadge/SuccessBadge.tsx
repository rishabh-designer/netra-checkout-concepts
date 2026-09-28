import { useId } from "react";
import styles from "./SuccessBadge.module.css";

export interface SuccessBadgeProps {
  /** Accessible name ("Payment successful"). */
  label: string;
  className?: string;
}

/* Figma 670:52960: a 21-point star, inner radius 89%, every corner (tips and
   dips) rounded to 3px; its white hairline twin inset 4px; a white tick. */
const POINTS = 21;
const INNER = 0.89;
const CORNER = 3;

type P = [number, number];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const len = (a: P) => Math.hypot(a[0], a[1]);
const f = (n: number) => n.toFixed(2);

/** A star polygon with each corner replaced by a true circular arc. */
function roundedStar(outer: number, corner: number, c = 40): string {
  const pts: P[] = Array.from({ length: POINTS * 2 }, (_, i) => {
    const r = i % 2 ? outer * INNER : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / POINTS;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  });
  let d = "";
  pts.forEach((p, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length];
    const b = pts[(i + 1) % pts.length];
    const va = sub(a, p);
    const vb = sub(b, p);
    const la = len(va);
    const lb = len(vb);
    const ua: P = [va[0] / la, va[1] / la];
    const ub: P = [vb[0] / lb, vb[1] / lb];
    const theta = Math.acos(Math.max(-1, Math.min(1, ua[0] * ub[0] + ua[1] * ub[1])));
    // Tangent length for the radius, capped at half of the shorter edge.
    const t = Math.min(corner / Math.tan(theta / 2), la / 2, lb / 2);
    const r = t * Math.tan(theta / 2);
    const p1: P = [p[0] + ua[0] * t, p[1] + ua[1] * t];
    const p2: P = [p[0] + ub[0] * t, p[1] + ub[1] * t];
    // Clockwise path: tips turn right (sweep 1), dips turn left (sweep 0).
    const cross = (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]);
    d += `${i ? "L" : "M"}${f(p1[0])} ${f(p1[1])}A${f(r)} ${f(r)} 0 0 ${cross > 0 ? 1 : 0} ${f(p2[0])} ${f(p2[1])}`;
  });
  return `${d}Z`;
}

const OUTER = roundedStar(40, CORNER);
// The white twin: 72px (inset 3.96), its 1px stroke inside its edge.
const RING = roundedStar(36.02 - 0.5, CORNER * 0.9);

/**
 * SuccessBadge — the success page's green seal (Figma 670:52960): a rounded
 * 21-point star filled mint-to-green top to bottom with a mint hairline, a
 * white inner ring, a white tick, and a soft green glow. The star and its
 * ring turn slowly (one lap a minute) while the fill's light stays at the
 * top and the tick stays upright. Still under reduced motion.
 * Usage: <SuccessBadge label="Payment successful" />
 */
export function SuccessBadge({ label, className }: SuccessBadgeProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" role="img" aria-label={label} className={`${styles.badge} ${className ?? ""}`}>
      <defs>
        {/* In page space, so the light stays on top while the star turns. */}
        <linearGradient id={`${id}-fill`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="80">
          <stop offset="0" stopColor="var(--color-success-soft)" />
          <stop offset="1" stopColor="var(--color-success)" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={OUTER} className={styles.seal} />
        </clipPath>
      </defs>
      <rect width="80" height="80" fill={`url(#${id}-fill)`} clipPath={`url(#${id}-clip)`} />
      <g className={styles.seal}>
        <path d={OUTER} fill="none" stroke="var(--color-success-border)" strokeWidth="0.45" />
        <path d={RING} fill="none" stroke="var(--color-label-inverse)" strokeWidth="1" />
      </g>
      <path d="M25.4 40.3 35.9 50.8 56.9 26.3" fill="none" stroke="var(--color-label-inverse)" strokeWidth="5.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
