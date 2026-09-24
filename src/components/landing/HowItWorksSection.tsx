import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { SectionHeading, Reveal, NonnaAvatar } from './shared';
import { IngredientIcon } from './IngredientIcon';
import { useIngredientLabels, type IngredientKey } from './ingredientData';
import CookingLoader from './CookingLoader';

const STEP_INGREDIENTS: IngredientKey[] = ['tomato', 'cheese', 'egg'];

// Solo en desktop: en móvil los 3 pasos ya se leen como secuencia al ir
// apilados en una columna, con los círculos numerados como única guía.
const StepArrow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`hidden lg:flex items-center justify-center text-accent/50 ${className}`}>
    <ArrowRight className="w-6 h-6" />
  </div>
);

const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();
  const ingredientLabels = useIngredientLabels();

  return (
    <section id="como-funciona" className="bg-cream dark:bg-cream-dark py-16 md:py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          eyebrow={t('landing.howItWorks.eyebrow')}
          title={t('landing.howItWorks.title')}
          align="center"
          className="max-w-2xl mb-14 md:mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-10 lg:gap-4 items-start">
          {/* Paso 01 */}
          <Reveal className="flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent text-lg font-display font-semibold mb-5">1</span>
            <h3 className="text-lg font-bold text-ink dark:text-ink-light mb-1.5">{t('landing.howItWorks.step1.title')}</h3>
            <p className="text-sm text-muted dark:text-muted-dark mb-5 max-w-[220px]">{t('landing.howItWorks.step1.text')}</p>
            <div className="flex items-center gap-2">
              {STEP_INGREDIENTS.map((ing) => (
                <span
                  key={ing}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 shadow-sm text-accent"
                  title={ingredientLabels[ing]}
                >
                  <IngredientIcon ingredient={ing} className="w-4 h-4" />
                </span>
              ))}
            </div>
          </Reveal>

          <StepArrow className="lg:pt-14" />

          {/* Paso 02 */}
          <Reveal delayMs={120} className="flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent text-lg font-display font-semibold mb-5">2</span>
            <h3 className="text-lg font-bold text-ink dark:text-ink-light mb-1.5">{t('landing.howItWorks.step2.title')}</h3>
            <p className="text-sm text-muted dark:text-muted-dark mb-1 max-w-[220px]">{t('landing.howItWorks.step2.text')}</p>
            <div className="scale-90">
              <CookingLoader />
            </div>
          </Reveal>

          <StepArrow className="lg:pt-14" />

          {/* Paso 03 */}
          <Reveal delayMs={240} className="flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent text-lg font-display font-semibold mb-5">3</span>
            <h3 className="text-lg font-bold text-ink dark:text-ink-light mb-1.5">{t('landing.howItWorks.step3.title')}</h3>
            <p className="text-sm text-muted dark:text-muted-dark mb-5 max-w-[220px]">{t('landing.howItWorks.step3.text')}</p>
            <NonnaAvatar pose="wink" className="w-16 h-16 shadow-sm" />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
