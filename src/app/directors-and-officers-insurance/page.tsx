import { getProductPageContent } from "@/lib/api/productPage";
import { getQuotesPageContent } from "@/lib/api/quotesPage";
import type { QuotesPreview } from "@/types/quotesPage";
import { BreadcrumbTrail } from "@/components/ui/BreadcrumbTrail";
import { IkkatLine } from "@/components/ui/IkkatLine";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { ProductHeroLeft } from "@/components/features/product-hero/ProductHeroLeft";
import { MediaComposition } from "@/components/features/product-hero/MediaComposition";
import { LeadFormCard } from "@/components/features/product-hero/LeadFormCard";
import { InsurerLogoShowcase } from "@/components/ui/InsurerLogoShowcase";
import { ProductTicker } from "@/components/features/product-hero/ProductTicker";
import { HeroFlourish } from "@/components/features/product-hero/HeroFlourish";
import { LandingShell } from "@/components/features/product-hero/LandingShell";
import { cn } from "@/lib/utils";
import styles from "./page.module.css";

/** Directors & Officers Insurance product page — Figma node 179:65816, hero fold. */
export default async function DirectorsAndOfficersInsurancePage() {
  const [content, quotes] = await Promise.all([getProductPageContent(), getQuotesPageContent()]);
  // Enough of the Quotes page to draw its skeleton behind the quote modal.
  const countFor = (c: "A" | "B" | "C") =>
    (quotes.feed.quotesByCase?.[c] ?? quotes.feed.quotes).length + (c === "B" ? 1 : 0);
  const quotesPreview: QuotesPreview = {
    header: quotes.header,
    rowCount: quotes.detailsPanel.rows.length,
    cardCounts: { A: countFor("A"), B: countFor("B"), C: countFor("C") },
  };

  return (
    <div className={styles.fold}>
      {/* LandingShell owns the navbar + a prototype toggle (Login) between this
          classic hero and the single-column "Focus" concept. */}
      <LandingShell
        content={content}
        foregroundClassName={styles.foreground}
        quotesPreview={quotesPreview}
        flourish={<HeroFlourish key="flourish" src={content.flourishSrc} />}
        ticker={
          <div key="ticker" className={styles.ticker}>
            <ProductTicker phrases={content.tickerPhrases} />
          </div>
        }
        classic={
          <main key="classic" className={styles.body}>
            <div className={styles.breadcrumbRow}>
              {/* Web: the masked line. Mobile: marks counted to the width and
                  spaced evenly (the line's whole tiles leave one big gap
                  when only two fit). */}
              <IkkatLine className={cn(styles.breadcrumbLine, styles.webOnly)} />
              <IkkatDivider unit={22} className={cn(styles.breadcrumbLine, styles.breadcrumbMarks)} />
              <BreadcrumbTrail items={content.breadcrumbs} />
            </div>
            <div className={styles.columns}>
              <ProductHeroLeft
                eyebrow={content.focusHero.eyebrow}
                tags={content.tags}
                title={content.title}
                subtitle={content.subtitle}
                stats={content.stats}
                coverage={{ items: content.focusHero.coveredChips, iconSrc: content.focusHero.coveredIconSrc }}
              />
              <div className={styles.rightCol}>
                <LeadFormCard
                  content={content.leadForm}
                  quoteModal={content.quoteModal}
                  quotesPreview={quotesPreview}
                  topSlot={<MediaComposition media={content.media} />}
                  bottomSlot={
                    <div className={styles.providersArea}>
                      <p className={styles.providersHeading}>{content.leadForm.providersHeading}</p>
                      <InsurerLogoShowcase slots={content.leadForm.providerShowcase} />
                    </div>
                  }
                />
              </div>
            </div>
          </main>
        }
      />
    </div>
  );
}
