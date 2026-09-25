import type { BreadcrumbItem } from "@/types/productPage";
import { IkkatMark } from "@/components/ui/IkkatMark";
import { cn } from "@/lib/utils";
import styles from "./BreadcrumbTrail.module.css";

export interface BreadcrumbTrailProps {
  items?: BreadcrumbItem[];
  /** ikkat = grey diamond separators (landing); slash = "/" separators in
   *  muted purple with a purple current page (Quotes feed, Figma 564:32971). */
  variant?: "ikkat" | "slash";
}

/**
 * BreadcrumbTrail — uppercase crumb list separated by grey ikkat diamonds (or
 * "/" in the slash variant); the last item is the current page.
 * Usage: <BreadcrumbTrail items={crumbs} variant="slash" />
 */
export function BreadcrumbTrail({
  items = [{ label: "HOME", href: "#" }, { label: "Current Page" }],
  variant = "ikkat",
}: BreadcrumbTrailProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn(styles.trail, variant === "slash" && styles.slash)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className={styles.entry}>
            {i > 0 &&
              (variant === "slash" ? (
                <span className={styles.slashSep} aria-hidden>/</span>
              ) : (
                <IkkatMark color="var(--color-label-tertiary)" className={styles.sep} />
              ))}
            {isLast ? (
              <span className={styles.current} aria-current="page">
                {item.label}
              </span>
            ) : (
              <a href={item.href} className={styles.crumb}>
                {item.label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
