import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RecipeDisplay from './RecipeDisplay';
import LoadingOverlay from './LoadingOverlay';
import { getFullRecipeById } from '../services/data';
import type{ RecipeDB } from '../types';

const RecipeDetailPage: React.FC = () => {
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
        setError("Receta no encontrada.");
      }
      setLoading(false);
    };

    fetchRecipe();
  }, [id, location.state]);

  if (loading) {
    return <LoadingOverlay isVisible={true} />;
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#241B10] mb-2">Error</h2>
        <p className="text-[#8C7C63] mb-6">{error || 'No se pudo cargar la receta.'}</p>
        <button 
          onClick={() => navigate('/app/history')}
          className="text-primary font-bold hover:underline"
        >
          Volver al historial
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#8C7C63] hover:text-[#241B10] dark:hover:text-white mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
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