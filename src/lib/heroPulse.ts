/** What the lead form just did, for the hero mark to react to. */
export type HeroPulse = "typing" | "submit";

const listeners = new Set<(pulse: HeroPulse) => void>();

/**
 * heroPulse — a tiny pub/sub between the lead form and the Focus hero's
 * product mark: the form emits, the mark glows. Emitting with no listener
 * (e.g. the classic hero) is a no-op.
 * Usage: emitHeroPulse("typing");  const off = onHeroPulse((p) => …); off();
 */
export function emitHeroPulse(pulse: HeroPulse) {
  listeners.forEach((fn) => fn(pulse));
}

export function onHeroPulse(fn: (pulse: HeroPulse) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
