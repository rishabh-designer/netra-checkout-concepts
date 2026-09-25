import type { CheckoutStepId } from "@/types/checkout";
import styles from "./CheckoutStepper.module.css";

export interface CheckoutStepperProps {
  steps: CheckoutStepId[];
  current: CheckoutStepId;
  labels: Record<CheckoutStepId, string>;
  ariaLabel: string;
}

/** 12px glyphs (Figma 484:25864): done tick in a green ring, current purple
 *  dot in a lilac ring, upcoming grey dot. */
function Glyph({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "done") {
    return (
      <span className={styles.ring}>
        <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 5a5 5 0 1 1 10 0A5 5 0 0 1 0 5Zm7.4-1.24a.34.34 0 0 0-.48-.48L4.2 6 3.08 4.87a.34.34 0 1 0-.48.48l1.36 1.37c.13.13.35.13.48 0L7.4 3.76Z"
            fill="var(--color-success)"
          />
        </svg>
      </span>
    );
  }
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden className={styles.dot} data-state={state}>
      <rect x="0.27" y="0.27" width="11.47" height="11.47" rx="5.73" fill="none" strokeWidth="0.53" />
      <circle cx="6" cy="6" r="5" />
    </svg>
  );
}

/**
 * CheckoutStepper — the four-step pill row beside the page title (Figma
 * 484:25864 / 613:65314): done steps green with a tick, the current step
 * lilac with a purple dot, upcoming steps a bare grey dot (no label).
 * Usage: <CheckoutStepper steps={…} current="company" labels={…} />
 */
export function CheckoutStepper({ steps, current, labels, ariaLabel }: CheckoutStepperProps) {
  const at = steps.indexOf(current);
  return (
    <ol className={styles.stepper} aria-label={ariaLabel}>
      {steps.map((s, i) => {
        const state = i < at ? "done" : i === at ? "current" : "upcoming";
        return (
          <li key={s} className={styles.pill} data-state={state} aria-current={state === "current" ? "step" : undefined}>
            <Glyph state={state} />
            {state === "upcoming" ? <span className={styles.srOnly}>{labels[s]}</span> : <span className={styles.label}>{labels[s]}</span>}
          </li>
        );
      })}
    </ol>
  );
}
