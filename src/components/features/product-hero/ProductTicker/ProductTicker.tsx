import { Fragment } from "react";
import { IkkatMark } from "@/components/ui/IkkatMark";
import styles from "./ProductTicker.module.css";

export interface ProductTickerProps {
  phrases?: string[];
  /** How many times the phrase set repeats to fill the strip. */
  repeat?: number;
}

/**
 * ProductTicker — the purple strip of alternating phrases separated by
 * white ikkat diamonds, pinned to the bottom of the hero fold. The track is
 * an exact whole number (`repeat`) of identical phrase periods, so it loops as
 * a seamless left-to-right marquee (see ProductTicker.module.css).
 * Usage: <ProductTicker phrases={["quotes in seconds", "coverage in minutes"]} />
 */
export function ProductTicker({
  phrases = ["quotes in seconds", "coverage in minutes"],
  repeat = 12,
}: ProductTickerProps) {
  return (
    <div className={styles.strip} aria-hidden>
      <div
        className={styles.track}
        style={{ ["--ticker-repeat" as string]: String(repeat) }}
      >
        {Array.from({ length: repeat }).map((_, r) => (
          <Fragment key={r}>
            {phrases.map((phrase, i) => (
              <Fragment key={`${r}-${phrase}`}>
                <IkkatMark
                  pattern={i % 2 === 0 ? 1 : 2}
                  width={8}
                  color="var(--color-label-inverse)"
                  className={styles.diamond}
                />
                <span className={styles.phrase}>{phrase}</span>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
