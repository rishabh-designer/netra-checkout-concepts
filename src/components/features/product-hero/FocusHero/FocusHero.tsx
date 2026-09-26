"use client";

import { Fragment, type CSSProperties } from "react";
import type { FocusHeroContent, ProductPageContent } from "@/types/productPage";
import type { QuotesPreview } from "@/types/quotesPage";
import { TagPill } from "@/components/ui/TagPill";
import { IkkatMark } from "@/components/ui/IkkatMark";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { InsurerLogoShowcase } from "@/components/ui/InsurerLogoShowcase";
import { EyeIcon } from "@/components/icons/EyeIcon";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import { LeadFormCard } from "../LeadFormCard";
import { CoverageTicker } from "../CoverageTicker";
import { PlpMark } from "../PlpMark";
import styles from "./FocusHero.module.css";

export interface FocusHeroProps {
  content: ProductPageContent;
  focus: FocusHeroContent;
  quotesPreview?: QuotesPreview;
}

/**
 * FocusHero — the "Focus" landing concept (toggled from Login). One centred
 * column so the eye has a single path: pills around the shimmering product mark
 * on the PLP name rule → offer-led headline → what's covered → ikkat rule →
 * the form (the page's one destination) → proof beside the CTA → insurer
 * logos pinned to the foot. No hero image competing with the form.
 * Usage: <FocusHero content={content} focus={content.focusHero} />
 */
/** Entrance beat (top to bottom): `--i` sets the stagger slot in the CSS. */
const beat = (i: number) => ({ "--i": i }) as CSSProperties;

export function FocusHero({ content, focus, quotesPreview }: FocusHeroProps) {
  return (
    <main className={styles.column}>
      {/* Top stack (Figma 626:15872): pills around the half-cropped product
          icon, sat on the PLP name rule. */}
      <div className={`${styles.top} ${styles.enter}`} style={beat(1)}>
        <div className={styles.pills}>
          {content.tags.map((tag, i) => (
            <Fragment key={tag.label}>
              {i === 1 && (
                <PlpMark src={focus.plpIconSrc} />
              )}
              <TagPill
                label={tag.label}
                variant={tag.variant}
                className={styles.pill}
                icon={
                  tag.icon === "shoppingBag" ? (
                    <ShoppingBagIcon size={12} color="var(--color-success)" />
                  ) : tag.icon === "eye" ? (
                    <EyeIcon size={12} color="var(--color-brand-secondary)" />
                  ) : undefined
                }
              />
            </Fragment>
          ))}
        </div>
        <p className={styles.plpName}>{focus.eyebrow}</p>
      </div>

      {/* Offer-led headline: the cover as a warm lead-in, the price as the hero. */}
      <div className={styles.heading}>
        <h1 className={styles.title}>
          <span className={`${styles.cover} ${styles.enter}`} style={beat(2)}>{focus.headlineCover}</span>{" "}
          <span className={`${styles.price} ${styles.enter}`} style={beat(3)}>{focus.headlinePrice}</span>
        </h1>
        <p className={`${styles.subtitle} ${styles.enter}`} style={beat(4)}>{content.subtitle}</p>
        <div className={styles.enter} style={beat(5)}>
          <CoverageTicker items={focus.coveredChips} iconSrc={focus.coveredIconSrc} />
        </div>
      </div>

      <div className={styles.draw} style={beat(6)}>
        <IkkatDivider unit={21.8} className={styles.divider} />
      </div>

      <div className={styles.form}>
        <div className={styles.enter} style={beat(7)}>
          <LeadFormCard
            content={content.leadForm}
            quoteModal={content.quoteModal}
            focus={{ privacyLine: focus.privacyLine }}
            quotesPreview={quotesPreview}
          />
        </div>

        {/* Proof at the point of action (Figma 626:15669): serif figures in
            three equal columns, split by bead marks. */}
        <div className={`${styles.proof} ${styles.enter}`} style={beat(8)}>
          {content.stats.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 && <IkkatMark pattern={3} width={12} color="var(--color-brand-secondary-deep)" />}
              <span className={styles.stat}>
                <strong className={styles.statValue}>{stat.value}</strong>
                <span className={styles.statLabel}>{stat.label}</span>
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Bottom stack (Figma 626:16095), pinned to the column's foot. */}
      <div className={`${styles.bottom} ${styles.enter}`} style={beat(9)}>
        <div className={styles.providers}>
          <p className={styles.providersHeading}>{content.leadForm.providersHeading}</p>
          <InsurerLogoShowcase slots={content.leadForm.providerShowcase} />
        </div>
      </div>
    </main>
  );
}
