"use client";

import { useEffect, useState } from "react";
import { CloseButton } from "@/components/ui/IconButton";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { UploadField } from "@/components/ui/UploadField";
import type { FieldStatus } from "@/components/ui/InteractiveInput";
import type { CheckoutField as Field } from "@/types/checkout";
import type { GoldGateContent } from "@/types/quotesPage";
import { CheckoutField } from "../../checkout/CheckoutField";
import { RequestChat } from "../RequestChat";
import styles from "./GoldGate.module.css";
import { Button } from "@/components/ui/Button";

export interface GoldGateModalProps {
  open: boolean;
  content: GoldGateContent["modal"];
  onClose: () => void;
  onCall: () => void;
  onOnline: () => void;
}

/**
 * GoldGateModal — the unpriced Gold Quote's gate (Case B, Figma 647:36737): a
 * bare centred popup with the Risk Report art up top, why the Gold Quote isn't
 * on sale yet, and a grey footer with "Proceed Online" (Additional Details)
 * and "Schedule A Call" (hands over to the experts). × sits in the corner.
 * Usage: <GoldGateModal open={o} content={gate.modal} onClose={c} onCall={call} onOnline={next} />
 */
export function GoldGateModal({ open, content, onClose, onCall, onOnline }: GoldGateModalProps) {
  return (
    <SideDrawer open={open} onClose={onClose} title={content.title} closeLabel={content.closeLabel} width={517} placement="center" bare>
      <div className={styles.modal}>
        <CloseButton label={content.closeLabel} className={styles.close} onClick={onClose} />
        <div className={styles.art}>
          <img className={styles.visual} src={content.visualSrc} alt={content.visualAlt} />
        </div>
        <p className={styles.body}>{content.body}</p>
        <div className={styles.actions}>
          <Button tone="outline" onClick={onOnline}>
            {content.onlineLabel}
          </Button>
          <Button onClick={onCall}>
            {content.callLabel}
          </Button>
        </div>
      </div>
    </SideDrawer>
  );
}

export interface AdditionalDetailsDrawerProps {
  open: boolean;
  content: GoldGateContent["drawer"];
  onClose: () => void;
  /** Everything is in: price the Gold Quote. */
  onProceed: (values: Record<string, string>) => void;
  /** The insurer already has a price (Royal Sundaram): its own intro. */
  priced?: boolean;
}

const seed = (fields: Field[]) => Object.fromEntries(fields.map((f) => [f.key, f.value ?? ""]));

/**
 * AdditionalDetailsDrawer — the few underwriting details the Gold Quote still
 * needs. What we found is prefilled (verified, or guessed and marked fuzzy);
 * the rest (an entry, a dropdown, an upload) is the customer's. "Proceed with
 * Gold Quote" (orange, the Gold tone) enables once every field is in.
 * Usage: <AdditionalDetailsDrawer open={o} content={gate.drawer} onClose={c} onProceed={go} />
 */
export function AdditionalDetailsDrawer({ open, content, onClose, onProceed, priced = false }: AdditionalDetailsDrawerProps) {
  const [values, setValues] = useState<Record<string, string>>(() => seed(content.fields));
  const set = (key: string, v: string) => setValues((d) => ({ ...d, [key]: v }));

  const statusOf = (f: Field): FieldStatus => {
    const v = values[f.key] ?? "";
    if (!v.trim()) return "empty";
    return v === (f.value ?? "") ? f.status : "userFilled";
  };
  const file = values[content.upload.key] ?? "";
  // The chat's answers, once every question is in.
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  // Each opening starts a fresh chat (kept mounted while the drawer closes).
  const [session, setSession] = useState(0);
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswers(null);
    setSession((n) => n + 1);
  }, [open]);
  const valid = content.chat ? !!answers : content.fields.every((f) => !f.mandatory || (values[f.key] ?? "").trim()) && !!file;
  const intro = priced && content.pricedIntro ? content.pricedIntro : content.intro;

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={content.title}
      closeLabel={content.closeLabel}
      width={480}
      headGap={16}
      // Phones: a bottom sheet, like every other popup there.
      sheetOnMobile
      footer={
        <Button tone="secondary" arrow block disabled={!valid} onClick={() => onProceed(answers ?? values)}>
          {content.ctaLabel}
        </Button>
      }
    >
      {content.chat ? (
        <RequestChat key={session} content={content.chat} intro={intro} onDone={setAnswers} />
      ) : (
      <div className={styles.scroll}>
        <p className={styles.intro}>{intro}</p>
        <div className={styles.fields}>
          {content.fields.map((f) => (
            <CheckoutField
              key={f.key}
              field={f}
              value={values[f.key] ?? ""}
              status={statusOf(f)}
              error={null}
              onChange={(v) => set(f.key, v)}
            />
          ))}
          <UploadField
            label={content.upload.label}
            title={content.upload.title}
            mandatory
            fileName={file}
            onChange={(name) => set(content.upload.key, name)}
            copy={content.uploadCopy}
          />
        </div>
      </div>
      )}
    </SideDrawer>
  );
}
