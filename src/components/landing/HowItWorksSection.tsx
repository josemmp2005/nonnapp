import React from 'react';
import { ArrowRight, ArrowDown, Plus } from 'lucide-react';
import { SectionHeading, RecipeMeta, Reveal } from './shared';
import { IngredientIcon } from './IngredientIcon';
import { INGREDIENT_LABELS, type IngredientKey } from './ingredientData';
import CookingLoader from './CookingLoader';
import chickenBowl from '../../assets/tomato-soup.webp';

const STEP_INGREDIENTS: IngredientKey[] = ['avocado', 'chicken', 'rice', 'tomato', 'cheese', 'egg'];

const StepArrow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center text-primary/50 ${className}`}>
    <ArrowRight className="w-6 h-6 hidden lg:block" />
    <ArrowDown className="w-6 h-6 lg:hidden" />
  </div>
);

const HowItWorksSection: React.FC = () => (
  <section id="como-funciona" className="bg-[#FFFBF3] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
    <div className="max-w-6xl mx-auto px-6">
      <SectionHeading
        eyebrow="Cómo funciona"
        title={
          <>
            De "¿qué cocino hoy?" a tener<br className="hidden sm:block" /> la receta lista en segundos.
          </>
        }
        align="center"
        className="max-w-2xl mb-14 md:mb-16"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 lg:gap-4 items-stretch">
        {/* Paso 01 */}
        <Reveal className="flex flex-col bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-primary/70 tracking-widest mb-3">01</span>
          <h3 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] mb-1">Dinos qué tienes</h3>
          <p className="text-sm text-[#6B5D48] dark:text-[#9A8D74] mb-5">Añade lo que tengas por casa, sin listas complicadas.</p>

          <div className="mt-auto rounded-xl border border-dashed border-[#241B10]/15 dark:border-[#F5E6CD]/15 bg-[#FCF6EC] dark:bg-[#0D0A06] p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {STEP_INGREDIENTS.map((ing, i) => (
                <Reveal key={ing} delayMs={150 + i * 90} className="inline-block">
                  <span className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-full text-xs font-medium text-[#3A2E1D] dark:text-[#E7DCC5] shadow-sm">
                    <IngredientIcon ingredient={ing} className="w-3.5 h-3.5 text-primary" />
                    {INGREDIENT_LABELS[ing]}
                  </span>
                </Reveal>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B5D48] dark:text-[#9A8D74]">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </span>
              Añadir otro ingrediente...
            </div>
          </div>
        </Reveal>

        <StepArrow className="lg:pt-16" />

        {/* Paso 02 */}
        <Reveal delayMs={120} className="flex flex-col bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-primary/70 tracking-widest mb-3">02</span>
          <h3 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] mb-1">Nonnapp se pone a cocinar</h3>
          <p className="text-sm text-[#6B5D48] dark:text-[#9A8D74] mb-5">La IA piensa la combinación con lo que le has contado.</p>

          <div className="mt-auto rounded-xl bg-[#FCF6EC] dark:bg-[#0D0A06] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 flex-grow flex items-center justify-center py-2">
            <CookingLoader />
          </div>
        </Reveal>

        <StepArrow className="lg:pt-16" />

        {/* Paso 03 */}
        <Reveal delayMs={240} className="flex flex-col bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-primary/70 tracking-widest mb-3">03</span>
          <h3 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] mb-1">Tu receta está lista</h3>
          <p className="text-sm text-[#6B5D48] dark:text-[#9A8D74] mb-5">Pasos claros, raciones ajustadas, lista para cocinar.</p>

          <div className="mt-auto rounded-xl overflow-hidden border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm">
            <div className="h-28 overflow-hidden">
              <img src={chickenBowl} alt="Pollo mediterráneo con arroz" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 bg-white dark:bg-[#221B12]">
              <h4 className="font-bold text-[#241B10] dark:text-[#F8F2E6] text-sm mb-1.5">Pollo mediterráneo con arroz</h4>
              <RecipeMeta time="25 min" difficulty="Fácil" calories="540 kcal" className="mb-3" />
              <div className="text-primary text-xs font-bold flex items-center gap-1">
                Ver receta <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
