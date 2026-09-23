import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SectionHeading, RecipeMeta, Reveal } from './shared';

interface ShowcaseRecipe {
  title: string;
  time: string;
  difficulty: string;
  image: string;
}

// Fotos reales (Unsplash) en vez de placeholders — misma estrategia que ya
// sigue el resto de la app (ChefTableWidget) para contenido de muestra.
const RECIPES: ShowcaseRecipe[] = [
  {
    title: 'Pasta cremosa de champiñones',
    time: '25 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Bowl mediterráneo de pollo',
    time: '20 min',
    difficulty: 'Saludable',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Tacos de pollo picante',
    time: '30 min',
    difficulty: 'Medio',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Risotto de verduras',
    time: '35 min',
    difficulty: 'Medio',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
  },
];

const RecipeShowcaseSection: React.FC = () => (
  <section className="bg-cream dark:bg-cream-dark py-16 md:py-24">
    <div className="max-w-6xl mx-auto px-6">
      <SectionHeading
        eyebrow="Recetas de ejemplo"
        title="Un chef diferente para cada día"
        align="center"
        className="max-w-xl mb-12 md:mb-14"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {RECIPES.map((recipe, i) => (
          <Reveal key={recipe.title} delayMs={i * 90}>
            <div className="group relative bg-surface dark:bg-surface-dark rounded-2xl border border-ink/10 dark:border-ink-light/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-ink dark:text-ink-light mb-2">{recipe.title}</h3>
                <div className="flex items-center justify-between">
                  <RecipeMeta time={recipe.time} difficulty={recipe.difficulty} />
                  <span className="text-primary text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                    Ver receta <ArrowRight className="w-3.5 h-3.5" />
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

export default RecipeShowcaseSection;
