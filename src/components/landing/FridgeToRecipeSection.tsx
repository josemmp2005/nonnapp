/**
 * Sección de la landing sobre la idea de la nevera a la receta: ingredientes
 * sueltos que se convierten en un plato.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Logo } from '../Logo';
import { Reveal, RecipeMeta } from './shared';
import { IngredientIcon } from './IngredientIcon';
import { useIngredientLabels, type IngredientKey } from './ingredientData';
import { useInView } from '../../hooks/useInView';

const SCATTERED: { ingredient: IngredientKey; className: string; size: string }[] = [
  { ingredient: 'egg', className: 'top-[4%] left-[18%] rotate-[-8deg]', size: 'w-14 h-14' },
  { ingredient: 'tomato', className: 'top-[2%] right-[12%] rotate-[6deg]', size: 'w-16 h-16' },
  { ingredient: 'chicken', className: 'top-[34%] left-[2%] rotate-[4deg]', size: 'w-16 h-16' },
  { ingredient: 'cheese', className: 'top-[38%] right-[4%] rotate-[-5deg]', size: 'w-14 h-14' },
  { ingredient: 'broccoli', className: 'bottom-[8%] left-[22%] rotate-[3deg]', size: 'w-14 h-14' },
  { ingredient: 'rice', className: 'bottom-[2%] right-[22%] rotate-[-4deg]', size: 'w-16 h-16' },
  { ingredient: 'pasta', className: 'top-[64%] left-[42%] rotate-[7deg]', size: 'w-12 h-12' },
  { ingredient: 'onion', className: 'top-[10%] left-[46%] rotate-[-6deg]', size: 'w-12 h-12' },
];

const ScatteredIngredients: React.FC = () => {
  const { ref, isInView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="relative w-full aspect-square max-w-md mx-auto">
      {SCATTERED.map(({ ingredient, className, size }, i) => (
        <div
          key={ingredient}
          className={`absolute ${className} ${size} rounded-full bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 shadow-md flex items-center justify-center text-accent transition-all duration-700 ease-out motion-reduce:transition-none ${
            isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
          style={{ transitionDelay: isInView ? `${i * 80}ms` : '0ms' }}
        >
          <IngredientIcon ingredient={ingredient} className="w-1/2 h-1/2" />
        </div>
      ))}
    </div>
  );
};

const FridgeToRecipeSection: React.FC = () => {
  const { t } = useTranslation();
  const ingredientLabels = useIngredientLabels();

  return (
    <section id="que-tienes" className="bg-paper dark:bg-paper-dark border-t border-ink/10 dark:border-ink-light/10 py-16 md:py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <span className="block text-xs font-semibold text-primary mb-2.5">{t('landing.fridgeToRecipe.eyebrow')}</span>
          <h2 className="text-2xl md:text-[34px] font-extrabold tracking-tight text-ink dark:text-ink-light">
            {t('landing.fridgeToRecipe.title')}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScatteredIngredients />

          <Reveal delayMs={150}>
            <div className="bg-cream dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 rounded-2xl p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                {(['egg', 'tomato', 'cheese'] as const).map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface dark:bg-[#221B12] border border-ink/10 dark:border-ink-light/10 rounded-full text-xs font-medium text-body dark:text-body-dark shadow-sm"
                  >
                    <IngredientIcon ingredient={ing} className="w-3.5 h-3.5 text-accent" />
                    {ingredientLabels[ing]}
                  </span>
                ))}
              </div>

              <div className="flex justify-center mb-4">
                <ArrowDown className="w-5 h-5 text-accent/60" />
              </div>

              <div className="flex justify-center mb-4">
                <Logo className="w-9 h-9" textClassName="text-xl" />
              </div>

              <div className="flex justify-center mb-4">
                <ArrowDown className="w-5 h-5 text-accent/60" />
              </div>

              <div className="bg-surface dark:bg-[#221B12] rounded-xl p-4 shadow-sm border border-ink/5 dark:border-ink-light/10">
                <h3 className="font-bold text-ink dark:text-ink-light text-center mb-2">{t('landing.fridgeToRecipe.demoRecipeTitle')}</h3>
                <RecipeMeta time="20 min" difficulty={t('landing.fridgeToRecipe.difficultyEasy')} className="justify-center mb-3" />
                <div className="text-primary text-xs font-bold flex items-center justify-center gap-1">
                  {t('landing.fridgeToRecipe.viewRecipe')} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delayMs={250} className="text-center mt-12 md:mt-14">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
          >
            {t('landing.fridgeToRecipe.cta')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default FridgeToRecipeSection;
