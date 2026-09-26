import type { CheckoutStepId } from "@/types/checkout";

/**
 * Where the user just came from inside checkout. Each step is its own route,
 * so the page remounts on Save & Continue; this module-level note (it lives for
 * the whole client session) lets the new step animate the progress bar and the
 * stepper *from* the previous state instead of popping straight to the new one.
 */
export interface LastCheckout {
  step: CheckoutStepId;
  percent: number;
  timeLeft: string;
}

let last: LastCheckout | null = null;

export function readLastCheckout(): LastCheckout | null {
  return last;
}

export function writeLastCheckout(next: LastCheckout): void {
  last = next;
}
