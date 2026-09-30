import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { cn } from "@/lib/utils";
import styles from "./StepActions.module.css";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export interface StepCtaProps {
  /** `blockedTip`: the tooltip while the CTA is greyed out. */
  cta: { label: string; enabled: boolean; onClick: () => void; blockedTip?: string };
  className?: string;
}

/** A confirmation that gates the CTA: the guessed-details check on a fuzzy
 *  step ("verify"), or Review's broker disclaimer ("review", caution tone). */
export interface StepConsentData {
  text: string;
  checked: boolean;
  onToggle: () => void;
  tone: "verify" | "review";
}

export interface StepActionsProps extends Pick<StepCtaProps, "cta"> {
  consent?: StepConsentData;
}

/**
 * StepCta — the step's CTA (Figma 638:17439): 16/28, r16 → 24, 16px label +
 * arrow. Shared by the form's foot (web) and the checkout footer (mobile).
 * Usage: <StepCta cta={{ label, enabled, onClick }} />
 */
export function StepCta({ cta, className }: StepCtaProps) {
  return (
    <Button arrow className={className} disabled={!cta.enabled} blockedTip={cta.blockedTip} onClick={cta.onClick}>
      {cta.label}
    </Button>
  );
}

/**
 * StepConsent — the tick that gates the step CTA: a 16px box, then the 12px
 * line. Shared by the form's foot (web) and the checkout footer (mobile,
 * `variant="footer"`: a 12px box and a 14px line in plain ink, 734:36135).
 * Usage: <StepConsent consent={{ text, checked, onToggle, tone: "verify" }} />
 */
export function StepConsent({ consent, variant, className }: { consent: StepConsentData; variant?: "footer"; className?: string }) {
  return (
    <label className={cn(styles.consent, className)} data-tone={consent.tone} data-variant={variant}>
      <Checkbox size={variant === "footer" ? 12 : 16} className={styles.check} checked={consent.checked} onChange={consent.onToggle} />
      <span>{consent.text}</span>
    </label>
  );
}

/**
 * StepActions — the foot of each checkout step (Figma 638:18618 / 638:22514):
 * an ikkat rule, then an optional consent on the left and the step CTA on the
 * right.
 * Usage: <StepActions cta={{ label, enabled, onClick }} consent={{ text, checked, onToggle, tone: "verify" }} />
 */
export function StepActions({ cta, consent }: StepActionsProps) {
  return (
    <div className={styles.actions}>
      <IkkatDivider unit={25} className={styles.rule} />
      <div className={styles.row}>
        {consent && <StepConsent consent={consent} />}
        <StepCta cta={cta} />
      </div>
    </div>
  );
}
