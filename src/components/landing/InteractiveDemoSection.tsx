import React, { useMemo, useState } from 'react';
import { Check, Sparkles, RotateCcw } from 'lucide-react';
import { Reveal, RecipeMeta, SectionHeading } from './shared';
import { IngredientIcon } from './IngredientIcon';
import { INGREDIENT_LABELS, type IngredientKey } from './ingredientData';

const OPTIONS: IngredientKey[] = ['chicken', 'rice', 'tomato', 'cheese', 'egg', 'broccoli', 'pasta', 'onion'];

interface CannedResult {
  title: string;
  time: string;
  difficulty: string;
}

// Resultados predefinidos — esta demo es puramente ilustrativa (sin llamada
// real a la IA, así se indica de forma implícita al no pedir cuenta ni
// mostrar un botón que lleve a generar de verdad). Coincidencia por
// combinación exacta cuando existe; si no, un título genérico construido
// con los ingredientes elegidos, para que nunca se sienta "vacío".
const CANNED: { match: IngredientKey[]; result: CannedResult }[] = [
  { match: ['chicken', 'rice', 'broccoli'], result: { title: 'Pollo teriyaki con arroz y brócoli', time: '25 min', difficulty: 'Fácil' } },
  { match: ['tomato', 'cheese', 'pasta'], result: { title: 'Pasta con tomate y queso fundido', time: '20 min', difficulty: 'Fácil' } },
  { match: ['egg', 'tomato', 'onion'], result: { title: 'Shakshuka mediterránea', time: '20 min', difficulty: 'Fácil' } },
  { match: ['chicken', 'onion', 'rice'], result: { title: 'Arroz de pollo con cebolla caramelizada', time: '30 min', difficulty: 'Media' } },
  { match: ['cheese', 'egg', 'broccoli'], result: { title: 'Tortilla de brócoli y queso', time: '15 min', difficulty: 'Fácil' } },
];

const buildFallbackResult = (selected: IngredientKey[]): CannedResult => {
  const names = selected.map((i) => INGREDIENT_LABELS[i].toLowerCase());
  const joined =
    names.length <= 1 ? names[0] : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
  return {
    title: `Sorpresa de la Nonna con ${joined}`,
    time: '25 min',
    difficulty: 'Fácil',
  };
};

const getResult = (selected: IngredientKey[]): CannedResult => {
  const set = new Set(selected);
  const found = CANNED.find((c) => c.match.every((m) => set.has(m)) && c.match.length === selected.length);
  return found ? found.result : buildFallbackResult(selected);
};

type Phase = 'idle' | 'loading' | 'result';

const InteractiveDemoSection: React.FC = () => {
  const [selected, setSelected] = useState<IngredientKey[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');

  const toggle = (ing: IngredientKey) => {
    if (phase !== 'idle') return;
    setSelected((prev) => (prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]));
  };

  const result = useMemo(() => (phase === 'result' ? getResult(selected) : null), [phase, selected]);

  const handleGenerate = () => {
    if (selected.length === 0) return;
    setPhase('loading');
    setTimeout(() => setPhase('result'), 950);
  };

  const reset = () => {
    setPhase('idle');
    setSelected([]);
  };

  return (
    <section className="bg-[#FCF6EC] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading
          eyebrow="Pruébalo tú mismo"
          title="¿Qué tienes en casa?"
          subtitle="Elige un par de ingredientes y mira cómo Nonnapp los convierte en una receta (demo ilustrativa, sin necesidad de cuenta)."
          align="center"
          className="mb-10"
        />

        <Reveal className="bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-2xl p-6 md:p-8 shadow-sm">
          {phase !== 'result' ? (
            <>
              <div className="flex flex-wrap justify-center gap-2.5 mb-8">
                {OPTIONS.map((ing) => {
                  const isSelected = selected.includes(ing);
                  return (
                    <button
                      key={ing}
                      type="button"
                      onClick={() => toggle(ing)}
                      disabled={phase === 'loading'}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-md scale-105'
                          : 'border-[#241B10]/10 dark:border-[#F5E6CD]/15 text-[#3A2E1D] dark:text-[#D4D4D8] hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    >
                      <IngredientIcon ingredient={ing} className="w-4 h-4" />
                      {INGREDIENT_LABELS[ing]}
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                {phase === 'loading' ? (
                  <div className="flex items-center gap-3 text-[#5C4E3A] dark:text-[#A89C86] font-medium text-sm py-3">
                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full motion-safe:animate-spin" />
                    Pensando qué cocinar...
                  </div>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={selected.length === 0}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-primary hover:bg-orange-600 disabled:bg-[#241B10]/10 dark:disabled:bg-[#F5E6CD]/10 disabled:text-[#6B5D48] disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generar receta
                  </button>
                )}
              </div>
            </>
          ) : (
            result && (
              <div className="animate-in fade-in zoom-in-95 duration-300 text-center py-2">
                <div className="flex flex-wrap justify-center gap-2 mb-5">
                  {selected.map((ing) => (
                    <span key={ing} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      <IngredientIcon ingredient={ing} className="w-3 h-3" />
                      {INGREDIENT_LABELS[ing]}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">{result.title}</h3>
                <RecipeMeta time={result.time} difficulty={result.difficulty} className="justify-center mb-6" />
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  <RotateCcw className="w-4 h-4" />
                  Probar con otros ingredientes
                </button>
              </div>
            )
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;
