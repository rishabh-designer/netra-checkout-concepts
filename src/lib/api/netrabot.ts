import { mockNetraBotDefinition } from "@/mocks/netrabot";
import type { BotDefinition } from "@/types/netrabot";

/**
 * The NetraBot definition (body, expressions, animations). Swap the internals
 * of this one function when the design is served from a real backend or CMS.
 */
export async function getNetraBotDefinition(): Promise<BotDefinition> {
  return structuredClone(mockNetraBotDefinition);
}

/** Same data, synchronously, for first paint (the studio's reset button, tests). */
export function getDefaultNetraBotDefinition(): BotDefinition {
  return structuredClone(mockNetraBotDefinition);
}
