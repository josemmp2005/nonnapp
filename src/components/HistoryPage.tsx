import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Flame, ChevronRight, Loader2, Calendar, Filter, ArrowDownUp, Lock, Crown } from 'lucide-react';
import type { RecipeDB } from '../types';
import { fetchUserHistory } from '../services/supabase';
import { useSubscription } from '../context/SubscriptionContext';

interface Props {
  session: any;
}

const HistoryPage: React.FC<Props> = ({ session }) => {
  const [recipes, setRecipes] = useState<RecipeDB[]>([]);
  const [loading, setLoading] = useState(true);
  const { limits } = useSubscription();
  
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user?.id) {
      loadData(session.user.id);
    }
  }, [session]);

  const loadData = async (userId: string) => {
    setLoading(true);
    const data = await fetchUserHistory(userId);
    setRecipes(data);
    setLoading(false);
  };

  const filteredRecipes = (recipes || [])
    .filter(r => {
      const matchesSearch = 
        r.recipe_metadata?.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.recipe_metadata?.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesDifficulty = 
        difficulty === 'all' || 
        r.recipe_metadata?.difficulty?.toLowerCase() === difficulty.toLowerCase();

      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Limit history for free users (Nipote)
  const FREE_HISTORY_LIMIT = 3;
  const displayRecipes = limits.hasFullHistory 
    ? filteredRecipes 
    : filteredRecipes.slice(0, FREE_HISTORY_LIMIT);
  const hasMoreRecipes = !limits.hasFullHistory && filteredRecipes.length > FREE_HISTORY_LIMIT;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      
      <div className="mb-8 pr-32">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historial de Recetas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Explora todas las recetas que has creado</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ingredientes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all text-gray-900 dark:text-white"
          />
        </div>

        <div className="w-full md:w-48 relative">
           <select 
             value={difficulty}
             onChange={(e) => setDifficulty(e.target.value)}
             className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-gray-700 dark:text-gray-200 cursor-pointer"
           >
             <option value="all">Todas las dificultades</option>
             <option value="Fácil">Fácil</option>
             <option value="Media">Media</option>
             <option value="Difícil">Difícil</option>
           </select>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
             <Filter className="w-4 h-4" />
           </div>
        </div>

        <div className="w-full md:w-48 relative">
           <select 
             value={sortOrder}
             onChange={(e) => setSortOrder(e.target.value)}
             className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-gray-700 dark:text-gray-200 cursor-pointer"
           >
             <option value="newest">Más Recientes</option>
             <option value="oldest">Más Antiguas</option>
           </select>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
             <ArrowDownUp className="w-4 h-4" />
           </div>
        </div>

      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
           <div className="text-6xl mb-4">🍲</div>
           <h3 className="text-xl font-bold text-gray-900 dark:text-white">No se encontraron recetas</h3>
           <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Intenta ajustar los filtros o crea una nueva receta.</p>
           <button 
             onClick={() => navigate('/app')}
             className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
           >
             Crear Nueva Receta
           </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayRecipes.map((recipe) => (
            <div 
              key={recipe.id}
              onClick={() => navigate(`/app/recipe/${recipe.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden flex flex-col h-full"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                {recipe.main_image_url ? (
                  <img 
                    src={recipe.main_image_url} 
                    alt={recipe.recipe_metadata?.title || 'Receta'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-orange-50 dark:bg-orange-900/10 text-orange-200 dark:text-orange-900/50">
                      <span className="text-4xl">🍳</span>
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-xs font-medium">
                  <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" /> {recipe.recipe_metadata?.cooking_time || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Flame className="w-3 h-3 text-orange-400" /> {recipe.recipe_metadata?.calories || 0} kcal
                  </span>
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col">
                <div className="mb-3">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                     {recipe.recipe_metadata?.title || 'Receta sin título'}
                   </h3>
                   <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                     <Calendar className="w-3 h-3" />
                     {new Date(recipe.created_at || '').toLocaleDateString()}
                     <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                     <span className={`capitalize font-medium ${
                       recipe.recipe_metadata?.difficulty === 'Fácil' ? 'text-green-600 dark:text-green-400' :
                       recipe.recipe_metadata?.difficulty === 'Difícil' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                     }`}>
                       {recipe.recipe_metadata?.difficulty || 'Media'}
                     </span>
                   </div>
                </div>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                  {recipe.recipe_metadata?.description || 'Sin descripción'}
                </p>

                <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-sm font-medium text-primary">
                  <span>Ver Receta Completa</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade Banner for Free Users */}
        {hasMoreRecipes && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              Desbloquea tu Historial Completo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto">
              Tienes <strong>{filteredRecipes.length - FREE_HISTORY_LIMIT} recetas más</strong> esperándote. 
              Actualiza a <strong>La Mamma</strong> o <strong>La Nonna</strong> para acceder a todo tu historial de recetas.
            </p>
            <button
              onClick={() => navigate('/app/profile')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              Ver Planes Premium
            </button>
          </div>
        )}
      </>
      )}
    </div>
  );
};

export default HistoryPage;