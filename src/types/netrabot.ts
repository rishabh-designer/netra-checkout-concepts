/**
 * NetraBot - shared types.
 *
 * The bot is three separate layers (the same split the research calls out):
 *   body       - what it is (one editable surface + fill colour)
 *   expression - a saved face/pose preset (numbers only, so it can be tweened)
 *   animation  - a sequence of expressions with timing, easing and blinking
 * Every field here is surfaced as a control in the /netrabot studio.
 */

export type EyeMotion = "none" | "microSaccades" | "shake";
export type BodyMotion = "none" | "slowDrift" | "shake";
export type StepEasing = "smooth" | "snappy" | "spring";
export type PlaybackMode = "loop" | "once" | "pingPong";
/**
 * One surface today: a domed plate cut to an SVG outline (the ikkat shape).
 * Add a key here (and in lib/netrabot/surfaces.ts) for a different kind of body.
 */
export type SurfaceKey = "outline";

/** One face feature (an eye or the nose), in face units (1 unit = 1px at the bot's natural size). */
export interface EyeGeometry {
  width: number;
  height: number;
  /** Offset from the resting spot; positive x is screen-right. */
  x: number;
  /** Offset from the resting spot; positive y is up. */
  y: number;
  /** Degrees, clockwise on screen. */
  angle: number;
}

export interface Expression {
  /** Head rotation in degrees: yaw turns right, pitch tips up, roll tilts clockwise. */
  yaw: number;
  pitch: number;
  roll: number;
  /** 0 = flat (orthographic), 1 = strong perspective. */
  perspective: number;
  /** Distance between the two eye centres at rest. */
  spacing: number;
  /** 0 = square-cornered eyes, 1 = fully rounded (pill). */
  eyeRoundness: number;
  left: EyeGeometry;
  right: EyeGeometry;
  /** A line between the eyes. Set its length (height) to 0 to hide it. Drawn in the eye colour. */
  nose: EyeGeometry;
  eyeMotion: EyeMotion;
  eyeMotionAmount: number;
  bodyMotion: BodyMotion;
  bodyMotionAmount: number;
  /** Multiplier on the ambient motion clock. */
  motionSpeed: number;
  /** Optional colour overrides; fall back to the definition's colours. */
  eyeColor?: string;
  bodyColor?: string;
}

export interface NamedExpression {
  label: string;
  values: Expression;
}

export interface AnimationStep {
  /** Key into BotDefinition.expressions. */
  expression: string;
  holdMs: number;
  /** Time to travel to this step's expression from the previous one. */
  transitionMs: number;
  easing: StepEasing;
  /** Overshoot for snappy and spring easing, 0 to 1. */
  bounce: number;
}

export interface BlinkSettings {
  enabled: boolean;
  initialDelayMs: number;
  minIntervalMs: number;
  maxIntervalMs: number;
  durationMs: number;
  /** Eye height at the moment the eye is shut, in face units. */
  closedHeight: number;
}

export interface NetraAnimation {
  label: string;
  description: string;
  /** Where the bot uses it, e.g. "Ask BimaNetra" - for the studio's grouping only. */
  group: string;
  playbackMode: PlaybackMode;
  steps: AnimationStep[];
  blink: BlinkSettings;
}

export interface BotBody {
  surface: SurfaceKey;
  /** SVG path data (absolute M L H V C Z) for the outline. Scaled to fit width x height. */
  outline: string;
  width: number;
  height: number;
  /** Thickness of the body, front to back. */
  depth: number;
  /** Radius of the rounded edge, all the way round. 0 is a sharp edge; half the thickness is fully round. */
  bevel: number;
  color: string;
}

/** How the bot looks at the pointer: the most it turns, nods and slides its face, and how quickly it eases. */
export interface GazeSettings {
  /** Head turn at full sideways deflection, degrees. */
  headYaw: number;
  /** Head nod at full up or down deflection, degrees. */
  headPitch: number;
  /** How far the eyes and nose slide across the face at full deflection, px. */
  faceShift: number;
  /** Time constant of the easing, ms. 0 snaps. */
  smoothingMs: number;
}

export interface BotDefinition {
  schema: "bimanetra/netrabot";
  schemaVersion: 1;
  name: string;
  body: BotBody;
  eyeColor: string;
  gaze: GazeSettings;
  expressions: Record<string, NamedExpression>;
  expressionOrder: string[];
  animations: Record<string, NetraAnimation>;
  animationOrder: string[];
}

/** What the renderer hands back for one frame. Pure data, no DOM. */
export interface BotFeatureFrame {
  path: string;
  opacity: number;
}

export interface BotLayer {
  path: string;
  fill: string;
}

export interface BotFrame {
  /** One layer per shading band, darkest first. */
  layers: BotLayer[];
  eyeColor: string;
  /** Left eye, right eye, nose. */
  features: [BotFeatureFrame, BotFeatureFrame, BotFeatureFrame];
}

export interface BotViewBox {
  x: number;
  y: number;
  size: number;
}
