"use client";

import type { CheckoutSuccessContent } from "@/types/checkout";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { RiskLetterPreview } from "../RiskLetterPreview";
import styles from "./RiskHeldModal.module.css";

export interface RiskHeldModalProps {
  open: boolean;
  content: CheckoutSuccessContent["riskHeld"];
  onDownload: () => void;
  onWhatsApp: () => void;
  /** Who the policy is for, named on the letter preview. */
  company: string;
}

const noop = () => {};

/**
 * RiskHeldModal — the Risk Held Letter popup (Figma 683:56601), centred on
 * the lightbox scrim. Not dismissable: no ×, and neither the scrim nor Esc
 * closes it; Download Now or Send to WhatsApp does. A letter preview, the
 * serif title and a line on what the letter is, over a grey action bar.
 * Usage: <RiskHeldModal open={o} content={s.riskHeld} onDownload={fn} onWhatsApp={fn} />
 */
export function RiskHeldModal({ open, content, onDownload, onWhatsApp, company }: RiskHeldModalProps) {
  return (
    <SideDrawer open={open} onClose={noop} title={content.title} closeLabel="" placement="center" bare width={555} className={styles.shell}>
      <div className={styles.modal}>
        <div className={styles.preview}>
          <RiskLetterPreview content={content.preview} company={company} label={content.imageAlt} />
        </div>
        <div className={styles.copy}>
          <h2 className={styles.title}>{content.title}</h2>
          <p className={styles.body}>{content.body}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onDownload}>
            {content.downloadLabel}
          </button>
          <button type="button" className={styles.primary} onClick={onWhatsApp}>
            {content.whatsappLabel}
          </button>
        </div>
      </div>
    </SideDrawer>
  );
}
