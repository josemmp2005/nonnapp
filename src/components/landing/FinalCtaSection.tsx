/**
 * Última sección de la landing: llamada final a registrarse.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChefHat, ArrowRight } from 'lucide-react';
import { IngredientIcon } from './IngredientIcon';
import { Reveal } from './shared';

const FinalCtaSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative border-t border-white/10 bg-surface-dark py-20 md:py-28 text-center overflow-hidden">
      <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 w-[560px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(242,139,60,0.14)_0%,rgba(242,139,60,0)_72%)]" />

      {/* Ingredientes decorativos, parcialmente cortados por los bordes */}
      <IngredientIcon ingredient="tomato" className="hidden sm:block absolute -left-6 top-10 w-24 h-24 text-white/[0.06] rotate-[-8deg]" />
      <IngredientIcon ingredient="avocado" className="hidden sm:block absolute -right-8 top-1/3 w-28 h-28 text-white/[0.06] rotate-[10deg]" />
      <IngredientIcon ingredient="onion" className="hidden sm:block absolute left-8 -bottom-8 w-24 h-24 text-white/[0.06] rotate-[6deg]" />
      <IngredientIcon ingredient="broccoli" className="hidden sm:block absolute -right-6 -bottom-6 w-28 h-28 text-white/[0.06] rotate-[-10deg]" />

      <div className="max-w-xl mx-auto px-6 relative z-10">
        <Reveal>
          <h2 className="mb-5 text-3xl md:text-[40px] font-extrabold tracking-tight leading-tight text-white">
            {t('landing.finalCta.title')}
          </h2>
          <p className="mb-9 text-sm md:text-base text-white/60 max-w-md mx-auto">
            {t('landing.finalCta.subtitle')}
          </p>
          <Link
            to="/app"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-white text-base font-bold rounded-xl shadow-lg shadow-black/20 hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
          >
            <ChefHat className="w-5 h-5" />
            {t('landing.finalCta.cta')}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <p className="mt-5 text-xs text-white/40">{t('landing.finalCta.note')}</p>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCtaSection;
