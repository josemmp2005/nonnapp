import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Logo } from '../Logo';
import { Reveal, RecipeMeta } from './shared';
import { IngredientIcon } from './IngredientIcon';
import { INGREDIENT_LABELS, type IngredientKey } from './ingredientData';
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
          className={`absolute ${className} ${size} rounded-full bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-md flex items-center justify-center text-primary transition-all duration-700 ease-out motion-reduce:transition-none ${
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

const FridgeToRecipeSection: React.FC = () => (
  <section className="bg-white dark:bg-[#0D0A06] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
    <div className="max-w-6xl mx-auto px-6">
      <Reveal className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
        <span className="block text-xs font-semibold text-primary mb-2.5">De la nevera al plato</span>
        <h2 className="text-2xl md:text-[34px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">
          Abre la nevera. Nonnapp hace el resto.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <ScatteredIngredients />

        <Reveal delayMs={150}>
          <div className="bg-[#FCF6EC] dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-2xl p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {(['egg', 'tomato', 'cheese'] as const).map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#221B12] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-full text-xs font-medium text-[#3A2E1D] dark:text-[#E7DCC5] shadow-sm"
                >
                  <IngredientIcon ingredient={ing} className="w-3.5 h-3.5 text-primary" />
                  {INGREDIENT_LABELS[ing]}
                </span>
              ))}
            </div>

            <div className="flex justify-center mb-4">
              <ArrowDown className="w-5 h-5 text-primary/60" />
            </div>

            <div className="flex justify-center mb-4">
              <Logo className="w-9 h-9" textClassName="text-xl" />
            </div>

            <div className="flex justify-center mb-4">
              <ArrowDown className="w-5 h-5 text-primary/60" />
            </div>

            <div className="bg-white dark:bg-[#221B12] rounded-xl p-4 shadow-sm border border-[#241B10]/5 dark:border-[#F5E6CD]/10">
              <h3 className="font-bold text-[#241B10] dark:text-[#F8F2E6] text-center mb-2">Shakshuka mediterránea</h3>
              <RecipeMeta time="20 min" difficulty="Fácil" className="justify-center mb-3" />
              <div className="text-primary text-xs font-bold flex items-center justify-center gap-1">
                Ver receta <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default FridgeToRecipeSection;
