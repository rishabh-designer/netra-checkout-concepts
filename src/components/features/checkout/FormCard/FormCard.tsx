import type { ReactNode } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import styles from "./FormCard.module.css";

export interface FormCardProps {
  banner: string;
  bannerIconSrc: string;
  sectionTitle: string;
  /** "Buy in Another Person's Name" chip. */
  otherPerson: { mode: "live" | "faded" | "hidden"; label: string; checked: boolean; onChange: (on: boolean) => void };
  children: ReactNode;
}

/**
 * FormCard — a checkout step's form (Figma 638:16937): a caution banner, then
 * the section (12 padding) — its title with the "Buy in Another Person's
 * Name" chip (live on Billing, faded on Review, hidden elsewhere), a hairline,
 * and the step body. It sits straight on the page (no card chrome).
 * Usage: <FormCard banner="…" bannerIconSrc="…" sectionTitle="…" otherPerson={…}>…</FormCard>
 */
export function FormCard({ banner, bannerIconSrc, sectionTitle, otherPerson, children }: FormCardProps) {
  return (
    <section className={styles.card}>
      <p className={styles.banner}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bannerIconSrc} alt="" aria-hidden className={styles.bannerIcon} />
        {banner}
      </p>
      <div className={styles.body}>
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
      <hr className={styles.divider} />
      {children}
      </div>
    </section>
  );
}
