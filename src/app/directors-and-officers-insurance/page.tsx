import { getProductPageContent } from "@/lib/api/productPage";
import { BreadcrumbTrail } from "@/components/ui/BreadcrumbTrail";
import { IkkatLine } from "@/components/ui/IkkatLine";
import { ProductHeroLeft } from "@/components/features/product-hero/ProductHeroLeft";
import { MediaComposition } from "@/components/features/product-hero/MediaComposition";
import { LeadFormCard } from "@/components/features/product-hero/LeadFormCard";
import { InsurerLogoShowcase } from "@/components/ui/InsurerLogoShowcase";
import { ProductTicker } from "@/components/features/product-hero/ProductTicker";
import { HeroFlourish } from "@/components/features/product-hero/HeroFlourish";
import { LandingShell } from "@/components/features/product-hero/LandingShell";
import styles from "./page.module.css";

/** Director's & Officer's Insurance product page — Figma node 179:65816, hero fold. */
export default async function DirectorsAndOfficersInsurancePage() {
  const content = await getProductPageContent();

  return (
    <div className={styles.fold}>
      {/* LandingShell owns the navbar + a prototype toggle (Login) between this
          classic hero and the single-column "Focus" concept. */}
      <LandingShell
        content={content}
        foregroundClassName={styles.foreground}
        flourish={<HeroFlourish key="flourish" src={content.flourishSrc} />}
        ticker={
          <div key="ticker" className={styles.ticker}>
            <ProductTicker phrases={content.tickerPhrases} />
          </div>
        }
        classic={
          <main key="classic" className={styles.body}>
            <div className={styles.breadcrumbRow}>
              <IkkatLine className={styles.breadcrumbLine} />
              <BreadcrumbTrail items={content.breadcrumbs} />
            </div>
            <div className={styles.columns}>
              <ProductHeroLeft
                tags={content.tags}
                title={content.title}
                subtitle={content.subtitle}
                stats={content.stats}
              />
              <div className={styles.rightCol}>
                <div className={styles.mediaArea}>
                  <MediaComposition media={content.media} />
                </div>
                <LeadFormCard content={content.leadForm} quoteModal={content.quoteModal} />
                <div className={styles.providersArea}>
                  <p className={styles.providersHeading}>{content.leadForm.providersHeading}</p>
                  <InsurerLogoShowcase slots={content.leadForm.providerShowcase} />
                </div>
              </div>
            </div>
          </main>
        }
      />
    </div>
  );
}
