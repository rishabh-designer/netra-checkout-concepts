import { IkkatDivider } from "@/components/ui/IkkatDivider";
import styles from "./StepActions.module.css";

export interface StepActionsProps {
  cta: { label: string; enabled: boolean; onClick: () => void };
  /** A confirmation that gates the CTA: the guessed-details check on a fuzzy
   *  step ("verify"), or Review's broker disclaimer ("review", caution tone). */
  consent?: { text: string; checked: boolean; onToggle: () => void; tone: "verify" | "review" };
}

/**
 * StepActions — the foot of each checkout step (Figma 638:18618 / 638:22514):
 * an ikkat rule, then an optional consent on the left and the step CTA on the
 * right (16/28, r16 → 24, 16px label + arrow).
 * Usage: <StepActions cta={{ label, enabled, onClick }} consent={{ text, checked, onToggle, tone: "verify" }} />
 */
export function StepActions({ cta, consent }: StepActionsProps) {
  return (
    <div className={styles.actions}>
      <IkkatDivider unit={25} className={styles.rule} />
      <div className={styles.row}>
        {consent && (
          <label className={styles.consent} data-tone={consent.tone}>
            <input type="checkbox" className={styles.check} checked={consent.checked} onChange={consent.onToggle} />
            <span>{consent.text}</span>
          </label>
        )}
        <button type="button" className={styles.cta} disabled={!cta.enabled} onClick={cta.onClick}>
          <span>{cta.label}</span>
          <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden className={styles.ctaArrow}>
            <path d="M3 9h12m-4.5-4.5L15 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
