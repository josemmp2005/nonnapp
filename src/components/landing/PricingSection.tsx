/**
 * Sección de planes de la landing: Il Nipote, La Mamma y La Nonna con sus
 * ventajas.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from './shared';

const PricingSection: React.FC = () => {
  const { t } = useTranslation();
  const mammaFeatures = t('landing.pricing.mamma.features', { returnObjects: true }) as string[];
  const nonnaFeatures = t('landing.pricing.nonna.features', { returnObjects: true }) as string[];

  return (
    <section id="planes" className="scroll-mt-20 landing-grain bg-cream dark:bg-cream-dark border-t border-ink/10 dark:border-ink-light/10 py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-14">
          <span className="block text-xs font-semibold text-primary mb-2.5">{t('landing.pricing.eyebrow')}</span>
          <h2 className="mb-3 text-2xl md:text-[34px] font-extrabold tracking-tight text-ink dark:text-ink-light">{t('landing.pricing.title')}</h2>
          <p className="text-sm text-muted dark:text-muted-dark">{t('landing.pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">

          {/* Il Nipote */}
          <div className="bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 p-8 rounded-xl flex flex-col transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2">
            <h3 className="mb-1 text-base font-semibold text-ink dark:text-ink-light">Il Nipote</h3>
            <p className="mb-5 text-xs text-muted dark:text-muted-dark">{t('landing.pricing.nipote.tagline')}</p>
            <div className="mb-6 text-3xl font-bold tracking-tight text-ink dark:text-ink-light">{t('landing.pricing.nipote.price')}</div>
            <div className="flex flex-col gap-3 mb-7 flex-grow">
              <div className="flex items-center gap-2.5 text-[13px] text-body dark:text-body-dark">
                <CheckIcon className="w-3.5 h-3.5 text-primary" /> {t('landing.pricing.nipote.feature1')}
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-body dark:text-body-dark">
                <CheckIcon className="w-3.5 h-3.5 text-primary" /> {t('landing.pricing.nipote.feature2')}
              </div>
              <div className="text-[13px] text-muted dark:text-muted-dark line-through">{t('landing.pricing.nipote.featureLocked')}</div>
            </div>
            <Link to="/app" className="text-center py-2.5 rounded-lg border border-ink/15 dark:border-ink-light/15 text-ink dark:text-ink-light text-sm font-semibold hover:bg-ink/[0.03] dark:hover:bg-white/5 hover:border-primary/40 active:scale-95 transition-all duration-300">
              {t('landing.pricing.nipote.cta')}
            </Link>
          </div>

          {/* La Mamma — always dark, brand-forward */}
          <div className="bg-surface-dark border border-primary/50 p-8 rounded-xl flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 md:scale-[1.02] hover:md:scale-[1.05]">
            <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-primary text-cream-dark text-[10px] font-bold tracking-wide uppercase rounded">{t('landing.pricing.mamma.badge')}</div>
            <h3 className="mb-1 text-lg font-semibold text-ink-light">La Mamma</h3>
            <p className="mb-5 text-xs text-muted-dark">{t('landing.pricing.mamma.tagline')}</p>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-[34px] font-bold tracking-tight text-ink-light">{t('landing.pricing.mamma.price')}</span>
              <span className="text-xs text-muted-dark">{t('landing.pricing.mamma.priceSuffix')}</span>
            </div>
            <div className="flex flex-col gap-3 mb-7 flex-grow">
              {mammaFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-[13px] text-body-dark font-medium">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" /> {feature}
                </div>
              ))}
            </div>
            <Link to="/auth" className="text-center py-3 rounded-lg bg-primary text-cream-dark text-sm font-semibold shadow-lg shadow-primary/30 hover:bg-primary-400 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-300">
              {t('landing.pricing.mamma.cta')}
            </Link>
          </div>

          {/* La Nonna */}
          <div className="bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 p-8 rounded-xl flex flex-col transition-all duration-300 hover:border-gold/40 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2">
            <h3 className="mb-1 text-base font-semibold text-ink dark:text-ink-light flex items-center gap-1.5">
              La Nonna
              <svg className="w-3.5 h-3.5 text-gold dark:text-gold-light" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l-1.5-9L8 12l4-8 4 8 5.5-3L20 18z" /></svg>
            </h3>
            <p className="mb-5 text-xs text-muted dark:text-muted-dark">{t('landing.pricing.nonna.tagline')}</p>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-[30px] font-bold tracking-tight text-ink dark:text-ink-light">{t('landing.pricing.nonna.price')}</span>
              <span className="text-xs text-muted dark:text-muted-dark">{t('landing.pricing.nonna.priceSuffix')}</span>
            </div>
            <div className="flex flex-col gap-3 mb-7 flex-grow">
              <div className="flex items-center gap-2.5 text-[13px] text-body dark:text-body-dark font-medium">
                <svg className="w-3.5 h-3.5 text-gold dark:text-gold-light" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6L12 2z" /></svg>
                {t('landing.pricing.nonna.includesMamma')}
              </div>
              {nonnaFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-[13px] text-body dark:text-body-dark">
                  <CheckIcon className="w-3.5 h-3.5 text-gold dark:text-gold-light" /> {feature}
                </div>
              ))}
            </div>
            <Link to="/auth" className="text-center py-2.5 rounded-lg border border-gold/50 dark:border-gold-light/50 text-gold dark:text-gold-light text-sm font-semibold hover:bg-gold/5 dark:hover:bg-gold-light/5 active:scale-95 transition-all duration-300">
              {t('landing.pricing.nonna.cta')}
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;
