import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { SectionHeading, RecipeMeta, Reveal } from './shared';

interface ShowcaseRecipe {
  title: string;
  difficulty: string;
}

// Fotos reales (Unsplash) en vez de placeholders — misma estrategia que ya
// sigue el resto de la app (ChefTableWidget) para contenido de muestra. Los
// tiempos son independientes del idioma ("min" se entiende igual en los 4);
// título y dificultad sí están en landing.recipeShowcase.recipes.
const IMAGES = [
  'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
];
const TIMES = ['25 min', '20 min', '30 min', '35 min'];

const RecipeShowcaseSection: React.FC = () => {
  const { t } = useTranslation();
  const recipes = t('landing.recipeShowcase.recipes', { returnObjects: true }) as ShowcaseRecipe[];

  return (
    <section id="recetas" className="scroll-mt-20 bg-cream dark:bg-cream-dark py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          eyebrow={t('landing.recipeShowcase.eyebrow')}
          title={t('landing.recipeShowcase.title')}
          align="center"
          className="max-w-xl mb-12 md:mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {recipes.map((recipe, i) => (
            <Reveal key={recipe.title} delayMs={i * 90}>
              <div className="group relative bg-surface dark:bg-surface-dark rounded-2xl border border-ink/10 dark:border-ink-light/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={IMAGES[i]}
                    alt={recipe.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-ink dark:text-ink-light mb-2">{recipe.title}</h3>
                  <div className="flex items-center justify-between">
                    <RecipeMeta time={TIMES[i]} difficulty={recipe.difficulty} />
                    <span className="text-primary text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                      {t('landing.recipeShowcase.viewRecipe')} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecipeShowcaseSection;
