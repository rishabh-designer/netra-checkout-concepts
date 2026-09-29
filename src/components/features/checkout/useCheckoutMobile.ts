import { useSyncExternalStore } from "react";

// Below this checkout (and its success page) stacks: the summary and the
// step CTA move into a footer pinned to the foot of the screen.
const MOBILE_QUERY = "(max-width: 1100px)";

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const read = () => window.matchMedia(MOBILE_QUERY).matches;

/** True on checkout's stacked (mobile) layout. */
export function useCheckoutMobile(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
