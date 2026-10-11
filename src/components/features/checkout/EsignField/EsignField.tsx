"use client";

import { useState } from "react";
import { UploadField } from "@/components/ui/UploadField";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { InteractiveInput } from "@/components/ui/InteractiveInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useDemoNotice } from "@/lib/demo-notice";
import type { CheckoutEsignContent, CheckoutUploadCopy } from "@/types/checkout";
import styles from "./EsignField.module.css";

export interface EsignFieldProps {
  content: CheckoutEsignContent;
  uploadCopy: CheckoutUploadCopy;
  /** Signed already (kept with the checkout, so Review can show it). */
  signed: boolean;
  onSignedChange: (signed: boolean) => void;
}

const digits = (v: string) => v.replace(/\D/g, "");

/**
 * EsignField — KYC Verification's one field: it reads like an upload ("Sign
 * with Aadhaar · Click to connect to NSDL E-Sign") but opens the e-Sign
 * popup: consent, the Aadhaar or Virtual ID, Send OTP, then the OTP and
 * Verify & Sign. Signed, the field turns to its success state. A prototype:
 * nothing typed leaves the page.
 * Usage: <EsignField content={verification.esign} uploadCopy={content.upload} signed={s} onSignedChange={setS} />
 */
export function EsignField({ content, uploadCopy, signed, onSignedChange }: EsignFieldProps) {
  const m = content.modal;
  const notify = useDemoNotice();
  const view = (beside?: boolean) => (
    <button type="button" className={styles.view} data-beside={beside || undefined} onClick={() => notify("mandateLetter")}>
      {content.viewLabel}
    </button>
  );
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"id" | "otp">("id");
  const [consent, setConsent] = useState(false);
  const [id, setId] = useState("");
  const [otp, setOtp] = useState("");
  const [tried, setTried] = useState(false);

  const idOk = id.length === 12 || id.length === 16;
  const otpOk = otp.length === 6;

  const start = () => {
    setStage("id");
    setConsent(false);
    setId("");
    setOtp("");
    setTried(false);
    setOpen(true);
  };
  const send = () => {
    setTried(true);
    if (!consent || !idOk) return;
    setTried(false);
    setStage("otp");
  };
  const verify = () => {
    setTried(true);
    if (!otpOk) return;
    onSignedChange(true);
    setOpen(false);
  };

  return (
    <>
      <UploadField
        label={content.label}
        title={content.title}
        mandatory
        hint={content.hint}
        fileName={signed ? content.signedName : ""}
        onChange={(v) => !v && onSignedChange(false)}
        onPick={start}
        labelAction={view(true)}
        copy={{ ...uploadCopy, successTitle: content.successTitle, successBody: content.successBody, cancelLabel: content.redoLabel }}
      />
      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={m.title}
        closeLabel={m.closeLabel}
        width={480}
        placement="center"
        footer={
          <div className={styles.actions}>
            <Button tone="outline" onClick={() => setOpen(false)}>
              {m.cancelLabel}
            </Button>
            {stage === "id" ? (
              <Button onClick={send} disabled={!consent}>
                {m.sendLabel}
              </Button>
            ) : (
              <Button onClick={verify}>{m.verifyLabel}</Button>
            )}
          </div>
        }
      >
        <div className={styles.body}>
          <p className={styles.intro}>
            {m.intro} {view()}
          </p>
          {stage === "id" ? (
            <>
              <label className={styles.consent}>
                <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{m.consent}</span>
              </label>
              <InteractiveInput
                label={m.idLabel}
                placeholder={m.idPlaceholder}
                inputMode="numeric"
                maxLength={16}
                value={id}
                onChange={(v) => setId(digits(v))}
                status={tried && !idOk ? "error" : id ? "success" : "empty"}
                helpText={tried && !idOk ? m.idError : undefined}
                helpTone="error"
                showHelp
              />
            </>
          ) : (
            <InteractiveInput
              label={m.otpLabel}
              placeholder={m.otpPlaceholder}
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(v) => setOtp(digits(v))}
              status={tried && !otpOk ? "error" : otp ? "success" : "empty"}
              helpText={tried && !otpOk ? m.otpError : m.otpHint}
              helpTone={tried && !otpOk ? "error" : "neutral"}
              showHelp
              autoFocusDesktop
            />
          )}
        </div>
      </SideDrawer>
    </>
  );
}
