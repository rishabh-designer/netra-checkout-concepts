import type { ReactNode } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import styles from "./FormCard.module.css";

export interface FormCardProps {
  banner: string;
  bannerIconSrc: string;
  /** Smaller banner for long copy (Billing). */
  bannerCompact?: boolean;
  sectionTitle: string;
  /** "Buy in Another Person's Name" chip. */
  otherPerson: { mode: "live" | "faded" | "hidden"; label: string; checked: boolean; onChange: (on: boolean) => void };
  children: ReactNode;
}

/**
 * FormCard — the white checkout card (Figma 484:25880 / 27601): a caution
 * banner, the section title with the "Buy in Another Person's Name" chip
 * (live on Billing, faded on Review, hidden elsewhere), then the step body.
 * Usage: <FormCard banner="…" bannerIconSrc="…" sectionTitle="…" otherPerson={…}>…</FormCard>
 */
export function FormCard({ banner, bannerIconSrc, bannerCompact, sectionTitle, otherPerson, children }: FormCardProps) {
  return (
    <section className={styles.card}>
      <p className={styles.banner} data-compact={bannerCompact || undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bannerIconSrc} alt="" aria-hidden className={styles.bannerIcon} />
        {banner}
      </p>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
        {otherPerson.mode !== "hidden" && (
          <div className={styles.chip} data-faded={otherPerson.mode === "faded" || undefined} aria-disabled={otherPerson.mode === "faded" || undefined}>
            <ToggleSwitch
              size="sm"
              label={otherPerson.label}
              checked={otherPerson.checked}
              onChange={otherPerson.mode === "live" ? otherPerson.onChange : () => {}}
            />
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
