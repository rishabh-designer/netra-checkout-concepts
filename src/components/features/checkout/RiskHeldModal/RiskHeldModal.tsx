"use client";

import type { CheckoutSuccessContent } from "@/types/checkout";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { RiskLetterPreview } from "../RiskLetterPreview";
import styles from "./RiskHeldModal.module.css";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/IconButton";

export interface RiskHeldModalProps {
  open: boolean;
  content: CheckoutSuccessContent["riskHeld"];
  onDownload: () => void;
  onWhatsApp: () => void;
  /** The ×, Esc or a click outside: closes without either action. */
  onClose: () => void;
  /** Who the policy is for, named on the letter preview. */
  company: string;
}

/**
 * RiskHeldModal — the Risk Held Letter popup (Figma 683:56601), centred on
 * the lightbox scrim: a letter preview, the serif title and a line on what
 * the letter is, over a grey action bar (Download Now, Send to WhatsApp); a
 * × in the corner (and Esc, or the scrim) closes it.
 * Usage: <RiskHeldModal open={o} content={s.riskHeld} onDownload={fn} onWhatsApp={fn} onClose={fn} company="…" />
 */
export function RiskHeldModal({ open, content, onDownload, onWhatsApp, onClose, company }: RiskHeldModalProps) {
  return (
    <SideDrawer open={open} onClose={onClose} title={content.title} closeLabel={content.closeLabel} placement="center" bare width={555} className={styles.shell}>
      <div className={styles.modal}>
        <CloseButton label={content.closeLabel} onClick={onClose} className={styles.close} />
        <div className={styles.preview}>
          <RiskLetterPreview content={content.preview} company={company} label={content.imageAlt} />
        </div>
        <div className={styles.copy}>
          <h2 className={styles.title}>{content.title}</h2>
          <p className={styles.body}>
            <strong className={styles.lead}>{content.lead}</strong> {content.body}
          </p>
        </div>
        <div className={styles.actions}>
          <Button tone="outline" onClick={onDownload} className={styles.button}>
            {content.downloadLabel}
          </Button>
          <Button onClick={onWhatsApp} className={styles.button}>
            {content.whatsappLabel}
          </Button>
        </div>
      </div>
    </SideDrawer>
  );
}
