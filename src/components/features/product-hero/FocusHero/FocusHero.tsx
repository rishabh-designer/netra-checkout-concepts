"use client";

import { Fragment } from "react";
import type { FocusHeroContent, ProductPageContent } from "@/types/productPage";
import { TagPill } from "@/components/ui/TagPill";
import { IkkatMark } from "@/components/ui/IkkatMark";
import { InsurerLogoShowcase } from "@/components/ui/InsurerLogoShowcase";
import { EyeIcon } from "@/components/icons/EyeIcon";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import { LeadFormCard } from "../LeadFormCard";
import { CoverageTicker } from "../CoverageTicker";
import styles from "./FocusHero.module.css";

export interface FocusHeroProps {
  content: ProductPageContent;
  focus: FocusHeroContent;
}

/**
 * FocusHero — the "Focus" landing concept (toggled from Login). One centred
 * column so the eye has a single path: pills → offer-led headline → what's
 * covered → the form (the page's one destination) → proof beside the CTA →
 * insurer logos. No hero image or flourish competing with the form.
 * Usage: <FocusHero content={content} focus={content.focusHero} />
 */
export function FocusHero({ content, focus }: FocusHeroProps) {
  return (
    <main className={styles.column}>
      <div className={styles.pills}>
        {content.tags.map((tag) => (
          <TagPill
            key={tag.label}
            label={tag.label}
            variant={tag.variant}
            icon={
              tag.icon === "shoppingBag" ? (
                <ShoppingBagIcon size={12} color="var(--color-success)" />
              ) : tag.icon === "eye" ? (
                <EyeIcon size={12} color="var(--color-brand-secondary)" />
              ) : undefined
            }
          />
        ))}
      </div>

      {/* Offer-led headline: the decision (cover vs cost) reads first; the
          category drops to an eyebrow the visitor already knows. */}
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{focus.eyebrow}</p>
        <h1 className={styles.title}>
          {focus.headlineCover} <span className={styles.price}>{focus.headlinePrice}</span>
        </h1>
        <p className={styles.subtitle}>{content.subtitle}</p>
        <CoverageTicker items={focus.coveredChips} />
      </div>

      <div className={styles.form}>
        <LeadFormCard
          content={content.leadForm}
          quoteModal={content.quoteModal}
          focus={{ privacyLine: focus.privacyLine }}
        />
      </div>

      {/* Proof at the point of action — our own figures, moved beside the CTA. */}
      <div className={styles.proof}>
        {content.stats.map((stat, i) => (
          <Fragment key={stat.label}>
            {i > 0 && <IkkatMark className={styles.sep} />}
            <span className={styles.stat}>
              <strong className={styles.statValue}>{stat.value}</strong> {stat.label}
            </span>
          </Fragment>
        ))}
      </div>

      <div className={styles.providers}>
        <p className={styles.providersHeading}>{content.leadForm.providersHeading}</p>
        <InsurerLogoShowcase slots={content.leadForm.providerShowcase} />
      </div>
    </main>
  );
}
