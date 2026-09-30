/** Every word the NetraBot studio shows, in one place. */

export const LAB_TABS = [
  { id: "pose", label: "Pose" },
  { id: "expressions", label: "Expressions" },
  { id: "animations", label: "Animations" },
  { id: "export", label: "Export" },
] as const;

/** Pixel sizes the stage previews the bot at: the real places it will live. */
export const PREVIEW_SIZES = [16, 24, 32, 48, 72] as const;

export type LabTabId = (typeof LAB_TABS)[number]["id"];

export const LAB_COPY = {
  title: "NetraBot studio",
  subtitle: "Design the assistant's body, faces and moods. Everything here is saved in this browser.",
  stage: {
    livePose: "Live pose",
    expressionPrefix: "Expression",
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
  },
  pose: {
    intro: "Move anything and the animation pauses so you can shape a face directly.",
    linkEyes: "Link the eyes",
    holdFrame: "Hold this frame",
    backToAnimation: "Back to the animation",
    saveAsExpression: "Save as expression",
    reset: "Reset to neutral",
    newExpressionName: "New expression",
  },
  expressions: {
    intro: "Saved faces. Animations are built from these.",
    add: "Duplicate as new",
    remove: "Delete",
    name: "Name",
    linkEyes: "Link the eyes",
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
  fileName: "netrabot.json",
  usageSnippet: '<NetraBot state="thinking" size={24} />',
} as const;
