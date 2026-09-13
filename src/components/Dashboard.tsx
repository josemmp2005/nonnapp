
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryList from './HistoryList';
import { fetchRecentRecipes } from '../services/supabase';
import type { UserProfile as UserProfileType, RecipeDB } from '../types';
import { Sparkles, Coffee, Zap, Utensils, ArrowRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import ChefTableWidget from './ChefTableWidget';

interface Props {
  userProfile: UserProfileType;
  session: any;
}

const Dashboard: React.FC<Props> = ({ session }) => {
  const navigate = useNavigate();
  const { subscription, limits, checkRecipeLimit } = useSubscription();
  const [recentRecipes, setRecentRecipes] = useState<RecipeDB[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [quickInput, setQuickInput] = useState('');
  
  // Saludo basado en la hora
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
    
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsHistoryLoading(true);
    const history = await fetchRecentRecipes();
    setRecentRecipes(history);
    setIsHistoryLoading(false);
  };

  const handleQuickInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    navigate('/app/generate', { 
        state: { 
            autoTrigger: true,
            prompt: quickInput,
            mode: 'text'
        } 
    });
  };

  const handleHistorySelect = (recipe: RecipeDB) => {
    navigate(`/app/recipe/${recipe.id}`);
  };

  const triggerQuickAction = (action: string) => {
    let prompt = "";
    let timeLimit = "unlimited";

    if (action === 'breakfast') {
        prompt = "Un desayuno energético, saludable y rápido para empezar el día.";
        timeLimit = "15 minutes";
    } else if (action === 'surprise') {
        prompt = "Sorpréndeme con una receta exótica de cualquier parte del mundo. Algo que probablemente no haya cocinado antes.";
    } else if (action === 'healthy') {
        prompt = "Una cena ligera, baja en carbohidratos, alta en proteínas y llena de sabor.";
    }

    navigate('/app/generate', { 
        state: { 
            autoTrigger: true,
            prompt,
            mode: 'text',
            timeLimit
        } 
    });
  };

  const username = session?.user?.user_metadata?.username || 'Chef';

  // Calcular recetas restantes hoy
  const { remaining } = checkRecipeLimit();
  const planNames: Record<string, string> = {
    'Nipote': 'Nipote',
    'Mamma': 'La Mamma',
    'Nonna': 'La Nonna'
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 animate-in fade-in duration-500 space-y-10">
      
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {greeting}, <span className="text-primary">{username}</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Tu cocina inteligente está lista.
                </p>
            </div>
            
            {/* Mini Stats */}
            <div className="flex gap-3">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center min-w-[80px]">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {limits.maxRecipesPerDay === Infinity ? '∞' : remaining}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      {limits.maxRecipesPerDay === Infinity ? 'Recetas' : 'Hoy'}
                    </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center min-w-[80px]">
                    <span className="text-2xl font-bold text-primary flex items-center gap-1">
                        {planNames[subscription.plan_type]}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Plan</span>
                </div>
            </div>
        </div>

        {/* Hero Search Input */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">¿Qué tienes en mente hoy?</h2>
                <form onSubmit={handleQuickInputSubmit} className="relative">
                    <input 
                        type="text" 
                        value={quickInput}
                        onChange={(e) => setQuickInput(e.target.value)}
                        placeholder="Ej: Pasta con champiñones, algo con pollo..." 
                        className="w-full pl-6 pr-14 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-primary hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button onClick={() => setQuickInput("Desayuno saludable")} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">Desayuno saludable</button>
                    <button onClick={() => setQuickInput("Cena romántica")} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">Cena romántica</button>
                    <button onClick={() => setQuickInput("Huevos, tomate, arroz")} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">Modo Despensa</button>
                </div>
            </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <button 
                 onClick={() => triggerQuickAction('surprise')}
                 className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-200 dark:shadow-none hover:scale-[1.02] transition-transform text-left relative overflow-hidden group"
               >
                  <div className="relative z-10">
                      <Sparkles className="w-6 h-6 mb-2 text-purple-100" />
                      <span className="font-bold block">Sorpréndeme</span>
                      <span className="text-xs text-purple-100 opacity-80">Algo nuevo hoy</span>
                  </div>
                  <Sparkles className="absolute -right-4 -bottom-4 w-20 h-20 text-white opacity-10 group-hover:rotate-12 transition-transform" />
               </button>

               <button 
                 onClick={() => triggerQuickAction('breakfast')}
                 className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white shadow-sm hover:border-orange-200 dark:hover:border-orange-900 hover:bg-orange-50 dark:hover:bg-gray-750 transition-all text-left group"
               >
                  <Coffee className="w-6 h-6 mb-2 text-orange-500" />
                  <span className="font-bold block">Desayuno Rápido</span>
                  <span className="text-xs text-gray-400">Listo en 15 min</span>
               </button>

               <button 
                 onClick={() => triggerQuickAction('healthy')}
                 className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white shadow-sm hover:border-green-200 dark:hover:border-green-900 hover:bg-green-50 dark:hover:bg-gray-750 transition-all text-left group"
               >
                  <Zap className="w-6 h-6 mb-2 text-green-500" />
                  <span className="font-bold block">Modo Fit</span>
                  <span className="text-xs text-gray-400">Bajo en calorías</span>
               </button>

               <button 
                  onClick={() => navigate('/app/generate')}
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
               >
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center mb-2">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Generador Avanzado</span>
               </button>
            </div>
        </div>

        {/* Chef Table Widget */}
        <ChefTableWidget isLocked={!limits.hasChefChat} />
        
        {/* Recent History */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tus Creaciones Recientes</h3>
                <button onClick={() => navigate('/app/history')} className="text-sm text-primary hover:underline">Ver todo</button>
            </div>
            <HistoryList 
              recipes={recentRecipes} 
              isLoading={isHistoryLoading}
              onSelect={handleHistorySelect} 
            />
        </div>
    </div>
  );
};

export default Dashboard;
