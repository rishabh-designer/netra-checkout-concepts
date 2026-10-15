/* The medal's geometry and its sparkle, in the 200-unit frame its SVGs share. */

export const C = 100;
export const CY = 100;
const SIDES = 6;

/** A front-facing hexagon (point on top and bottom), corners rounded. */
export function hexagon(r: number, corner: number): string {
  const pts = Array.from({ length: SIDES }, (_, i) => {
    const t = (i * 2 * Math.PI) / SIDES;
    return [C + r * Math.sin(t), CY - r * Math.cos(t)];
  });
  const towards = (a: number[], b: number[]) => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [a[0] + ((b[0] - a[0]) * corner) / d, a[1] + ((b[1] - a[1]) * corner) / d];
  };
  const f = (p: number[]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  return (
    pts
      .map((v, i) => {
        const a = towards(v, pts[(i + SIDES - 1) % SIDES]);
        const b = towards(v, pts[(i + 1) % SIDES]);
        return `${i ? "L" : "M"}${f(a)} Q${f(v)} ${f(b)}`;
      })
      .join(" ") + " Z"
  );
}

/** Seeded noise, so the sparkle lands in the same places every render. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The medal's thickness: its outline stacked behind the face (px deep),
 *  each layer's tone, bright at the face's lip to deep at the back. */
export const EDGE = Array.from({ length: 20 }, (_, i) => ({
  z: -(i + 1) * 1.25,
  tone: i < 3 ? "-light" : i < 9 ? "" : i < 16 ? "-mid" : "-deep",
}));

/** Glitter points across the raised BK mark (its own 26 × 24 units). */
export const SPARKS = (() => {
  const r = rng(7);
  return Array.from({ length: 90 }, () => ({ x: 1 + r() * 23, y: 2 + r() * 19.5, s: 0.08 + r() * 0.2, o: 0.4 + r() * 0.6 }));
})();

/** Four-point glints that twinkle on the rim, the mark and the air round it. */
export const TWINKLES = [
  { x: 100, y: 7, s: 1.1, delay: 0 },
  { x: 181, y: 53, s: 0.9, delay: 1.3 },
  { x: 24, y: 142, s: 0.9, delay: 2.4 },
  { x: 122, y: 42, s: 0.8, delay: 0.7 },
  { x: 188, y: 120, s: 0.6, delay: 3.1 },
  { x: 14, y: 46, s: 0.55, delay: 1.9 },
];
export const STAR = "M0,-6 C0.5,-0.5 0.5,-0.5 6,0 C0.5,0.5 0.5,0.5 0,6 C-0.5,0.5 -0.5,0.5 -6,0 C-0.5,-0.5 -0.5,-0.5 0,-6Z";

/** Gold dust drifting in the air round the medal. */
export const DUST = (() => {
  const r = rng(42);
  return Array.from({ length: 26 }, () => {
    const a = r() * Math.PI * 2, d = 96 + r() * 14;
    return { x: C + Math.cos(a) * d, y: CY + Math.sin(a) * d, s: 0.35 + r() * 0.7, dur: 2.5 + r() * 3, delay: r() * 3 };
  });
})();
