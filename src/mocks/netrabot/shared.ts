import type {
  AnimationKind,
  AnimationStep,
  BlinkSettings,
  EyeGeometry,
  Expression,
  ExpressionCategory,
  MoodPoint,
  NamedExpression,
  NetraAnimation,
  StepEasing,
} from "@/types/netrabot";

/*
 * NetraBot starter design: shared building blocks for the preset faces and
 * animations. The body is the ikkat shape from Figma (node 757:42195, drawn
 * at 100x) with its two square eyes and nose line. Everything is the Figma
 * frame scaled by 0.444, so the body is 260 wide and a face measurement here
 * is that Figma measurement x 0.444:
 *   eyes   78.2px squares, 25px corners (roundness 0.64), 100px apart
 *   nose   10px line, 119.6px long, between the eyes
 *   face   sits 7px right of the shape's centre, as drawn
 */

/** The ikkat outline, turned to its landscape orientation (absolute M L C Z). */
export const IKKAT_OUTLINE =
  "M0.3679 1.5283C0.5711 1.5283 0.7358 1.3636 0.7358 1.1604L0.7358 1.1321C0.7358 0.9133 0.9132 0.7359 1.1321 0.7359L1.6887 0.7359C1.8919 0.7359 2.0566 0.5711 2.0566 0.3679C2.0566 0.1647 2.2213 0 2.4245 0L3.5755 0C3.7787 0 3.9434 0.1647 3.9434 0.3679C3.9434 0.5711 4.1081 0.7359 4.3113 0.7359L4.8738 0.7359C5.0927 0.7359 5.2701 0.9133 5.2701 1.1321L5.2701 1.2359C5.2701 1.3974 5.401 1.5283 5.5625 1.5283C5.724 1.5283 5.855 1.6592 5.855 1.8207L5.855 2.1792C5.855 2.3408 5.724 2.4717 5.5625 2.4717C5.401 2.4717 5.2701 2.6026 5.2701 2.7641L5.2701 2.8679C5.2701 3.0868 5.0927 3.2642 4.8738 3.2642L4.3113 3.2642C4.1081 3.2642 3.9434 3.4289 3.9434 3.6321C3.9434 3.8353 3.7787 4 3.5755 4L2.4245 4C2.2213 4 2.0566 3.8353 2.0566 3.6321C2.0566 3.4289 1.8919 3.2642 1.6887 3.2642L1.1321 3.2642C0.9132 3.2642 0.7358 3.0868 0.7358 2.8679L0.7358 2.8396C0.7358 2.6364 0.5711 2.4717 0.3679 2.4717C0.1647 2.4717 0 2.307 0 2.1038L0 1.8962C0 1.693 0.1647 1.5283 0.3679 1.5283Z";

/** Figma face, scaled. Offsets are from the face's resting spot. */
const FACE_SHIFT_X = 3.2;
const EYE_SIZE = 34.7;
const EYE_Y = 15.9;
const NOSE_X = 2.2;
const NOSE_Y = 6.8;
const NOSE_LENGTH = 53.1;
const NOSE_THICKNESS = 4.4;
/** Eye height when shut. */
export const SHUT = 4;

export const eye = (overrides: Partial<EyeGeometry> = {}): EyeGeometry => ({
  width: EYE_SIZE,
  height: EYE_SIZE,
  x: FACE_SHIFT_X,
  y: EYE_Y,
  angle: 0,
  bend: 0,
  taper: 0,
  skew: 0,
  ...overrides,
});

export const nose = (overrides: Partial<EyeGeometry> = {}): EyeGeometry => ({
  width: NOSE_THICKNESS,
  height: NOSE_LENGTH,
  x: NOSE_X,
  y: NOSE_Y,
  angle: 0,
  bend: 0,
  taper: 0,
  skew: 0,
  ...overrides,
});

export const NEUTRAL: Expression = {
  yaw: 0,
  pitch: 0,
  roll: 0,
  perspective: 0.3,
  spacing: 79.1,
  eyeRoundness: 0.64,
  left: eye(),
  right: eye(),
  nose: nose(),
  eyeMotion: "microSaccades",
  eyeMotionAmount: 0.5,
  bodyMotion: "slowDrift",
  bodyMotionAmount: 0.3,
  motionSpeed: 1,
  opacity: 1,
  scale: 1,
  lift: 0,
  blur: 0,
  dissolve: 0,
  ground: 0,
  squashX: 1,
  squashY: 1,
};

/** Still: no ambient motion (presence faces, sharp poses). */
export const STILL: Partial<Expression> = { eyeMotion: "none", bodyMotion: "none" };

export interface EyePair extends Partial<Omit<EyeGeometry, "angle" | "skew">> {
  /** Degrees. Positive lifts the inner corners (worried, sad); negative drops them (cross). */
  innerTilt?: number;
  /** Positive leans the tops of both eyes in toward the nose. */
  leanIn?: number;
}

/** Both eyes from one description, mirrored so the face stays symmetrical. */
export const both = ({ innerTilt = 0, leanIn = 0, ...shape }: EyePair = {}) => ({
  left: eye({ ...shape, angle: -innerTilt, skew: leanIn }),
  right: eye({ ...shape, angle: innerTilt, skew: -leanIn }),
});

export const at = (valence: number, energy: number): MoodPoint => ({ valence, energy });

export const face = (
  label: string,
  category: ExpressionCategory,
  mood: MoodPoint | null,
  overrides: Partial<Expression> = {}
): NamedExpression => ({
  label,
  category,
  ...(mood ? { mood } : {}),
  values: { ...NEUTRAL, left: eye(), right: eye(), nose: nose(), ...overrides },
});

export const step = (
  key: string,
  holdMs: number,
  transitionMs: number,
  easing: StepEasing = "smooth",
  bounce = 0.3,
  extra: Partial<AnimationStep> = {}
): AnimationStep => ({ expression: key, holdMs, transitionMs, easing, bounce, intensity: 1, effect: "none", ...extra });

/** A step that jumps straight to its face, with no travel (the start of an appear). */
export const cut = (key: string, holdMs = 0) => step(key, holdMs, 0);

export const BLINK: BlinkSettings = {
  enabled: true,
  initialDelayMs: 1800,
  minIntervalMs: 2800,
  maxIntervalMs: 5000,
  durationMs: 260,
  closedHeight: SHUT,
  doubleChance: 0.12,
};

export const animation = (
  label: string,
  group: string,
  kind: AnimationKind,
  description: string,
  steps: AnimationStep[],
  overrides: Partial<NetraAnimation> = {}
): NetraAnimation => ({
  label,
  group,
  description,
  kind,
  playbackMode: kind === "loop" ? "loop" : "once",
  steps,
  blink: { ...BLINK },
  ...overrides,
});
