import styles from "./HeroFlourish.module.css";

export interface HeroFlourishProps {
  src?: string;
}

/**
 * HeroFlourish — the concentric-ring D&O logo artwork anchored off the
 * bottom-left of the fold, with a white fade toward the page bottom.
 * Usage: <HeroFlourish src="/media/do-logo.webp" />
 */
export function HeroFlourish({ src = "/media/do-logo.webp" }: HeroFlourishProps) {
  return (
    <div className={styles.stage} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={styles.rings} />
      <div className={styles.fade} />
    </div>
  );
}
