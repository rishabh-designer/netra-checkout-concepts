/**
 * NetraBot studio control spec. One list drives every slider, pill group,
 * colour swatch and toggle in the studio, so a new Expression / Animation /
 * Body field becomes a control by adding one entry here. `advanced` controls
 * (and sections) only show with the studio's Advanced switch on; `hint` is a
 * one-line tooltip on the label.
 */

export interface ChoiceOption {
  value: string;
  label: string;
}

interface ControlBase {
  id: string;
  label: string;
  /** Dot path into the edited object, e.g. "left.width" or "blink.enabled". An "eye." path edits the eye chosen with Both / Left / Right. */
  path: string;
  advanced?: boolean;
  hint?: string;
}

export type Control =
  | (ControlBase & { kind: "number"; min: number; max: number; step: number; unit?: string })
  | (ControlBase & { kind: "choice"; options: ChoiceOption[] })
  | (ControlBase & { kind: "color"; optional?: boolean })
  | (ControlBase & { kind: "toggle"; numeric?: boolean });

export interface ControlSection {
  id: string;
  title: string;
  controls: Control[];
  advanced?: boolean;
  /** Starts closed. */
  collapsed?: boolean;
  /** Edits one eye at a time, or both mirrored (the Both / Left / Right switch). */
  eyes?: boolean;
}

type NumberOptions = { unit?: string; advanced?: boolean; hint?: string };

const num = (
  id: string,
  label: string,
  path: string,
  min: number,
  max: number,
  step: number,
  options: NumberOptions | string = {}
): Control => {
  const { unit, advanced, hint } = typeof options === "string" ? { unit: options } : options;
  return { kind: "number", id, label, path, min, max, step, unit, advanced, hint };
};

export const EYE_MOTION_OPTIONS: ChoiceOption[] = [
  { value: "none", label: "Still" },
  { value: "microSaccades", label: "Darting" },
  { value: "scan", label: "Reading" },
  { value: "roll", label: "Rolling" },
  { value: "shake", label: "Shake" },
];

export const BODY_MOTION_OPTIONS: ChoiceOption[] = [
  { value: "none", label: "Still" },
  { value: "slowDrift", label: "Drift" },
  { value: "breathe", label: "Breathe" },
  { value: "bob", label: "Bob" },
  { value: "nod", label: "Nod" },
  { value: "sway", label: "Sway" },
  { value: "tremble", label: "Tremble" },
  { value: "shake", label: "Shake" },
];

export const EASING_OPTIONS: ChoiceOption[] = [
  { value: "smooth", label: "Smooth" },
  { value: "decelerate", label: "Ease out" },
  { value: "accelerate", label: "Ease in" },
  { value: "linear", label: "Linear" },
  { value: "snappy", label: "Snappy" },
  { value: "spring", label: "Spring" },
  { value: "anticipate", label: "Wind-up" },
];

export const PLAYBACK_OPTIONS: ChoiceOption[] = [
  { value: "loop", label: "Loop" },
  { value: "once", label: "Once" },
  { value: "pingPong", label: "Ping-pong" },
];

export const ANIMATION_KIND_OPTIONS: ChoiceOption[] = [
  { value: "loop", label: "Mood" },
  { value: "reaction", label: "Reaction" },
  { value: "enter", label: "Appear" },
  { value: "exit", label: "Disappear" },
];

export const EFFECT_OPTIONS: ChoiceOption[] = [
  { value: "none", label: "None" },
  { value: "sparks", label: "Sparks" },
];

export const CATEGORY_OPTIONS: ChoiceOption[] = [
  { value: "everyday", label: "Everyday" },
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "angry", label: "Angry" },
  { value: "fear", label: "Fear" },
  { value: "surprise", label: "Surprise" },
  { value: "thinking", label: "Thinking" },
  { value: "social", label: "Social" },
  { value: "energy", label: "Energy" },
  { value: "presence", label: "Presence" },
  { value: "mine", label: "Mine" },
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
      num("perspective", "Perspective", "perspective", 0, 1, 0.01, {
        advanced: true,
        hint: "How strongly the body foreshortens as it turns.",
      }),
    ],
  },
  {
    id: "eyes",
    title: "Eyes",
    eyes: true,
    controls: [
      num("eye-width", "Width", "eye.width", 4, 80, 1, "px"),
      num("eye-height", "Height", "eye.height", 2, 100, 1, { unit: "px", hint: "Low and wide reads as a squint; 4px is shut." }),
      num("eye-x", "Across", "eye.x", -40, 40, 1, "px"),
      num("eye-y", "Up and down", "eye.y", -40, 40, 1, "px"),
      num("eye-angle", "Tilt", "eye.angle", -60, 60, 1, {
        unit: "°",
        hint: "With both eyes: inner corners up looks worried, down looks cross.",
      }),
      num("eye-bend", "Bend", "eye.bend", -1, 1, 0.01, {
        hint: "Curves the eye. Thin and wide with a bend up reads as a smile (^ ^); a bend down looks peaceful.",
      }),
      num("eye-taper", "Taper", "eye.taper", -1, 1, 0.01, { advanced: true, hint: "Widens the top and narrows the bottom, or the reverse." }),
      num("eye-skew", "Lean", "eye.skew", -1, 1, 0.01, { advanced: true, hint: "Leans the top of the eye sideways." }),
      num("spacing", "Spacing", "spacing", 20, 140, 1, { unit: "px", hint: "Distance between the eyes, for both." }),
      num("eyeRoundness", "Roundness", "eyeRoundness", 0, 1, 0.01, { hint: "Square corners to fully round, for both eyes." }),
    ],
  },
  {
    id: "nose",
    title: "Nose",
    controls: [
      num("nose-height", "Length", "nose.height", 0, 120, 1, { unit: "px", hint: "0 hides the nose." }),
      num("nose-y", "Up and down", "nose.y", -40, 40, 0.5, "px"),
      num("nose-angle", "Tilt", "nose.angle", -60, 60, 1, "°"),
      num("nose-bend", "Bend", "nose.bend", -1, 1, 0.01, { hint: "Bows the line to one side: a little goes a long way." }),
      num("nose-width", "Thickness", "nose.width", 0, 30, 0.5, { unit: "px", advanced: true }),
      num("nose-x", "Across", "nose.x", -40, 40, 0.5, { unit: "px", advanced: true }),
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
      num("motionSpeed", "Speed", "motionSpeed", 0.25, 3, 0.05, { unit: "x", advanced: true }),
    ],
  },
  {
    id: "squash",
    title: "Squash and stretch",
    collapsed: true,
    controls: [
      num("squashX", "Width", "squashX", 0.3, 1.7, 0.01, { unit: "x", hint: "Squashes about the bottom edge, like landing." }),
      num("squashY", "Height", "squashY", 0.3, 1.7, 0.01, { unit: "x", hint: "Below 1 crouches, above 1 stretches up." }),
    ],
  },
  {
    id: "presence",
    title: "Presence",
    advanced: true,
    collapsed: true,
    controls: [
      num("opacity", "Opacity", "opacity", 0, 1, 0.01),
      num("scale", "Size", "scale", 0, 2, 0.01, "x"),
      num("lift", "Lift", "lift", -300, 300, 1, { unit: "px", hint: "Rises above (or sinks below) the resting spot." }),
      num("blur", "Blur", "blur", 0, 20, 0.5, "px"),
      num("dissolve", "Dissolve", "dissolve", 0, 1, 0.01, { hint: "Breaks the bot into dither cells. 1 is gone." }),
      { kind: "toggle", id: "ground", label: "Clip at the floor", path: "ground", numeric: true, hint: "Hides anything below the resting line, for peeking and ducking." },
    ],
  },
  {
    id: "colour",
    title: "Colour",
    collapsed: true,
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
  collapsed: true,
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
  collapsed: true,
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
  collapsed: true,
  controls: [
    { kind: "toggle", id: "blink-enabled", label: "Blink", path: "blink.enabled" },
    num("blink-initial", "First blink after", "blink.initialDelayMs", 0, 6000, 50, "ms"),
    num("blink-min", "Shortest gap", "blink.minIntervalMs", 300, 10000, 50, "ms"),
    num("blink-max", "Longest gap", "blink.maxIntervalMs", 300, 12000, 50, "ms"),
    num("blink-duration", "Blink length", "blink.durationMs", 80, 800, 10, "ms"),
    num("blink-closed", "Shut height", "blink.closedHeight", 0, 20, 1, "px"),
    num("blink-double", "Double blinks", "blink.doubleChance", 0, 1, 0.05, { hint: "How often a blink comes as a quick pair." }),
  ],
};

export const KIND_CONTROL: Control = {
  kind: "choice",
  id: "kind",
  label: "Kind",
  path: "kind",
  options: ANIMATION_KIND_OPTIONS,
  hint: "Moods rest and repeat, reactions play once and return, appear and disappear run when the bot shows or hides.",
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
  num("transition", "Travel", "transitionMs", 0, 3000, 10, { unit: "ms", hint: "Time to move into this face. 0 cuts straight to it." }),
  { kind: "choice", id: "easing", label: "Easing", path: "easing", options: EASING_OPTIONS },
  num("bounce", "Bounce", "bounce", 0, 1, 0.05, { hint: "Overshoot for Snappy and Spring; how far Wind-up pulls back." }),
  num("intensity", "Intensity", "intensity", 0, 1.5, 0.05, { unit: "x", hint: "0 is neutral, 1 the face as saved, above 1 exaggerated." }),
  { kind: "choice", id: "effect", label: "Effect", path: "effect", options: EFFECT_OPTIONS, hint: "Fired as this step begins." },
];
