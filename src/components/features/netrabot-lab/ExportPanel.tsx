"use client";

import { useState } from "react";
import { getDefaultNetraBotDefinition } from "@/lib/api/netrabot";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import { parseNetraBotDefinition } from "@/lib/netrabot/validate";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

/**
 * ExportPanel - save the whole design as one JSON file, bring one back in, or
 * reset to the starter. The same JSON is what the app's mock API serves.
 * Usage: <ExportPanel lab={lab} />
 */
export function ExportPanel({ lab }: { lab: NetraLabApi }) {
  const copy = LAB_COPY.exportPanel;
  const [copied, setCopied] = useState(false);
  const [incoming, setIncoming] = useState("");
  const [error, setError] = useState("");
  const json = JSON.stringify(lab.definition, null, 2);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(copy.copyBlocked);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = LAB_COPY.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const apply = () => {
    const result = parseNetraBotDefinition(incoming);
    if (!result.ok) return setError(result.error);
    setError("");
    lab.setDefinition(result.value);
    setIncoming("");
  };

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{copy.intro}</p>
      <div className={styles.toolbar}>
        <button type="button" className={styles.action} data-tone="primary" onClick={copyJson}>
          {copied ? copy.copied : copy.copy}
        </button>
        <button type="button" className={styles.action} onClick={download}>
          {copy.download}
        </button>
      </div>
      <h3 className={styles.sectionTitle}>{copy.import}</h3>
      <textarea
        className={styles.textArea}
        value={incoming}
        placeholder={copy.importHint}
        onChange={(event) => setIncoming(event.target.value)}
        rows={5}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.toolbar}>
        <button type="button" className={styles.action} disabled={!incoming.trim()} onClick={apply}>
          {copy.apply}
        </button>
        <button
          type="button"
          className={styles.action}
          data-tone="danger"
          onClick={() => window.confirm(copy.confirmReset) && lab.setDefinition(getDefaultNetraBotDefinition())}
        >
          {copy.reset}
        </button>
      </div>
      <h3 className={styles.sectionTitle}>{copy.usage}</h3>
      <code className={styles.code}>{LAB_COPY.usageSnippet}</code>
    </div>
  );
}
