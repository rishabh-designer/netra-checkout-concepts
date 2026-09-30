"use client";

import { useState } from "react";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { samplePath } from "@/lib/netrabot/svgPath";
import styles from "./NetraLab.module.css";

export interface OutlineFieldProps {
  value: string;
  onChange: (path: string) => void;
}

/**
 * OutlineField - edit the body's outline as SVG path data. Only a path that
 * parses is applied, so a half-typed edit never breaks the bot; the error
 * shows underneath until it does.
 * Usage: <OutlineField value={body.outline} onChange={setOutline} />
 */
export function OutlineField({ value, onChange }: OutlineFieldProps) {
  const copy = LAB_COPY.body;
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");

  return (
    <label className={styles.textField}>
      <span className={styles.fieldLabel}>{copy.outline}</span>
      <textarea
        className={styles.textArea}
        rows={4}
        spellCheck={false}
        value={draft ?? value}
        onChange={(event) => {
          setDraft(event.target.value);
          try {
            samplePath(event.target.value);
            setError("");
            onChange(event.target.value);
          } catch (problem) {
            setError(problem instanceof Error ? problem.message : String(problem));
          }
        }}
        onBlur={() => {
          setDraft(null);
          setError("");
        }}
      />
      {error ? <span className={styles.error}>{error}</span> : <span className={styles.intro}>{copy.outlineHint}</span>}
    </label>
  );
}
