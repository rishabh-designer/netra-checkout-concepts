import type { BotDefinition } from "@/types/netrabot";
import { ANIMATIONS, ANIMATION_ORDER } from "./animations";
import { EXPRESSIONS, EXPRESSION_ORDER } from "./expressions";
import { IKKAT_OUTLINE } from "./shared";

/*
 * NetraBot starter definition: the body, the preset faces (expressions.ts)
 * and the preset animations (animations.ts). The body is one object
 * (`body`): change its outline, size or fill here and the whole bot follows.
 * Colours are the brand purple and the card white.
 *
 * Bump `presetRevision` when presets are added, so designs saved in a
 * browser are offered the new ones once (lib/netrabot/migrate.ts).
 */
export const mockNetraBotDefinition: BotDefinition = {
  schema: "bimanetra/netrabot",
  schemaVersion: 2,
  presetRevision: 2,
  name: "NetraBot",
  body: { surface: "outline", outline: IKKAT_OUTLINE, width: 260, height: 177.6, depth: 72, bevel: 16, color: "#4100cf" },
  eyeColor: "#ffffff",
  gaze: { headYaw: 22, headPitch: 14, faceShift: 10, smoothingMs: 140 },
  expressionOrder: EXPRESSION_ORDER,
  expressions: EXPRESSIONS,
  animationOrder: ANIMATION_ORDER,
  animations: ANIMATIONS,
};
