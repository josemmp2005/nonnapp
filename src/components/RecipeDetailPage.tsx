/**
 * Página `/app/recipe/:id`: detalle de una receta guardada, solo visible para
 * quien la creó.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import RecipeDisplay from './RecipeDisplay';
import LoadingOverlay from './LoadingOverlay';
import { getFullRecipeById } from '../services/data';
import type{ RecipeDB } from '../types';

const RecipeDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [recipe, setRecipe] = useState<RecipeDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      // 1. Check if recipe data was passed via navigation (Featured Recipes)
      if (location.state && location.state.recipeData) {
        setRecipe(location.state.recipeData);
        setLoading(false);
        return;
      }

      // 2. Fetch from DB
      if (!id) return;
      setLoading(true);
      const data = await getFullRecipeById(id);
      if (data) {
        setRecipe(data);
      } else {
        setError(t('app.recipeDetail.notFoundError'));
      }
      setLoading(false);
    };

    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.state]);

  if (loading) {
    return <LoadingOverlay isVisible={true} />;
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-ink mb-2">Error</h2>
        <p className="text-muted mb-6">{error || t('app.recipeDetail.genericError')}</p>
        <button
          onClick={() => navigate('/app/history')}
          className="text-primary font-bold hover:underline"
        >
          {t('app.recipeDetail.backToHistory')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted hover:text-ink dark:hover:text-white mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('app.recipeDetail.back')}
      </button>

      <RecipeDisplay 
        recipe={recipe} 
        imageUrl={recipe.main_image_url || null}
        onGenerateAgain={() => navigate('/app')} 
      />
    </div>
  );
};

export default RecipeDetailPage;