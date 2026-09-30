/** Every word the NetraBot studio shows, in one place. */

import type { AnimationKind } from "@/types/netrabot";

export const LAB_TABS = [
  { id: "library", label: "Library" },
  { id: "pose", label: "Pose" },
  { id: "expressions", label: "Expressions" },
  { id: "animations", label: "Animations" },
  { id: "export", label: "Export" },
] as const;

/** Pixel sizes the stage previews the bot at: the real places it will live. */
export const PREVIEW_SIZES = [16, 24, 32, 48, 72] as const;

export type LabTabId = (typeof LAB_TABS)[number]["id"];

export const KIND_LABELS: Record<AnimationKind, string> = {
  loop: "Moods",
  reaction: "Reactions",
  enter: "Appear",
  exit: "Disappear",
};

export const LAB_COPY = {
  title: "NetraBot studio",
  subtitle:
    "Pick a face or an animation from the library, shape your own, and preview how the assistant appears and disappears. Everything here is saved in this browser.",
  header: {
    undo: "Undo",
    redo: "Redo",
    advanced: "Advanced controls",
    shortcuts: "Space pause · R restart · A appear · D disappear · ⌘Z undo",
  },
  stage: {
    livePose: "Live pose",
    trying: "Trying",
    expressionPrefix: "Expression",
    hidden: "Hidden",
    play: "Play",
    pause: "Pause",
    restart: "Restart",
    speed: "Playback speed",
    background: "Stage",
    light: "Light",
    dark: "Dark",
    sizes: "At real sizes",
    followToggle: "Follow mouse",
    followWithin: "Follow within",
    followStage: "Stage",
    followPage: "Page",
    appear: "Appear",
    disappear: "Disappear",
    appearWith: "Appear with",
    disappearWith: "Disappear with",
    loopReveal: "Keep repeating",
    reaction: "Reaction",
    playReaction: "Play",
    dragHint: "Drag the bot to turn its head, or an eye to move it. Shift-drag tilts.",
  },
  library: {
    intro: "Every face and animation, ready to use. Hover to preview, click to put it on the stage.",
    faces: "Faces",
    animations: "Animations",
    search: "Search the library",
    searchPlaceholder: "Search, e.g. happy, peek, nod",
    all: "All",
    edit: "Edit",
    copyCode: "Copy code",
    copied: "Copied",
    empty: "Nothing matches that. Try another word.",
  },
  pose: {
    intro: "Drag the pads for a quick face, or fine-tune any part below. Moving anything pauses the animation so you can shape the face directly.",
    moodPad: "Emotion pad",
    moodHint: "Across is mood, up is energy. The face blends the nearest presets.",
    intensity: "Intensity",
    lookPad: "Look",
    lookHint: "Where the head points.",
    mirror: "Mirror",
    surprise: "Surprise me",
    fineTune: "Fine-tune",
    holdFrame: "Hold this frame",
    backToAnimation: "Back to the animation",
    saveAsExpression: "Save as expression",
    reset: "Reset to neutral",
    newExpressionName: "New expression",
    eyes: "Edit",
    both: "Both",
    left: "Left",
    right: "Right",
    axes: { unhappy: "Unhappy", happy: "Happy", calm: "Calm", excited: "Excited", left: "Left", right: "Right", up: "Up", down: "Down" },
  },
  expressions: {
    intro: "Saved faces. Animations are built from these.",
    add: "Duplicate as new",
    remove: "Delete",
    name: "Name",
    category: "Category",
    onPad: "On the emotion pad",
    mood: "Mood",
    energy: "Energy",
    previewIntensity: "Preview intensity",
    copySuffix: "copy",
  },
  animations: {
    intro: "A sequence of expressions with timing, easing and blinking.",
    add: "New animation",
    duplicate: "Duplicate",
    remove: "Delete",
    name: "Name",
    group: "Used in",
    description: "Notes",
    steps: "Steps",
    addStep: "Add a step",
    expression: "Expression",
    moveUp: "Move up",
    moveDown: "Move down",
    removeStep: "Remove step",
    stepLabel: "Step",
    newName: "New animation",
    copySuffix: "copy",
    timeline: "Timeline",
    timelineHint: "Click to jump there. Drag a step's right edge to change its hold, or the small mark inside it to change its travel.",
    total: "One run",
    returning: "On the way back",
  },
  exportPanel: {
    intro: "The whole design as one JSON file. Import it to restore or share a version.",
    copy: "Copy JSON",
    copied: "Copied",
    download: "Download",
    import: "Import JSON",
    importHint: "Paste a NetraBot JSON file here",
    apply: "Apply import",
    reset: "Reset to the starter design",
    confirmReset: "Reset everything? Your edits will be lost.",
    usage: "Use it in the app",
    copyBlocked: "Copy was blocked by the browser. Use Download instead.",
  },
  body: {
    outline: "Outline (SVG path)",
    outlineHint: "Absolute M, L, H, V, C and Z commands, the way Figma exports a flat vector. It is scaled to the width and height above.",
  },
  colour: { useDefault: "Use default", override: "Override" },
  reset: "Reset",
  resetLabel: (label: string) => `Reset ${label.toLowerCase()}`,
  fileName: "netrabot.json",
  usageSnippets: [
    '<NetraBot state="thinking" size={24} />',
    '<NetraBot expression="sceptical" size={48} />',
    '<NetraBot visible={open} enter="blurRise" exit="ditherOut" onExited={…} />',
    'botRef.current?.react("nodYes")',
  ],
} as const;

/** The line of code that uses a face or an animation, for "Copy code". */
export function codeFor(kind: AnimationKind | "face", key: string): string {
  if (kind === "face") return `<NetraBot expression="${key}" />`;
  if (kind === "loop") return `<NetraBot state="${key}" />`;
  if (kind === "reaction") return `botRef.current?.react("${key}")`;
  if (kind === "enter") return `<NetraBot visible={open} enter="${key}" />`;
  return `<NetraBot visible={open} exit="${key}" />`;
}
