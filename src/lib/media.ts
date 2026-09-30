import { useSyncExternalStore } from "react";

/**
 * Breakpoints: the three tiers every layout switches at (RESPONSIVENESS.md,
 * section 2). The CSS uses the same widths in its @media blocks; keep them in
 * step. Everything is max-width, so "at or below".
 */
export const BREAKPOINT = {
  /** Layouts stack into one column: Quotes, checkout, success, Quote Requested. */
  stack: 1100,
  /** The phone block: mobile sizes, spacing and type. */
  mobile: 999,
  /** Popups become bottom sheets. */
  sheet: 900,
} as const;

export type Breakpoint = keyof typeof BREAKPOINT;

const query = (bp: Breakpoint) => `(max-width: ${BREAKPOINT[bp]}px)`;

/** At or below the breakpoint, read now (client only; false on the server).
 *  For a lazy initial state on client-only screens. */
export function isAtMost(bp: Breakpoint): boolean {
  return typeof window !== "undefined" && window.matchMedia(query(bp)).matches;
}

// One subscribe function per breakpoint, so useSyncExternalStore sees a
// stable reference across renders.
const subscribers = new Map<Breakpoint, (cb: () => void) => () => void>();
function subscriberFor(bp: Breakpoint) {
  let sub = subscribers.get(bp);
  if (!sub) {
    sub = (cb) => {
      const mq = window.matchMedia(query(bp));
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    };
    subscribers.set(bp, sub);
  }
  return sub;
}

/**
 * useAtMost — true while the viewport is at or below the breakpoint, and
 * re-renders as it crosses. False on the server and at hydration.
 * Usage: const sheet = useAtMost("sheet");
 */
export function useAtMost(bp: Breakpoint): boolean {
  return useSyncExternalStore(subscriberFor(bp), () => isAtMost(bp), () => false);
}
