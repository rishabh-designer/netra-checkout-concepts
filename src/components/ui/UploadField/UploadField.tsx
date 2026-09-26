"use client";

import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import styles from "./UploadField.module.css";

export type UploadState = "default" | "success" | "failure" | "disabled";

export interface UploadFieldCopy {
  hint: string;
  successTitle: string;
  successBody: string;
  failureTitle: string;
  tooLarge: string;
  wrongType: string;
  cancelLabel: string;
  retryLabel: string;
  disabledTitle: string;
  disabledBody: string;
  maxBytes: number;
}

export interface UploadFieldProps {
  label: string;
  /** Default-state title ("Upload Company GST"). */
  title: string;
  mandatory?: boolean;
  /** Name of the accepted file (success state), or "" when nothing is uploaded. */
  fileName: string;
  /** Called with the accepted file's name, or "" when cleared. */
  onChange: (fileName: string) => void;
  copy: UploadFieldCopy;
  disabled?: boolean;
  /** MIME / extension filter for the picker. */
  accept?: string;
}

const ILLUSTRATION: Record<UploadState, string> = {
  default: "/media/upload/default.webp",
  success: "/media/upload/success.webp",
  failure: "/media/upload/failure.webp",
  disabled: "/media/upload/disabled.webp",
};

/** Renders `{file}` in a template with the file name emphasised. */
function withFile(template: string, file: string, className: string): ReactNode {
  const [before, after = ""] = template.split("{file}");
  return (
    <>
      {before}
      <span className={className}>{file}</span>
      {after}
    </>
  );
}

function isAccepted(file: File): boolean {
  return file.type.startsWith("image/") || file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

/**
 * UploadField — the Peetal DSL Interactive Input (Upload): a 200px drop zone
 * with a 3D illustration, title and hint (Default, dashed blue). A picked or
 * dropped file is checked (image or PDF, at most `copy.maxBytes`) → Success
 * (green, "file has been uploaded", "Replace File": the current file stays
 * until a new one is picked) or Failure
 * (red, the reason, "Try Again"). Disabled is dashed grey. Only the file name
 * is kept; nothing is sent anywhere.
 * Usage: <UploadField label="…" title="Upload Company GST" fileName={f} onChange={setF} copy={upload} />
 */
export function UploadField({ label, title, mandatory, fileName, onChange, copy, disabled, accept = "image/*,.pdf,application/pdf" }: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [failure, setFailure] = useState<{ file: string; reason: string } | null>(null);
  const [dragging, setDragging] = useState(false);

  const state: UploadState = disabled ? "disabled" : fileName ? "success" : failure ? "failure" : "default";

  const take = (file: File | undefined) => {
    if (!file) return;
    if (!isAccepted(file)) {
      setFailure({ file: file.name, reason: copy.wrongType });
      onChange("");
    } else if (file.size > copy.maxBytes) {
      setFailure({ file: file.name, reason: copy.tooLarge });
      onChange("");
    } else {
      setFailure(null);
      onChange(file.name);
    }
  };

  const browse = () => {
    if (state === "disabled") return;
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const reset = () => {
    setFailure(null);
    onChange("");
    browse();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (state !== "disabled") take(e.dataTransfer.files[0]);
  };

  const pickable = state === "default";

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {mandatory && state !== "disabled" && <span className={styles.req}>*</span>}
      </label>
      <div className={styles.wrap}>
        <div
          className={styles.zone}
          data-state={state}
          data-dragging={dragging || undefined}
          role={pickable ? "button" : undefined}
          tabIndex={pickable ? 0 : undefined}
          aria-label={pickable ? `${title}. ${copy.hint}` : undefined}
          onClick={pickable ? browse : undefined}
          onKeyDown={pickable ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), browse()) : undefined}
          onDragOver={(e) => {
            if (state === "disabled") return;
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ILLUSTRATION[state]} alt="" aria-hidden className={styles.art} />
          <div className={styles.text} aria-live="polite">
            <p className={styles.title}>
              {(state === "default" || state === "disabled") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={state === "disabled" ? "/media/upload/glyph-disabled.svg" : "/media/upload/glyph.svg"}
                  alt=""
                  aria-hidden
                  className={styles.glyph}
                />
              )}
              {state === "default" && title}
              {state === "success" && copy.successTitle}
              {state === "failure" && copy.failureTitle}
              {state === "disabled" && copy.disabledTitle}
            </p>
            <p className={styles.sub}>
              {state === "default" && copy.hint}
              {state === "success" && withFile(copy.successBody, fileName, styles.fileOk)}
              {state === "failure" && failure && withFile(failure.reason, failure.file, styles.fileBad)}
              {state === "disabled" && copy.disabledBody}
            </p>
          </div>
          {(state === "success" || state === "failure") && (
            <button type="button" className={styles.again} onClick={state === "success" ? browse : reset}>
              {state === "success" ? copy.cancelLabel : copy.retryLabel}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className={styles.input}
          disabled={state === "disabled"}
          tabIndex={-1}
          onChange={(e) => take(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
