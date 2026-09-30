import { useAtMost } from "@/lib/media";

/** True on checkout's stacked (mobile) layout: at or below 1100 the checkout
 *  (and its success page) stacks, and the summary and the step CTA move into
 *  a footer pinned to the foot of the screen. */
export function useCheckoutMobile(): boolean {
  return useAtMost("stack");
}
