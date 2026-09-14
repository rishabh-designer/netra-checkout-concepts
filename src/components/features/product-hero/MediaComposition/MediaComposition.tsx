import type { MediaContent } from "@/types/productPage";
import styles from "./MediaComposition.module.css";

export interface MediaCompositionProps {
  media: MediaContent;
}

/**
 * MediaComposition — the layered media container, over a brand-purple base:
 * a Color-Dodge filter, a looping video (intentionally larger than the frame)
 * on Lighten, and a pixel-mapped dithered still on top whose transparency lets
 * the layers below show through. Geometry and blend modes mirror Figma node
 * 358:28511. Usage: <MediaComposition media={media} />
 */
export function MediaComposition({ media }: MediaCompositionProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.comp}>
        <div className={styles.filter} aria-hidden />
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
      </div>
    </div>
  );
}
