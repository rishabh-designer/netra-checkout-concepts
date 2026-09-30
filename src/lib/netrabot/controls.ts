/**
 * NetraBot studio control spec. One list drives every slider, pill group,
 * colour swatch and toggle in the studio, so a new Expression / Animation /
 * Body field becomes a control by adding one entry here.
 */

export interface ChoiceOption {
  value: string;
  label: string;
}

interface ControlBase {
  id: string;
  label: string;
  /** Dot path into the edited object, e.g. "left.width" or "blink.enabled". */
  path: string;
}

export type Control =
  | (ControlBase & { kind: "number"; min: number; max: number; step: number; unit?: string })
  | (ControlBase & { kind: "choice"; options: ChoiceOption[] })
  | (ControlBase & { kind: "color"; optional?: boolean })
  | (ControlBase & { kind: "toggle" });

export interface ControlSection {
  id: string;
  title: string;
  controls: Control[];
}

const num = (
  id: string,
  label: string,
  path: string,
  min: number,
  max: number,
  step: number,
  unit?: string
): Control => ({ kind: "number", id, label, path, min, max, step, unit });

const eyeControls = (side: "left" | "right"): Control[] => [
  num(`${side}-width`, "Width", `${side}.width`, 4, 80, 1, "px"),
  num(`${side}-height`, "Height", `${side}.height`, 2, 100, 1, "px"),
  num(`${side}-x`, "Across", `${side}.x`, -40, 40, 1, "px"),
  num(`${side}-y`, "Up and down", `${side}.y`, -40, 40, 1, "px"),
  num(`${side}-angle`, "Tilt", `${side}.angle`, -60, 60, 1, "°"),
];

export const EYE_MOTION_OPTIONS: ChoiceOption[] = [
  { value: "none", label: "Still" },
  { value: "microSaccades", label: "Darting" },
  { value: "shake", label: "Shake" },
];

export const BODY_MOTION_OPTIONS: ChoiceOption[] = [
  { value: "none", label: "Still" },
  { value: "slowDrift", label: "Drift" },
  { value: "shake", label: "Shake" },
];

export const EASING_OPTIONS: ChoiceOption[] = [
  { value: "smooth", label: "Smooth" },
  { value: "snappy", label: "Snappy" },
  { value: "spring", label: "Spring" },
];

export const PLAYBACK_OPTIONS: ChoiceOption[] = [
  { value: "loop", label: "Loop" },
  { value: "once", label: "Once" },
  { value: "pingPong", label: "Ping-pong" },
];

/** Everything an Expression can do. Used by both the Pose and Expressions panels. */
export const EXPRESSION_SECTIONS: ControlSection[] = [
  {
    id: "head",
    title: "Head",
    controls: [
      num("yaw", "Turn", "yaw", -90, 90, 1, "°"),
      num("pitch", "Nod", "pitch", -60, 60, 1, "°"),
      num("roll", "Tilt", "roll", -45, 45, 1, "°"),
      num("perspective", "Perspective", "perspective", 0, 1, 0.01),
    ],
  },
  {
    id: "eyes",
    title: "Both eyes",
    controls: [
      num("spacing", "Spacing", "spacing", 20, 140, 1, "px"),
      num("eyeRoundness", "Roundness", "eyeRoundness", 0, 1, 0.01),
    ],
  },
  { id: "left", title: "Left eye", controls: eyeControls("left") },
  { id: "right", title: "Right eye", controls: eyeControls("right") },
  {
    id: "nose",
    title: "Nose",
    controls: [
      num("nose-width", "Thickness", "nose.width", 0, 30, 0.5, "px"),
      num("nose-height", "Length", "nose.height", 0, 120, 1, "px"),
      num("nose-x", "Across", "nose.x", -40, 40, 0.5, "px"),
      num("nose-y", "Up and down", "nose.y", -40, 40, 0.5, "px"),
      num("nose-angle", "Tilt", "nose.angle", -60, 60, 1, "°"),
    ],
  },
  {
    id: "motion",
    title: "Ambient motion",
    controls: [
      { kind: "choice", id: "eyeMotion", label: "Eyes", path: "eyeMotion", options: EYE_MOTION_OPTIONS },
      num("eyeMotionAmount", "Eye amount", "eyeMotionAmount", 0, 2, 0.05),
      { kind: "choice", id: "bodyMotion", label: "Body", path: "bodyMotion", options: BODY_MOTION_OPTIONS },
      num("bodyMotionAmount", "Body amount", "bodyMotionAmount", 0, 2, 0.05),
      num("motionSpeed", "Speed", "motionSpeed", 0.25, 3, 0.05, "x"),
    ],
  },
  {
    id: "colour",
    title: "Colour",
    controls: [
      { kind: "color", id: "bodyColor", label: "Body", path: "bodyColor", optional: true },
      { kind: "color", id: "eyeColor", label: "Eyes", path: "eyeColor", optional: true },
    ],
  },
];

/** The body: one shape, editable as numbers and a fill. */
export const BODY_SECTION: ControlSection = {
  id: "body",
  title: "Body",
  controls: [
    num("body-width", "Width", "body.width", 100, 340, 1, "px"),
    num("body-height", "Height", "body.height", 60, 340, 1, "px"),
    num("body-depth", "Thickness", "body.depth", 10, 200, 1, "px"),
    num("body-bevel", "Edge radius", "body.bevel", 0, 40, 0.5, "px"),
    { kind: "color", id: "body-color", label: "Fill", path: "body.color" },
    { kind: "color", id: "eye-color", label: "Eyes and nose", path: "eyeColor" },
  ],
};

/** How the bot follows the pointer. A property of the design, not of one expression. */
export const GAZE_SECTION: ControlSection = {
  id: "gaze",
  title: "Pointer following",
  controls: [
    num("gaze-yaw", "Head turn", "gaze.headYaw", 0, 60, 1, "°"),
    num("gaze-pitch", "Head nod", "gaze.headPitch", 0, 45, 1, "°"),
    num("gaze-shift", "Face slide", "gaze.faceShift", 0, 40, 0.5, "px"),
    num("gaze-smoothing", "Smoothing", "gaze.smoothingMs", 0, 600, 10, "ms"),
  ],
};

export const BLINK_SECTION: ControlSection = {
  id: "blink",
  title: "Blinking",
  controls: [
    { kind: "toggle", id: "blink-enabled", label: "Blink", path: "blink.enabled" },
    num("blink-initial", "First blink after", "blink.initialDelayMs", 0, 6000, 50, "ms"),
    num("blink-min", "Shortest gap", "blink.minIntervalMs", 300, 10000, 50, "ms"),
    num("blink-max", "Longest gap", "blink.maxIntervalMs", 300, 12000, 50, "ms"),
    num("blink-duration", "Blink length", "blink.durationMs", 80, 800, 10, "ms"),
    num("blink-closed", "Shut height", "blink.closedHeight", 0, 20, 1, "px"),
  ],
};

export const PLAYBACK_CONTROL: Control = {
  kind: "choice",
  id: "playbackMode",
  label: "Playback",
  path: "playbackMode",
  options: PLAYBACK_OPTIONS,
};

/** Per-step controls, minus the expression picker (that one needs the live expression list). */
export const STEP_CONTROLS: Control[] = [
  num("hold", "Hold", "holdMs", 0, 8000, 50, "ms"),
  num("transition", "Travel", "transitionMs", 0, 3000, 10, "ms"),
  { kind: "choice", id: "easing", label: "Easing", path: "easing", options: EASING_OPTIONS },
  num("bounce", "Bounce", "bounce", 0, 1, 0.05),
];
