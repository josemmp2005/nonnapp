/**
 * Demo interactiva de la landing: se eligen ingredientes y aparece una receta
 * simulada (temporizador, sin llamar a la IA).
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Sparkles, RotateCcw } from 'lucide-react';
import { Reveal, RecipeMeta, SectionHeading } from './shared';
import { IngredientIcon } from './IngredientIcon';
import { useIngredientLabels, type IngredientKey } from './ingredientData';

const OPTIONS: IngredientKey[] = ['chicken', 'rice', 'tomato', 'cheese', 'egg', 'broccoli', 'pasta', 'onion'];

interface CannedResult {
  title: string;
  difficulty: string;
}

// Combinaciones y tiempos fijos — el título/dificultad viene traducido de
// landing.interactiveDemo.canned (mismo orden); el tiempo es independiente
// del idioma. Coincidencia por combinación exacta cuando existe; si no, un
// título genérico construido con los ingredientes elegidos (fallbackTitle),
// para que nunca se sienta "vacío".
const CANNED_MATCHES: { match: IngredientKey[]; time: string }[] = [
  { match: ['chicken', 'rice', 'broccoli'], time: '25 min' },
  { match: ['tomato', 'cheese', 'pasta'], time: '20 min' },
  { match: ['egg', 'tomato', 'onion'], time: '20 min' },
  { match: ['chicken', 'onion', 'rice'], time: '30 min' },
  { match: ['cheese', 'egg', 'broccoli'], time: '15 min' },
];

type Phase = 'idle' | 'loading' | 'result';

interface ResolvedResult {
  title: string;
  difficulty: string;
  time: string;
}

const InteractiveDemoSection: React.FC = () => {
  const { t } = useTranslation();
  const ingredientLabels = useIngredientLabels();
  const canned = t('landing.interactiveDemo.canned', { returnObjects: true }) as CannedResult[];
  const [selected, setSelected] = useState<IngredientKey[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');

  const toggle = (ing: IngredientKey) => {
    if (phase !== 'idle') return;
    setSelected((prev) => (prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]));
  };

  const getResult = useCallback(
    (sel: IngredientKey[]): ResolvedResult => {
      const set = new Set(sel);
      const index = CANNED_MATCHES.findIndex((c) => c.match.every((m) => set.has(m)) && c.match.length === sel.length);
      if (index !== -1) return { ...canned[index], time: CANNED_MATCHES[index].time };

      const names = sel.map((i) => ingredientLabels[i].toLowerCase());
      const joined = names.length <= 1 ? names[0] : `${names.slice(0, -1).join(', ')} ${t('landing.interactiveDemo.and')} ${names[names.length - 1]}`;
      return { title: t('landing.interactiveDemo.fallbackTitle', { ingredients: joined }), difficulty: canned[0].difficulty, time: '25 min' };
    },
    [canned, ingredientLabels, t]
  );

  const result = useMemo(() => (phase === 'result' ? getResult(selected) : null), [phase, selected, getResult]);

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
    <section className="bg-paper dark:bg-paper-dark border-t border-ink/10 dark:border-ink-light/10 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading
          eyebrow={t('landing.interactiveDemo.eyebrow')}
          title={t('landing.interactiveDemo.title')}
          subtitle={t('landing.interactiveDemo.subtitle')}
          align="center"
          className="mb-10"
        />

        <Reveal className="bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 rounded-2xl p-6 md:p-8 shadow-sm">
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
                          : 'border-ink/10 dark:border-ink-light/15 text-body dark:text-body-dark hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    >
                      <IngredientIcon ingredient={ing} className="w-4 h-4" />
                      {ingredientLabels[ing]}
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                {phase === 'loading' ? (
                  <div className="flex items-center gap-3 text-muted dark:text-muted-dark font-medium text-sm py-3">
                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full motion-safe:animate-spin" />
                    {t('landing.interactiveDemo.loading')}
                  </div>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={selected.length === 0}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-primary hover:bg-primary-600 disabled:bg-ink/10 dark:disabled:bg-ink-light/10 disabled:text-muted disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t('landing.interactiveDemo.generate')}
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
                      {ingredientLabels[ing]}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-ink dark:text-ink-light mb-2">{result.title}</h3>
                <RecipeMeta time={result.time} difficulty={result.difficulty} className="justify-center mb-6" />
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('landing.interactiveDemo.reset')}
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
