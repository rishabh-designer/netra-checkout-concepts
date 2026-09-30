"use client";

import { PillGroup } from "@/components/ui/PillGroup";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import type { EyeSide, NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

/**
 * EyeSideSwitch - which eye the Eyes controls edit: Both (mirrored, so the
 * face stays symmetrical), or just the left or the right one.
 * Usage: <EyeSideSwitch lab={lab} />
 */
export function EyeSideSwitch({ lab }: { lab: NetraLabApi }) {
  const copy = LAB_COPY.pose;
  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{copy.eyes}</span>
      <PillGroup<EyeSide>
        label={copy.eyes}
        options={[
          { value: "both", label: copy.both },
          { value: "left", label: copy.left },
          { value: "right", label: copy.right },
        ]}
        value={lab.eyeSide}
        onChange={lab.setEyeSide}
      />
    </div>
  );
}
