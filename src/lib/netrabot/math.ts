/**
 * NetraBot maths: rotation, perspective and path building.
 * Pure functions, no DOM and no React.
 */

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

export const DEG = Math.PI / 180;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Head rotation as a function. Yaw turns the face right, pitch tips it up,
 * roll tilts it clockwise on screen (model space is y-up, z toward the viewer).
 */
export function makeRotator(yawDeg: number, pitchDeg: number, rollDeg: number) {
  const cy = Math.cos(yawDeg * DEG);
  const sy = Math.sin(yawDeg * DEG);
  const cp = Math.cos(pitchDeg * DEG);
  const sp = Math.sin(pitchDeg * DEG);
  const cr = Math.cos(rollDeg * DEG);
  const sr = Math.sin(rollDeg * DEG);
  return ([x, y, z]: Vec3): Vec3 => {
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cp + z1 * sp;
    const z2 = -y * sp + z1 * cp;
    return [x1 * cr + y2 * sr, -x1 * sr + y2 * cr, z2];
  };
}

/**
 * Pinhole projection onto the screen (y flips to SVG's down axis).
 * perspective 0 is orthographic; 1 puts the camera three radii from the bot.
 * `pivotZ` is the depth drawn at true size, so a bot at rest matches its artwork.
 */
export function project([x, y, z]: Vec3, perspective: number, cameraDistance: number, pivotZ = 0): Vec2 {
  const scale = 1 / Math.max(0.25, 1 - (perspective * (z - pivotZ)) / cameraDistance);
  return [x * scale, -y * scale];
}

const fmt = (n: number) => (Math.round(n * 100) / 100).toString();

export function polygonPath(points: Vec2[]): string {
  if (points.length === 0) return "";
  return `M${points.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L")}Z`;
}
