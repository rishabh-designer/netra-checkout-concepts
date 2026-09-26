"use client";

import { useEffect, useState } from "react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import type { CheckoutField, CheckoutUpload, CheckoutUploadCopy } from "@/types/checkout";
import type { CheckoutState } from "../useCheckout";
import { StepForm } from "../StepForm";
import styles from "./CheckoutEditDrawer.module.css";

export interface CheckoutEditDrawerProps {
  /** Which section is being edited, or null when closed. */
  section: "company" | "kyc" | null;
  title: string;
  fields: CheckoutField[];
  uploads: CheckoutUpload[];
  uploadCopy: CheckoutUploadCopy;
  co: CheckoutState;
  labels: { save: string; close: string };
  onClose: () => void;
}

/**
 * CheckoutEditDrawer — edits Company or KYC from Review in the shared
 * SideDrawer (r32, same shell as View All Features). The step's own fields
 * open prefilled with what the user entered; changes live in a draft until
 * "Save Changes" (enabled once everything mandatory is valid) writes them back.
 * Usage: <CheckoutEditDrawer section="kyc" title="KYC" fields={…} uploads={…} co={co} … />
 */
export function CheckoutEditDrawer({ section, title, fields, uploads, uploadCopy, co, labels, onClose }: CheckoutEditDrawerProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});

  // A fresh draft from the live values each time a section opens.
  useEffect(() => {
    if (!section) return;
    const next: Record<string, string> = {};
    for (const f of fields) next[f.key] = co.valueOf(f);
    for (const u of uploads) next[u.key] = co.get(u.key);
    setDraft(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const value = (f: CheckoutField) => draft[f.key] ?? co.valueOf(f);
  const valid =
    fields.every((f) => !f.mandatory || (value(f).trim() && !co.errorOf(f, value(f)))) &&
    uploads.every((u) => !!draft[u.key]);

  const save = () => {
    co.set(draft);
    onClose();
  };

  return (
    <SideDrawer
      open={!!section}
      onClose={onClose}
      title={title}
      closeLabel={labels.close}
      width={480}
      footer={
        <button type="button" className={styles.save} disabled={!valid} onClick={save}>
          {labels.save}
        </button>
      }
    >
      <div className={styles.body}>
        {section && (
          <StepForm
            step={section}
            fields={fields}
            uploads={uploads}
            uploadCopy={uploadCopy}
            stacked
            model={{
              value,
              status: (f) => co.statusOf(f, value(f)),
              error: (f) => co.errorOf(f, value(f)),
              file: (key) => draft[key] ?? "",
              onChange: (key, v) => setDraft((d) => ({ ...d, ...co.patchFor(key, v, (k) => d[k] ?? "") })),
            }}
          />
        )}
      </div>
    </SideDrawer>
  );
}
