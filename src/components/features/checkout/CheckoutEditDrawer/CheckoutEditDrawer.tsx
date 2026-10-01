"use client";

import { useEffect, useState } from "react";
import { completionsFor } from "@/lib/completions";
import { SideDrawer } from "@/components/ui/SideDrawer";
import type { CheckoutField, CheckoutUpload, CheckoutUploadCopy } from "@/types/checkout";
import type { CheckoutState } from "../useCheckout";
import { StepForm } from "../StepForm";
import styles from "./CheckoutEditDrawer.module.css";
import { Button } from "@/components/ui/Button";

export interface CheckoutEditDrawerProps {
  /** Open (Verification) or closed. */
  section: "verification" | null;
  title: string;
  /** KYC numbers (index-aligned with `uploads`). */
  fields: CheckoutField[];
  /** Company details, under `companyTitle`. */
  companyFields: CheckoutField[];
  companyTitle: string;
  uploads: CheckoutUpload[];
  uploadCopy: CheckoutUploadCopy;
  co: CheckoutState;
  labels: { save: string; close: string };
  onClose: () => void;
}

/**
 * CheckoutEditDrawer — edits Verification (KYC, then Company) from Review in the shared
 * SideDrawer (r32, same shell as View All Features). The step's own fields
 * open prefilled with what the user entered; changes live in a draft until
 * "Save Changes" (enabled once everything mandatory is valid) writes them back.
 * Usage: <CheckoutEditDrawer section="verification" title="Verification" fields={kyc} companyFields={company} companyTitle="…" uploads={…} co={co} … />
 */
export function CheckoutEditDrawer({ section, title, fields: kycFields, companyFields, companyTitle, uploads, uploadCopy, co, labels, onClose }: CheckoutEditDrawerProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const fields = [...kycFields, ...companyFields];

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
        <Button block disabled={!valid} onClick={save}>
          {labels.save}
        </Button>
      }
    >
      <div className={styles.body}>
        {section && (
          <StepForm
            step="verification"
            fields={kycFields}
            companyFields={companyFields}
            companyTitle={companyTitle}
            uploads={uploads}
            uploadCopy={uploadCopy}
            stacked
            model={{
              value,
              status: (f) => co.statusOf(f, value(f)),
              error: (f) => co.errorOf(f, value(f)),
              file: (key) => draft[key] ?? "",
              fetched: (key) => co.isFetched(key, draft[key] ?? ""),
              onChange: (key, v) => setDraft((d) => ({ ...d, ...co.patchFor(key, v, (k) => d[k] ?? "") })),
              completions: (f) => {
                const read = (k: string) => {
                  const field = fields.find((x) => x.key === k);
                  return draft[k] ?? (field ? co.valueOf(field) : co.get(k));
                };
                return completionsFor(f.key, { pincode: read("pincode"), place: read("place"), emailDomain: co.companyDomain });
              },
            }}
          />
        )}
      </div>
    </SideDrawer>
  );
}
