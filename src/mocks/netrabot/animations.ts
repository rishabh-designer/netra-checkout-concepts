import type { NetraAnimation } from "@/types/netrabot";
import { BLINK, animation, cut, step } from "./shared";

/*
 * NetraBot preset animations, in four kinds:
 *   loop      resting states: <NetraBot state="thinking" />
 *   reaction  play once, then back to the state: bot.react("nod")
 *   enter     how it appears: <NetraBot visible enter="blurRise" />
 *   exit      how it disappears: <NetraBot visible={false} exit="ditherOut" />
 * Appear and disappear use the presence faces (hidden, dissolved, below the
 * floor, edge-on...), so they tween like any other step.
 *
 * The first six keys are the original starter animations, kept as they were.
 */

const SPARKS = { effect: "sparks" } as const;
/** Short one-shots never blink part-way through. */
const NO_BLINK = { blink: { ...BLINK, enabled: false } };

export const ANIMATIONS: Record<string, NetraAnimation> = {
  /* Loops */
  idle: animation("Idle", "Every screen", "loop", "Looks around now and then. The default resting state.", [
    step("neutral", 2200, 0),
    step("glanceLeft", 1200, 500),
    step("neutral", 1800, 500),
    step("glanceRight", 1200, 500),
  ]),
  listening: animation("Listening", "Ask BimaNetra", "loop", "Leans in while the user types.", [
    step("listening", 2000, 450, "snappy", 0.3),
    step("neutral", 600, 400),
  ]),
  thinking: animation("Thinking", "Ask BimaNetra", "loop", "Glances up and away while the answer is prepared.", [
    step("thinking", 900, 450),
    step("thinkingAway", 900, 450),
  ]),
  answering: animation("Answering", "Ask BimaNetra", "loop", "A small nod while the answer streams in.", [
    step("answerUp", 500, 260, "snappy", 0.4),
    step("answerDown", 350, 260),
  ]),
  success: animation(
    "Success",
    "Checkout and payment",
    "reaction",
    "A bouncy smile that holds. Plays once.",
    [step("happy", 2400, 380, "spring", 0.6, SPARKS)]
  ),
  error: animation("Error", "Every screen", "reaction", "A quiet droop for when something goes wrong. Plays once.", [
    step("sad", 2400, 420),
  ]),
  reading: animation("Reading", "Documents", "loop", "Eyes run along the lines while a document is read.", [
    step("reading", 4000, 400),
  ]),
  searching: animation("Searching", "Ask BimaNetra", "loop", "Looks all around, quickly, while it hunts for something.", [
    step("glanceLeft", 500, 300),
    step("lookUp", 400, 300),
    step("glanceRight", 500, 300),
    step("lookDown", 400, 300),
  ]),
  waiting: animation(
    "Waiting",
    "Every screen",
    "loop",
    "Patient and calm, with the odd look to the side.",
    [step("calm", 2500, 500), step("glanceRight", 800, 500), step("calm", 2000, 500)],
    { blink: { ...BLINK, minIntervalMs: 3500, maxIntervalMs: 6000, doubleChance: 0.2 } }
  ),
  workingHard: animation("Working hard", "Quotes", "loop", "Deep focus, with a thought now and then. For long jobs.", [
    step("focused", 1400, 300),
    step("thinkingAway", 900, 400),
    step("focused", 1200, 400),
  ]),
  sleeping: animation(
    "Sleeping",
    "Every screen",
    "loop",
    "Eyes shut, breathing slowly. For when nothing is happening.",
    [step("asleep", 4000, 600)],
    { blink: { ...BLINK, enabled: false } }
  ),
  happyIdle: animation("Happy idle", "Every screen", "loop", "A contented resting state after something went well.", [
    step("content", 2000, 500),
    step("happy", 1200, 500),
    step("content", 1600, 500),
    step("joyful", 900, 400, "snappy", 0.3, { intensity: 0.6 }),
  ]),

  /* Reactions */
  nodYes: animation("Nod yes", "Reactions", "reaction", "Two small nods: yes, got it.", [
    step("lookDown", 0, 170, "smooth", 0.3, { intensity: 0.8 }),
    step("lookUp", 0, 170, "smooth", 0.3, { intensity: 0.6 }),
    step("lookDown", 0, 170, "smooth", 0.3, { intensity: 0.8 }),
    step("neutral", 200, 260, "spring", 0.2),
  ]),
  shakeNo: animation("Shake no", "Reactions", "reaction", "A quick shake of the head.", [
    step("glanceLeft", 0, 150, "smooth", 0.3, { intensity: 1.3 }),
    step("glanceRight", 0, 170, "smooth", 0.3, { intensity: 1.3 }),
    step("glanceLeft", 0, 170, "smooth", 0.3, { intensity: 1.1 }),
    step("neutral", 200, 240, "spring", 0.2),
  ]),
  doubleTake: animation("Double take", "Reactions", "reaction", "Looks away, then snaps back in surprise.", [
    step("glanceRight", 250, 220),
    step("neutral", 120, 120),
    step("surprised", 500, 160, "snappy", 0.4),
    step("neutral", 200, 400),
  ]),
  laugh: animation("Laugh", "Reactions", "reaction", "A bouncing laugh that settles into a smile.", [
    step("laughing", 900, 200, "snappy", 0.3),
    step("happy", 300, 400),
  ]),
  celebrate: animation("Celebrate", "Checkout and payment", "reaction", "Crouches, jumps for joy with sparks, lands smiling.", [
    step("squashed", 40, 140, "decelerate"),
    step("celebrating", 80, 220, "decelerate", 0.3, SPARKS),
    step("squashed", 40, 200, "accelerate"),
    step("joyful", 700, 320, "spring", 0.4),
  ]),
  oops: animation("Oops", "Reactions", "reaction", "A small start, then a sheepish look.", [
    step("startled", 200, 120, "snappy", 0.3),
    step("embarrassed", 700, 300),
    step("neutral", 200, 400),
  ]),
  sighOfRelief: animation("Sigh of relief", "Reactions", "reaction", "Looks up, then lets it all out and settles.", [
    step("lookUp", 200, 300),
    step("relieved", 900, 700),
    step("neutral", 200, 500),
  ]),
  shiver: animation("Shiver", "Reactions", "reaction", "A scared tremble that passes.", [
    step("scared", 900, 200),
    step("neutral", 200, 400),
  ]),
  winkReaction: animation("Wink", "Reactions", "reaction", "A quick, friendly wink.", [
    step("wink", 500, 140, "snappy", 0.3),
    step("neutral", 200, 260),
  ]),
  shrug: animation("Shrug", "Reactions", "reaction", "Eyes up, head to one side: not sure.", [
    step("shrugging", 500, 220, "snappy", 0.3),
    step("neutral", 200, 300),
  ]),
  confusedTilt: animation("Confused tilt", "Reactions", "reaction", "Tilts its head, puzzled.", [
    step("confused", 900, 300),
    step("neutral", 200, 400),
  ]),
  curiousTilt: animation("Curious tilt", "Reactions", "reaction", "Tilts its head with interest: what's in here?", [
    step("curious", 900, 300),
    step("neutral", 200, 400),
  ]),
  curiousPeek: animation("Curious peek", "Reactions", "reaction", "Glances down, then leans in, keen to see more.", [
    step("lookDown", 300, 220),
    step("curious", 700, 260, "snappy", 0.3),
    step("neutral", 200, 400),
  ]),
  softSmile: animation("Soft smile", "Reactions", "reaction", "A small, pleased smile: there it is.", [
    step("content", 500, 240),
    step("neutral", 200, 360),
  ]),
  tuckAway: animation("Tuck away", "Reactions", "reaction", "A quick glance down as something is put away.", [
    step("lookDown", 300, 200),
    step("neutral", 200, 300),
  ]),
  hmm: animation("Hmm", "Reactions", "reaction", "One eye narrows: not convinced.", [
    step("sceptical", 1000, 300),
    step("neutral", 200, 400),
  ]),
  shyLookAway: animation("Shy look-away", "Reactions", "reaction", "Looks down and away, then back.", [
    step("shy", 900, 400),
    step("neutral", 200, 500),
  ]),
  thankYouBow: animation("Thank-you bow", "Reactions", "reaction", "A small, grateful bow.", [
    step("grateful", 700, 380),
    step("neutral", 200, 420),
  ]),
  helloHop: animation("Hello hop", "Reactions", "reaction", "A little hop and a smile to say hello.", [
    step("squashed", 40, 120, "decelerate"),
    step("celebrating", 60, 200, "decelerate", 0.3, { intensity: 0.7 }),
    step("squashed", 30, 180, "accelerate", 0.3, { intensity: 0.6 }),
    step("happy", 600, 300, "spring", 0.35),
    step("neutral", 200, 400),
  ]),
  goodbye: animation("Goodbye", "Reactions", "reaction", "A warm smile that softens before it goes.", [
    step("happy", 500, 300),
    step("content", 500, 400),
    step("neutral", 200, 400),
  ]),
  dizzySpin: animation("Dizzy spin", "Reactions", "reaction", "Eyes roll around after something long.", [
    step("dizzy", 1500, 400),
    step("neutral", 200, 600),
  ]),
  aha: animation("Aha!", "Ask BimaNetra", "reaction", "Thinks, has an idea (sparks), lights up.", [
    step("thinking", 600, 300),
    step("surprised", 250, 140, "snappy", 0.4, SPARKS),
    step("joyful", 700, 300, "spring", 0.35),
    step("neutral", 200, 400),
  ]),
  headsUp: animation("Heads up", "Every screen", "reaction", "Snaps to attention for a warning.", [
    step("alert", 900, 200, "snappy", 0.35),
    step("neutral", 200, 400),
  ]),
  sorry: animation("Sorry", "Every screen", "reaction", "An apologetic tilt that lingers.", [
    step("apologetic", 1200, 400),
    step("neutral", 200, 500),
  ]),

  /* Appear */
  blurRise: animation("Blur rise", "Appear", "enter", "Rises into focus, like the Upgraded banner, then opens its eyes.", [
    cut("hidden"),
    step("eyesShut", 80, 560, "decelerate"),
    step("neutral", 100, 240, "snappy", 0.3),
  ], NO_BLINK),
  ditherBuild: animation("Dither build", "Appear", "enter", "Builds up cell by cell, like a print developing.", [
    cut("dissolved"),
    step("neutral", 100, 900, "linear"),
  ], NO_BLINK),
  sparkPop: animation("Spark pop", "Appear", "enter", "Pops in with a burst of ikkat sparks.", [
    cut("dot"),
    step("puffed", 0, 260, "snappy", 0.5, SPARKS),
    step("neutral", 100, 320, "spring", 0.4),
  ], NO_BLINK),
  wakeUp: animation("Wake up", "Appear", "enter", "Fades in asleep, blinks awake and stretches.", [
    cut("hidden"),
    step("asleep", 500, 600, "decelerate"),
    step("sleepy", 250, 380),
    step("eyesShut", 0, 120, "linear"),
    step("stretched", 60, 260, "snappy", 0.3),
    step("neutral", 100, 420, "spring", 0.3),
  ], NO_BLINK),
  peekUp: animation("Peek up", "Appear", "enter", "Peeks over the floor, looks around, then pops up.", [
    cut("belowFloor"),
    step("peeking", 600, 520, "decelerate"),
    step("neutral", 100, 520, "spring", 0.35),
  ], NO_BLINK),
  dropIn: animation("Drop in", "Appear", "enter", "Falls from above and squashes as it lands.", [
    cut("above"),
    step("squashed", 0, 420, "accelerate"),
    step("neutral", 100, 480, "spring", 0.45),
  ], NO_BLINK),
  coinFlipIn: animation("Coin flip in", "Appear", "enter", "Turns in from edge-on, showing the slab.", [
    cut("edgeOn"),
    step("neutral", 100, 700, "spring", 0.25),
  ], NO_BLINK),
  zoomIn: animation("Zoom in", "Appear", "enter", "Grows from a dot, with a little overshoot.", [
    cut("dot"),
    step("neutral", 100, 620, "spring", 0.3),
  ], NO_BLINK),
  unfold: animation("Unfold", "Appear", "enter", "Starts as a line, then unfolds to full height.", [
    cut("hidden"),
    step("flatLine", 0, 200, "decelerate"),
    step("stretched", 0, 240, "decelerate"),
    step("neutral", 100, 440, "spring", 0.35),
  ], NO_BLINK),
  glitchIn: animation("Glitch in", "Appear", "enter", "Flickers in through a couple of broken frames.", [
    cut("dissolved"),
    step("glitched", 40, 60, "linear"),
    cut("dissolved", 50),
    cut("glitched", 70),
    step("neutral", 100, 90, "linear"),
  ], NO_BLINK),

  /* Disappear */
  blurAway: animation("Blur away", "Disappear", "exit", "Lifts and softens out of focus, like the banner leaving.", [
    step("fadedBlur", 0, 420, "accelerate"),
  ], NO_BLINK),
  ditherOut: animation("Dither out", "Disappear", "exit", "Breaks up into dither cells until nothing is left.", [
    step("dissolved", 0, 700, "linear"),
  ], NO_BLINK),
  poof: animation("Poof", "Disappear", "exit", "Puffs up, sparks, and is gone.", [
    step("puffed", 0, 140, "snappy", 0.3, SPARKS),
    step("dot", 0, 200, "accelerate"),
  ], NO_BLINK),
  fallAsleep: animation("Fall asleep", "Disappear", "exit", "Gets drowsy, closes its eyes and sinks away.", [
    step("sleepy", 400, 500),
    step("asleep", 500, 600),
    step("hidden", 0, 600, "accelerate"),
  ], NO_BLINK),
  duckDown: animation("Duck down", "Disappear", "exit", "Crouches and ducks below the floor.", [
    step("squashed", 40, 140, "decelerate"),
    step("belowFloor", 0, 320, "accelerate"),
  ], NO_BLINK),
  flyUp: animation("Fly up", "Disappear", "exit", "Crouches, springs and flies up out of view.", [
    step("squashed", 60, 160, "decelerate"),
    step("stretched", 0, 100, "accelerate"),
    step("flownAway", 0, 380, "accelerate"),
  ], NO_BLINK),
  coinFlipOut: animation("Coin flip out", "Disappear", "exit", "Turns away to edge-on and vanishes.", [
    step("edgeOnRight", 0, 520, "accelerate"),
  ], NO_BLINK),
  shrinkAway: animation("Shrink away", "Disappear", "exit", "Shrinks to a dot and is gone.", [
    step("dot", 0, 420, "anticipate", 0.2),
  ], NO_BLINK),
  winkOut: animation("Wink out", "Disappear", "exit", "Winks, puffs and pops out.", [
    step("wink", 260, 160, "snappy", 0.3),
    step("puffed", 0, 120, "snappy", 0.3),
    step("dot", 0, 200, "accelerate"),
  ], NO_BLINK),
  glitchOut: animation("Glitch out", "Disappear", "exit", "Flickers through broken frames and cuts out.", [
    cut("glitched", 60),
    cut("neutral", 50),
    cut("glitched", 60),
    step("dissolved", 0, 120, "linear"),
  ], NO_BLINK),
};

export const ANIMATION_ORDER = Object.keys(ANIMATIONS);
