/**
 * NetraBot renderer. Turns a body + expression into SVG path data.
 *
 * The pipeline: each face feature (an eye, the nose) is a rounded rectangle in
 * flat face units, bent, tapered or leaned (warp.ts) -> the surface lays it
 * onto the front of the body -> the head rotates it in 3D -> a camera projects
 * it to 2D. Presence (size, lift, squash, opacity, blur, dither, floor clip)
 * comes back alongside, for the whole drawing (presence.ts).
 *
 * The body is the surface's mesh put through the same rotation and projection.
 * Only the quads facing the camera are drawn (they cover the whole silhouette,
 * so the outline is the true outline of the turned solid), shaded into a few
 * bands by a fixed light so the rounded edge reads.
 */

import type {
  BotBody,
  BotFeatureFrame,
  BotFrame,
  BotLayer,
  BotViewBox,
  EyeGeometry,
  Expression,
} from "@/types/netrabot";
import { bodyMotionOffset, eyeMotionOffset } from "./motion";
import { DEG, clamp, makeRotator, project, smoothstep, type Vec2, type Vec3 } from "./math";
import { presenceFrame } from "./presence";
import { shade } from "./shade";
import { getSurface, type Surface } from "./surfaces";
import { featureOutline, type FeatureWarp } from "./warp";

const MIN_FEATURE_SIZE = 1;
const CAMERA_RADII = 3;
/** The nose is a line with round ends: fully rounded. */
const NOSE_ROUNDNESS = 1;
/** A feature fades out as its surface turns away from the camera. */
const FADE_START = 0.02;
const FADE_END = 0.22;
const HIDDEN: BotFeatureFrame = { path: "", opacity: 0 };

/* Lighting: one light from the upper left, in front. A quad's shade is how far its
   light differs from a flat front face's, in steps, so a bot at rest in its flat
   middle is exactly the brand fill. */
const LIGHT: Vec3 = (() => {
  const raw: Vec3 = [-0.45, 0.65, 0.62];
  const length = Math.hypot(...raw);
  return [raw[0] / length, raw[1] / length, raw[2] / length];
})();
const BAND_WIDTH = 0.04;
const BAND_SPAN = 12;
const SHADE_SWING = 0.45;
const DARKEST = 0.6;
const BRIGHTEST = 1.15;
/** Quads a hair past edge-on are still drawn, so perspective never leaves a notch in the silhouette. */
const EDGE_ON_TOLERANCE = -0.15;
/** Layers per frame: one per shading band. */
export const BODY_LAYER_COUNT = BAND_SPAN * 2 + 1;

/** How much of the mesh is drawn. Small bots do not need every facet. */
export type DetailLevel = "high" | "medium" | "low";
const DETAIL: Record<DetailLevel, { ringStep: number; levelStep: number }> = {
  high: { ringStep: 1, levelStep: 1 },
  medium: { ringStep: 2, levelStep: 2 },
  low: { ringStep: 3, levelStep: 3 },
};

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const round1 = (n: number) => Math.round(n * 10) / 10;

export interface RenderInput {
  expression: Expression;
  /** 1 = eyes open, 0 = shut. */
  blink: number;
  /** Clock for ambient motion, ms. */
  timeMs: number;
  /** Shut height of a blinking eye, face units. */
  closedHeight: number;
  defaultEyeColor: string;
  /** Mesh detail. Defaults to "high". */
  detail?: DetailLevel;
}

interface FeatureSpec {
  width: number;
  height: number;
  roundness: number;
  /** Centre on the face, face units (u right, v up). */
  centreX: number;
  centreY: number;
  angleDeg: number;
  warp: FeatureWarp;
}

interface Camera {
  surface: Surface;
  rotate: ReturnType<typeof makeRotator>;
  perspective: number;
  distance: number;
}

function featurePath(points: Vec2[]): string {
  return `M${points.map(([x, y]) => `${round1(x)} ${round1(y)}`).join("L")}Z`;
}

function renderFeature(spec: FeatureSpec, camera: Camera): BotFeatureFrame {
  const { surface, rotate, perspective, distance } = camera;
  const angle = spec.angleDeg * DEG;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const visible: Vec2[] = [];
  for (const [x, y] of featureOutline(spec.width, spec.height, spec.roundness, spec.warp)) {
    const sample = surface.faceSample(spec.centreX + x * cos + y * sin, spec.centreY - x * sin + y * cos);
    if (rotate(sample.normal)[2] <= 0) continue;
    visible.push(project(rotate(sample.point), perspective, distance));
  }
  if (visible.length < 3) return HIDDEN;
  const facing = rotate(surface.faceSample(spec.centreX, spec.centreY).normal)[2];
  return { path: featurePath(visible), opacity: smoothstep(FADE_START, FADE_END, facing) };
}

/** The body as shading bands: every camera-facing quad of the turned mesh, drawn in the band its light falls in. */
function renderBody(color: string, camera: Camera, detail: DetailLevel): BotLayer[] {
  const { surface, rotate, perspective, distance } = camera;
  const { grid, normals, levels, rings, wallLevels } = surface.mesh;
  const { ringStep, levelStep } = DETAIL[detail];

  // Coarser detail thins the rounded edges but always keeps both faces and the side wall.
  const kept = new Set([0, levels - 1, wallLevels[0], wallLevels[1]]);
  for (let k = levelStep; wallLevels[0] - k > 0; k += levelStep) kept.add(wallLevels[0] - k);
  for (let k = levelStep; wallLevels[1] + k < levels - 1; k += levelStep) kept.add(wallLevels[1] + k);
  const levelIds = [...kept].sort((a, b) => a - b);
  const ringIds: number[] = [];
  for (let i = 0; i < rings; i += ringStep) ringIds.push(i);

  const projected = levelIds.map((m) =>
    ringIds.map((i) => project(rotate(grid[m][i]), perspective, distance))
  );
  const turnedNormals = levelIds.map((m) => ringIds.map((i) => rotate(normals[m][i])));

  const bands = Array.from({ length: BODY_LAYER_COUNT }, () => "");
  for (let a = 0; a < levelIds.length - 1; a++) {
    for (let b = 0; b < ringIds.length; b++) {
      const next = (b + 1) % ringIds.length;
      // A quad is lit by the average of its four smooth corner normals, so light flows across facets.
      const corners = [turnedNormals[a][b], turnedNormals[a][next], turnedNormals[a + 1][next], turnedNormals[a + 1][b]];
      const turned: Vec3 = [
        (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4,
        (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4,
        (corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4,
      ];
      if (turned[2] < EDGE_ON_TOLERANCE) continue;
      const quad = [projected[a][b], projected[a][next], projected[a + 1][next], projected[a + 1][b]];
      // Keep every quad wound the same way so overlaps add up instead of cancelling.
      let area = 0;
      for (let k = 0; k < 4; k++) {
        const p = quad[k];
        const q = quad[(k + 1) % 4];
        area += p[0] * q[1] - q[0] * p[1];
      }
      if (Math.abs(area) < 1e-4) continue;
      if (area < 0) quad.reverse();
      const step = clamp(Math.round((dot(turned, LIGHT) - LIGHT[2]) / BAND_WIDTH), -BAND_SPAN, BAND_SPAN);
      bands[step + BAND_SPAN] += `M${quad.map(([x, y]) => `${round1(x)} ${round1(y)}`).join("L")}Z`;
    }
  }

  // The flat front and back faces are the outermost rings, filled. Each is one constant shade.
  const capFacing = (ringOfPoints: Vec2[], normal: Vec3) => {
    const turned = rotate(normal);
    if (turned[2] < EDGE_ON_TOLERANCE) return;
    let area = 0;
    ringOfPoints.forEach((p, k) => {
      const q = ringOfPoints[(k + 1) % ringOfPoints.length];
      area += p[0] * q[1] - q[0] * p[1];
    });
    const points = area < 0 ? [...ringOfPoints].reverse() : ringOfPoints;
    const step = clamp(Math.round((dot(turned, LIGHT) - LIGHT[2]) / BAND_WIDTH), -BAND_SPAN, BAND_SPAN);
    bands[step + BAND_SPAN] += `M${points.map(([x, y]) => `${round1(x)} ${round1(y)}`).join("L")}Z`;
  };
  capFacing(projected[projected.length - 1], [0, 0, 1]);
  capFacing(projected[0], [0, 0, -1]);

  return bands.map((path, index) => ({
    path,
    fill: shade(color, clamp(1 + SHADE_SWING * (index - BAND_SPAN) * BAND_WIDTH, DARKEST, BRIGHTEST)),
  }));
}

export function renderBotFrame(body: BotBody, input: RenderInput): BotFrame {
  const { expression, blink, closedHeight, timeMs } = input;
  const surface = getSurface(body);
  const glance = eyeMotionOffset(expression.eyeMotion, expression.eyeMotionAmount, expression.motionSpeed, timeMs);
  const sway = bodyMotionOffset(expression.bodyMotion, expression.bodyMotionAmount, expression.motionSpeed, timeMs);
  const camera: Camera = {
    surface,
    rotate: makeRotator(expression.yaw + sway.yaw, expression.pitch + sway.pitch, expression.roll + sway.roll),
    perspective: expression.perspective,
    distance: surface.radius * CAMERA_RADII,
  };

  const eye = (side: -1 | 1, geometry: EyeGeometry): BotFeatureFrame =>
    renderFeature(
      {
        width: Math.max(MIN_FEATURE_SIZE, geometry.width),
        height: Math.max(MIN_FEATURE_SIZE, closedHeight + (geometry.height - closedHeight) * blink),
        roundness: expression.eyeRoundness,
        centreX: (side * expression.spacing) / 2 + geometry.x + glance[0],
        centreY: geometry.y + glance[1],
        angleDeg: geometry.angle,
        warp: { bend: geometry.bend, taper: geometry.taper, skew: geometry.skew, bendAxis: "x" },
      },
      camera
    );

  const { nose } = expression;
  const noseFrame =
    nose.width > 0 && nose.height > 0
      ? renderFeature(
          {
            width: nose.width,
            height: nose.height,
            roundness: NOSE_ROUNDNESS,
            centreX: nose.x,
            centreY: nose.y,
            angleDeg: nose.angle,
            warp: { bend: nose.bend, taper: nose.taper, skew: nose.skew, bendAxis: "y" },
          },
          camera
        )
      : HIDDEN;

  return {
    layers: renderBody(expression.bodyColor ?? body.color, camera, input.detail ?? "high"),
    eyeColor: expression.eyeColor ?? input.defaultEyeColor,
    features: [eye(-1, expression.left), eye(1, expression.right), noseFrame],
    presence: presenceFrame(body, expression, sway),
  };
}

/** Square view box around the bot; `padding` is a multiple of the body radius. */
export function getViewBox(body: BotBody, padding = 1.1): BotViewBox {
  const size = getSurface(body).radius * 2 * padding;
  return { x: -size / 2, y: -size / 2, size };
}

