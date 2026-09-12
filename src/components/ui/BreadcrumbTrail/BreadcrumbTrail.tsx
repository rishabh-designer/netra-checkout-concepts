import type { BreadcrumbItem } from "@/types/productPage";
import { IkkatMark } from "@/components/ui/IkkatMark";
import styles from "./BreadcrumbTrail.module.css";

export interface BreadcrumbTrailProps {
  items?: BreadcrumbItem[];
}

/**
 * BreadcrumbTrail — uppercase crumb list separated by grey ikkat diamonds;
 * the last item is the current page. Usage: <BreadcrumbTrail items={crumbs} />
 */
export function BreadcrumbTrail({
  items = [{ label: "HOME", href: "#" }, { label: "Current Page" }],
}: BreadcrumbTrailProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.trail}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className={styles.entry}>
            {i > 0 && (
              <IkkatMark color="var(--color-label-tertiary)" className={styles.sep} />
            )}
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
