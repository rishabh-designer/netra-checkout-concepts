import type {
  AnimationStep,
  BlinkSettings,
  BotDefinition,
  EyeGeometry,
  Expression,
  NamedExpression,
  NetraAnimation,
  StepEasing,
} from "@/types/netrabot";

/*
 * NetraBot starter definition: the ikkat shape from Figma (node 757:42195,
 * drawn at 100x) with its two square eyes and nose line. Everything below is
 * the Figma frame scaled by 0.444, so the body is 260 wide and a face
 * measurement here is that Figma measurement x 0.444:
 *   eyes   78.2px squares, 25px corners (roundness 0.64), 100px apart
 *   nose   10px line, 119.6px long, between the eyes
 *   face   sits 7px right of the shape's centre, as drawn
 * The body is one object (`body`): change its outline, size or fill here and
 * the whole bot follows. Colours are the brand purple and the card white.
 */

/** The ikkat outline, turned to its landscape orientation (absolute M L C Z). */
const IKKAT_OUTLINE =
  "M0.3679 1.5283C0.5711 1.5283 0.7358 1.3636 0.7358 1.1604L0.7358 1.1321C0.7358 0.9133 0.9132 0.7359 1.1321 0.7359L1.6887 0.7359C1.8919 0.7359 2.0566 0.5711 2.0566 0.3679C2.0566 0.1647 2.2213 0 2.4245 0L3.5755 0C3.7787 0 3.9434 0.1647 3.9434 0.3679C3.9434 0.5711 4.1081 0.7359 4.3113 0.7359L4.8738 0.7359C5.0927 0.7359 5.2701 0.9133 5.2701 1.1321L5.2701 1.2359C5.2701 1.3974 5.401 1.5283 5.5625 1.5283C5.724 1.5283 5.855 1.6592 5.855 1.8207L5.855 2.1792C5.855 2.3408 5.724 2.4717 5.5625 2.4717C5.401 2.4717 5.2701 2.6026 5.2701 2.7641L5.2701 2.8679C5.2701 3.0868 5.0927 3.2642 4.8738 3.2642L4.3113 3.2642C4.1081 3.2642 3.9434 3.4289 3.9434 3.6321C3.9434 3.8353 3.7787 4 3.5755 4L2.4245 4C2.2213 4 2.0566 3.8353 2.0566 3.6321C2.0566 3.4289 1.8919 3.2642 1.6887 3.2642L1.1321 3.2642C0.9132 3.2642 0.7358 3.0868 0.7358 2.8679L0.7358 2.8396C0.7358 2.6364 0.5711 2.4717 0.3679 2.4717C0.1647 2.4717 0 2.307 0 2.1038L0 1.8962C0 1.693 0.1647 1.5283 0.3679 1.5283Z";

/** Figma face, scaled. Offsets are from the face's resting spot. */
const FACE_SHIFT_X = 3.2;
const EYE_SIZE = 34.7;
const EYE_Y = 15.9;
const NOSE_X = 2.2;
const NOSE_Y = 6.8;
const NOSE_LENGTH = 53.1;
const NOSE_THICKNESS = 4.4;

const eye = (overrides: Partial<EyeGeometry> = {}): EyeGeometry => ({
  width: EYE_SIZE,
  height: EYE_SIZE,
  x: FACE_SHIFT_X,
  y: EYE_Y,
  angle: 0,
  ...overrides,
});

const nose = (overrides: Partial<EyeGeometry> = {}): EyeGeometry => ({
  width: NOSE_THICKNESS,
  height: NOSE_LENGTH,
  x: NOSE_X,
  y: NOSE_Y,
  angle: 0,
  ...overrides,
});

const NEUTRAL: Expression = {
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
};

const expression = (label: string, overrides: Partial<Expression> = {}): NamedExpression => ({
  label,
  values: { ...NEUTRAL, left: eye(), right: eye(), nose: nose(), ...overrides },
});

const step = (
  key: string,
  holdMs: number,
  transitionMs: number,
  easing: StepEasing = "smooth",
  bounce = 0.3
): AnimationStep => ({ expression: key, holdMs, transitionMs, easing, bounce });

const BLINK: BlinkSettings = {
  enabled: true,
  initialDelayMs: 1800,
  minIntervalMs: 2800,
  maxIntervalMs: 5000,
  durationMs: 260,
  closedHeight: 4,
};

const animation = (
  label: string,
  group: string,
  description: string,
  steps: AnimationStep[],
  overrides: Partial<NetraAnimation> = {}
): NetraAnimation => ({
  label,
  group,
  description,
  playbackMode: "loop",
  steps,
  blink: { ...BLINK },
  ...overrides,
});

export const mockNetraBotDefinition: BotDefinition = {
  schema: "bimanetra/netrabot",
  schemaVersion: 1,
  name: "NetraBot",
  body: { surface: "outline", outline: IKKAT_OUTLINE, width: 260, height: 177.6, depth: 72, bevel: 16, color: "#4100cf" },
  eyeColor: "#ffffff",
  gaze: { headYaw: 22, headPitch: 14, faceShift: 10, smoothingMs: 140 },
  expressionOrder: [
    "neutral",
    "glanceLeft",
    "glanceRight",
    "listening",
    "thinking",
    "thinkingAway",
    "answerUp",
    "answerDown",
    "happy",
    "surprised",
    "sad",
    "sleepy",
  ],
  expressions: {
    neutral: expression("Neutral"),
    glanceLeft: expression("Glance left", {
      yaw: -16,
      pitch: 2,
      left: eye({ x: -0.5 }),
      right: eye({ x: -0.5 }),
      nose: nose({ x: -1.5 }),
    }),
    glanceRight: expression("Glance right", {
      yaw: 16,
      pitch: 2,
      left: eye({ x: 6.5 }),
      right: eye({ x: 6.5 }),
      nose: nose({ x: 5.5 }),
    }),
    listening: expression("Listening", {
      roll: 7,
      yaw: 6,
      left: eye({ width: 36, height: 42, y: 18 }),
      right: eye({ width: 36, height: 42, y: 18 }),
    }),
    thinking: expression("Thinking", {
      yaw: 28,
      pitch: 14,
      left: eye({ width: 30, height: 30, y: 20 }),
      right: eye({ width: 26, height: 22, y: 22 }),
      nose: nose({ height: 44, y: 10 }),
      eyeMotion: "microSaccades",
      eyeMotionAmount: 1,
    }),
    thinkingAway: expression("Thinking, away", {
      yaw: -24,
      pitch: 12,
      left: eye({ width: 26, height: 22, y: 22 }),
      right: eye({ width: 30, height: 30, y: 20 }),
      nose: nose({ height: 44, y: 10 }),
      eyeMotion: "microSaccades",
      eyeMotionAmount: 1,
    }),
    answerUp: expression("Answering, up", {
      pitch: 9,
      left: eye({ height: 30, y: 18 }),
      right: eye({ height: 30, y: 18 }),
    }),
    answerDown: expression("Answering, down", {
      pitch: -5,
      left: eye({ height: 28, y: 12 }),
      right: eye({ height: 28, y: 12 }),
    }),
    happy: expression("Happy", {
      pitch: 10,
      roll: -4,
      eyeRoundness: 0.9,
      left: eye({ width: 40, height: 16, y: 20, angle: -12 }),
      right: eye({ width: 40, height: 16, y: 20, angle: 12 }),
      nose: nose({ height: 40, y: 8 }),
      bodyMotionAmount: 0.6,
    }),
    surprised: expression("Surprised", {
      pitch: 6,
      spacing: 88,
      left: eye({ width: 42, height: 46, y: 18 }),
      right: eye({ width: 42, height: 46, y: 18 }),
      nose: nose({ height: 46 }),
      eyeMotion: "none",
    }),
    sad: expression("Sad", {
      pitch: -12,
      left: eye({ width: 32, height: 26, y: 8, angle: 14 }),
      right: eye({ width: 32, height: 26, y: 8, angle: -14 }),
      nose: nose({ height: 40, y: 2 }),
      bodyMotionAmount: 0.15,
      eyeMotionAmount: 0.2,
    }),
    sleepy: expression("Sleepy", {
      pitch: -8,
      left: eye({ width: 38, height: 8, y: 10 }),
      right: eye({ width: 38, height: 8, y: 10 }),
      nose: nose({ height: 36, y: 4 }),
      eyeMotion: "none",
      bodyMotionAmount: 0.5,
    }),
  },
  animationOrder: ["idle", "listening", "thinking", "answering", "success", "error"],
  animations: {
    idle: animation("Idle", "Every screen", "Looks around now and then. The default resting state.", [
      step("neutral", 2200, 0),
      step("glanceLeft", 1200, 500),
      step("neutral", 1800, 500),
      step("glanceRight", 1200, 500),
    ]),
    listening: animation("Listening", "Ask BimaNetra", "Leans in while the user types.", [
      step("listening", 2000, 450, "snappy", 0.3),
      step("neutral", 600, 400),
    ]),
    thinking: animation("Thinking", "Ask BimaNetra", "Glances up and away while the answer is prepared.", [
      step("thinking", 900, 450),
      step("thinkingAway", 900, 450),
    ]),
    answering: animation("Answering", "Ask BimaNetra", "A small nod while the answer streams in.", [
      step("answerUp", 500, 260, "snappy", 0.4),
      step("answerDown", 350, 260),
    ]),
    success: animation(
      "Success",
      "Checkout and payment",
      "A bouncy smile that holds. Plays once.",
      [step("happy", 2400, 380, "spring", 0.6)],
      { playbackMode: "once" }
    ),
    error: animation(
      "Error",
      "Every screen",
      "A quiet droop for when something goes wrong. Plays once.",
      [step("sad", 2400, 420)],
      { playbackMode: "once" }
    ),
  },
};
