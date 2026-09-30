/**
 * NetraBot - shared types.
 *
 * The bot is three separate layers (the same split the research calls out):
 *   body       - what it is (one editable surface + fill colour)
 *   expression - a saved face/pose preset (numbers only, so it can be tweened)
 *   animation  - a sequence of expressions with timing, easing and blinking
 * Every field here is surfaced as a control in the /netrabot studio.
 *
 * Presence (opacity, size, lift, blur, dissolve, floor clip, squash) is part of
 * an expression too, so appearing and disappearing are ordinary animations
 * between a hidden face and a shown one.
 */

export type EyeMotion = "none" | "microSaccades" | "shake" | "scan" | "roll";
export type BodyMotion = "none" | "slowDrift" | "shake" | "breathe" | "bob" | "nod" | "tremble" | "sway";
export type StepEasing = "smooth" | "snappy" | "spring" | "accelerate" | "decelerate" | "linear" | "anticipate";
export type PlaybackMode = "loop" | "once" | "pingPong";
/**
 * What an animation is for. loop: a resting state (`state="thinking"`).
 * reaction: plays once, then the bot returns to its state (`react("nod")`).
 * enter / exit: how the bot appears and disappears (`visible`).
 */
export type AnimationKind = "loop" | "reaction" | "enter" | "exit";
/** Something fired as a step begins. */
export type StepEffect = "none" | "sparks";
export type ExpressionCategory =
  | "everyday"
  | "happy"
  | "sad"
  | "angry"
  | "fear"
  | "surprise"
  | "thinking"
  | "social"
  | "energy"
  | "presence"
  | "mine";
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
  /**
   * Curves the shape along its length, -1 to 1. An eye arches up (a thin, wide
   * eye with a bend reads as a smile) or sags; the nose bows right or left.
   */
  bend: number;
  /** -1 to 1: positive widens the top and narrows the bottom. */
  taper: number;
  /** -1 to 1: leans the top of the shape right (positive) or left. */
  skew: number;
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
  /** Presence: 1 = fully there, 0 = gone. */
  opacity: number;
  /** Overall size about the centre. 1 = natural. */
  scale: number;
  /** Rise above the resting spot, face units. Negative sinks. */
  lift: number;
  /** Soft focus, face units. 0 = sharp. */
  blur: number;
  /** 0 = solid, 1 = broken up into dither cells until nothing is left. */
  dissolve: number;
  /** 1 = clipped at the resting floor line, so the bot can hide below it (Peek up, Duck down). */
  ground: number;
  /** Squash and stretch about the bottom edge. 1 = natural. */
  squashX: number;
  squashY: number;
  /** Optional colour overrides; fall back to the definition's colours. */
  eyeColor?: string;
  bodyColor?: string;
}

/** Where a face sits on the studio's emotion pad: valence (unhappy to happy) and energy (calm to excited), -1 to 1. */
export interface MoodPoint {
  valence: number;
  energy: number;
}

export interface NamedExpression {
  label: string;
  category: ExpressionCategory;
  /** Omit to keep a face off the emotion pad (presence faces, for example). */
  mood?: MoodPoint;
  values: Expression;
}

export interface AnimationStep {
  /** Key into BotDefinition.expressions. */
  expression: string;
  holdMs: number;
  /** Time to travel to this step's expression from the previous one. */
  transitionMs: number;
  easing: StepEasing;
  /** Overshoot for snappy, spring and anticipate easing, 0 to 1. */
  bounce: number;
  /** How strongly the expression shows: 0 is neutral, 1 as saved, up to 1.5 exaggerated. */
  intensity: number;
  effect: StepEffect;
}

export interface BlinkSettings {
  enabled: boolean;
  initialDelayMs: number;
  minIntervalMs: number;
  maxIntervalMs: number;
  durationMs: number;
  /** Eye height at the moment the eye is shut, in face units. */
  closedHeight: number;
  /** Chance (0 to 1) that a blink comes as a quick pair. */
  doubleChance: number;
}

export interface NetraAnimation {
  label: string;
  description: string;
  /** Where the bot uses it, e.g. "Ask BimaNetra" - for the studio's grouping only. */
  group: string;
  kind: AnimationKind;
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
  schemaVersion: 2;
  /** Which revision of the built-in presets this design has been offered (see lib/netrabot/migrate.ts). */
  presetRevision: number;
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

/** How much of the bot is there this frame, applied to the whole drawing. */
export interface BotPresenceFrame {
  /** SVG transform for lift, size and squash; "" at rest. */
  transform: string;
  opacity: number;
  /** Soft focus in face units. */
  blur: number;
  /** 0 = solid, 1 = fully dithered away. */
  dissolve: number;
  /** Clipped at the floor line. */
  grounded: boolean;
  /** The floor line, view-box units (SVG y runs down). */
  floorY: number;
}

export interface BotFrame {
  /** One layer per shading band, darkest first. */
  layers: BotLayer[];
  eyeColor: string;
  /** Left eye, right eye, nose. */
  features: [BotFeatureFrame, BotFeatureFrame, BotFeatureFrame];
  presence: BotPresenceFrame;
}

export interface BotViewBox {
  x: number;
  y: number;
  size: number;
}
