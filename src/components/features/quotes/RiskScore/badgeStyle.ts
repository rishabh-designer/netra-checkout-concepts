import { useSyncExternalStore } from "react";

/** Which side of the Business Health badge is showing: the gold medal
 *  (the default), or the rings on the other side of the flip. Shared by
 *  every badge on the page and never saved, so each load starts on the medal. */
export type BadgeStyle = "rings" | "medal";

let current: BadgeStyle = "medal";
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
  return useSyncExternalStore(subscribe, () => current, () => "medal");
}
