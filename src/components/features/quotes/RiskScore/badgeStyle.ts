import { useSyncExternalStore } from "react";

/** Which side of the Business Health badge is showing: the default rings,
 *  or the gold medal being tried out (on the back of the flip). Shared by every badge on the page and never saved,
 *  so each page load starts on the default. */
export type BadgeStyle = "rings" | "medal";

let current: BadgeStyle = "rings";
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function toggleBadgeStyle() {
  current = current === "rings" ? "medal" : "rings";
  listeners.forEach((fn) => fn());
}

export function useBadgeStyle(): BadgeStyle {
  return useSyncExternalStore(subscribe, () => current, () => "rings");
}
