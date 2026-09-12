import type { MediaContent } from "@/types/productPage";
import styles from "./MediaComposition.module.css";

export interface MediaCompositionProps {
  media: MediaContent;
}

/**
 * MediaComposition — the layered media container: looping skyline video,
 * dithered still (transparent sky) above it, a rotated noise texture on
 * color-burn, and a brand-purple wash on lighten that duotones the stack.
 * Layer geometry and blend modes mirror Figma node 179:65995.
 * Usage: <MediaComposition media={media} />
 */
export function MediaComposition({ media }: MediaCompositionProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.comp}>
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        >
          {media.videoSources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.stillSrc} alt={media.stillAlt} className={styles.still} />
        <div className={styles.noiseWrap} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.noiseSrc} alt="" className={styles.noise} />
        </div>
        <div className={styles.wash} aria-hidden />
      </div>
    </div>
  );
}
