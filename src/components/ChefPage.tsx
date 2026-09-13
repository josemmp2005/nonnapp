
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, ChefHat } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import ChefTableWidget from './ChefTableWidget';

const ChefPage: React.FC = () => {
  const { limits } = useSubscription();
  const navigate = useNavigate();

  // Si no tiene acceso a la mesa de la nonna, mostrar paywall
  if (!limits.hasChefChat) {
    return (
      <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
        <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 overflow-hidden p-12 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              La Mesa de la Nonna
            </h1>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Accede a nuestra selección de Nonnas expertas y chatea con ellas sobre sus recetas tradicionales. Disponible en los planes <span className="font-bold text-primary">La Mamma</span> y <span className="font-bold text-primary">La Nonna</span>.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-amber-200 dark:border-amber-800 space-y-4 text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-primary" />
                Funciones Premium
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Acceso a múltiples Nonnas con especialidades únicas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Conversaciones interactivas sobre técnicas y trucos culinarios</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Consejos personalizados y adaptaciones de recetas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Recetas exclusivas y secretos de familia de cada Nonna</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button 
                onClick={() => navigate('/app/profile')}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Actualizar Plan
              </button>
              <button 
                onClick={() => navigate('/app')}
                className="px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold text-lg transition-all"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="relative rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 overflow-hidden mb-12 p-8 md:p-12 text-center md:text-left">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 max-w-2xl">
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Legado Culinario</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">La Mesa de la Nonna</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
               No hay nada como la comida hecha con cariño. Elige a tu Nonna favorita y deja que te guíe con su sabiduría, sus secretos y sus platos más preciados.
            </p>
         </div>
      </div>

      <ChefTableWidget variant="full" />
    </div>
  );
};

export default ChefPage;
