import { cn } from "@/lib/utils";
import styles from "./StepActions.module.css";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export interface StepCtaProps {
  /** `blockedTip`: the tooltip while the CTA is greyed out. */
  /** `tone`: "secondary" (orange) for the journey's final CTA. */
  cta: { label: string; enabled: boolean; onClick: () => void; blockedTip?: string; tone?: "primary" | "secondary" };
  className?: string;
  /** Full width (in the Purchase Summary card). */
  block?: boolean;
}

/** A confirmation that gates the CTA: the guessed-details check on a fuzzy
 *  step ("verify"), or Review's broker disclaimer ("review", caution tone). */
export interface StepConsentData {
  text: string;
  checked: boolean;
  onToggle: () => void;
  tone: "verify" | "review";
}

/**
 * StepCta — the step's CTA (Figma 638:17439): 16/28, r16 → 24, 16px label +
 * arrow. Shared by the form's foot (web) and the checkout footer (mobile).
 * Usage: <StepCta cta={{ label, enabled, onClick }} />
 */
export function StepCta({ cta, className, block }: StepCtaProps) {
  return (
    <Button arrow block={block} tone={cta.tone} className={className} disabled={!cta.enabled} blockedTip={cta.blockedTip} onClick={cta.onClick}>
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
export function StepConsent({ consent, variant, className }: { consent: StepConsentData; variant?: "footer" | "summary"; className?: string }) {
  return (
    <label className={cn(styles.consent, className)} data-tone={consent.tone} data-variant={variant}>
      <Checkbox size={variant === "footer" ? 12 : 16} className={styles.check} checked={consent.checked} onChange={consent.onToggle} />
      <span>{consent.text}</span>
    </label>
  );
}
