import type { NavContent } from "@/types/productPage";
import { IkkatMark } from "@/components/ui/IkkatMark";
import styles from "./Navbar.module.css";

export interface NavbarProps {
  content: NavContent;
}

/**
 * Navbar — the megamenu bar: logotype, nav items with a slide-up purple
 * hover label, ikkat separators, and the Login button.
 * Usage: <Navbar content={nav} />
 */
export function Navbar({ content }: NavbarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.logoSrc}
            alt={content.logoAlt}
            className={styles.logo}
          />
          <nav className={styles.nav} aria-label="Primary">
            {content.items.map((item, i) => (
              <span key={item.label} className={styles.navEntry}>
                {i > 0 && <IkkatMark className={styles.sep} />}
                <a href={item.href} className={styles.item}>
                  <span className={styles.itemLabels}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <span className={`${styles.itemLabel} ${styles.itemLabelHover}`}>
                      {item.hoverLabel}
                    </span>
                  </span>
                  {item.hasDropdown && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/figma/nav-chevron.svg" alt="" className={styles.chevron} />
                  )}
                </a>
              </span>
            ))}
          </nav>
        </div>
        <button type="button" className={styles.login}>
          {content.loginLabel}
        </button>
      </div>
    </header>
  );
}
