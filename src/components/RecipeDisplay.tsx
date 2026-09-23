import React, { useState } from 'react';
import { Clock, Users, Flame, UtensilsCrossed, RefreshCw, Share2, PlayCircle, ShoppingCart, Printer, Lock } from 'lucide-react';
import type { AIRecipeResponse } from '../types';
import { useToast } from '../context/ToastContext';
import { useSubscription } from '../context/SubscriptionContext';
import CookMode from './CookMode';
import ShoppingListModal from './ShoppingListModal';
import ChefChat from './ChefChat';
import { NonnaAvatar } from './ui/NonnaAvatar';
import { Reveal } from './ui/Reveal';
import RecipeImage from './ui/RecipeImage';

interface Props {
  recipe: AIRecipeResponse;
  imageUrl: string | null;
  onGenerateAgain: () => void;
}

const RecipeDisplay: React.FC<Props> = ({ recipe, imageUrl, onGenerateAgain }) => {
  const { recipe_metadata, ingredients, utensils, steps } = recipe;
  const { showToast } = useToast();
  const { limits } = useSubscription();

  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  const handleChefChatClick = () => {
    if (!limits.hasChefChat) {
      showToast('El chat con Nonna está disponible en el plan La Nonna. ¡Actualiza para disfrutarlo!', 'info');
    }
  };

  const handleCopyRecipe = () => {
    const text = `
🍳 ${recipe_metadata.title}
${recipe_metadata.description}

⏱️ Tiempo: ${recipe_metadata.cooking_time} | 👥 Porciones: ${recipe_metadata.servings} | 🔥 ${recipe_metadata.calories} kcal

🥕 INGREDIENTES:
${ingredients.map(i => `- ${i.item}: ${i.quantity}`).join('\n')}

🔪 PREPARACIÓN:
${steps.map(s => `${s.step_number}. ${s.instruction}`).join('\n')}

Generado por nonnapp
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      showToast('Receta copiada al portapapeles', 'success');
    }).catch(() => {
      showToast('No se pudo copiar la receta', 'error');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20 relative print:pb-0">
      
      {/* Modals - Hidden when printing */}
      {!isCookModeOpen && !isShoppingListOpen && (
         <div className="no-print">
            {limits.hasChefChat ? (
              <ChefChat recipe={recipe} />
            ) : (
              <button
                onClick={handleChefChatClick}
                aria-label="Chat con Nonna (plan La Nonna)"
                className="fixed bottom-24 right-4 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-soft-lg ring-2 ring-white dark:ring-surface-dark hover:scale-105 hover:-translate-y-0.5 active:scale-[0.97] transition duration-200"
              >
                <NonnaAvatar pose="chat" alt="" className="w-full h-full opacity-80 saturate-50" />
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center shadow-soft border-2 border-white dark:border-surface-dark"
                >
                  <Lock className="w-3 h-3 text-white" />
                </span>
              </button>
            )}
         </div>
      )}

      {isCookModeOpen && (
        <CookMode 
            steps={steps} 
            title={recipe_metadata.title} 
            onClose={() => setIsCookModeOpen(false)} 
        />
      )}

      {isShoppingListOpen && (
        <ShoppingListModal 
            ingredients={ingredients}
            title={recipe_metadata.title}
            onClose={() => setIsShoppingListOpen(false)}
        />
      )}

      <div className="bg-white dark:bg-[#18130D] rounded-3xl shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10 overflow-hidden mb-8 print:shadow-none print:border-0 transition-colors duration-300">
        <div className={`flex flex-col-reverse ${imageUrl ? 'md:flex-row' : ''}`}>
           
           <div className={`p-6 md:p-8 flex flex-col justify-center ${imageUrl ? 'md:w-7/12 lg:w-1/2' : 'w-full text-center items-center'}`}>
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full mb-4 uppercase tracking-wide ${!imageUrl && 'mx-auto'} print:border print:border-gray-300 print:bg-white`}>
                  {recipe_metadata.difficulty}
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#241B10] dark:text-[#F8F2E6] mb-4 leading-tight">
                  {recipe_metadata.title}
                </h2>
                <p className="text-[#5C4E3A] dark:text-[#A89C86] text-lg leading-relaxed">
                  {recipe_metadata.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-b border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-6 mb-6 w-full">
                 <div className="text-center px-2 border-r border-[#241B10]/10 dark:border-[#F5E6CD]/10 last:border-0">
                    <Clock aria-hidden="true" className="w-5 h-5 text-primary mx-auto mb-2 print:hidden" />
                    <span className="block font-bold text-[#241B10] dark:text-[#F8F2E6]">{recipe_metadata.cooking_time}</span>
                    <span className="text-xs text-[#6B5D48] dark:text-[#9A8D74] uppercase">Tiempo</span>
                 </div>
                 <div className="text-center px-2 border-r border-[#241B10]/10 dark:border-[#F5E6CD]/10 last:border-0">
                    <Users aria-hidden="true" className="w-5 h-5 text-secondary mx-auto mb-2 print:hidden" />
                    <span className="block font-bold text-[#241B10] dark:text-[#F8F2E6]">{recipe_metadata.servings}</span>
                    <span className="text-xs text-[#6B5D48] dark:text-[#9A8D74] uppercase">Personas</span>
                 </div>
                 <div className="text-center px-2">
                    <Flame aria-hidden="true" className="w-5 h-5 text-red-500 mx-auto mb-2 print:hidden" />
                    <span className="block font-bold text-[#241B10] dark:text-[#F8F2E6]">{recipe_metadata.calories}</span>
                    <span className="text-xs text-[#6B5D48] dark:text-[#9A8D74] uppercase">Kcal</span>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full no-print">
                 <button
                    onClick={() => setIsCookModeOpen(true)}
                    className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 active:scale-[0.98] transition flex items-center justify-center gap-2"
                 >
                    <PlayCircle aria-hidden="true" className="w-5 h-5" /> Cocinar Ahora
                 </button>

                 <div className="flex gap-2">
                    <button
                      onClick={() => setIsShoppingListOpen(true)}
                      aria-label="Lista de la compra"
                      className="p-3 border border-[#241B10]/15 dark:border-[#F5E6CD]/15 text-[#5C4E3A] dark:text-[#A89C86] rounded-xl hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary active:scale-95 transition-colors flex items-center gap-2 font-medium"
                    >
                      <ShoppingCart aria-hidden="true" className="w-5 h-5" />
                      <span className="hidden sm:inline">Compra</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      aria-label="Imprimir"
                      className="p-3 border border-[#241B10]/15 dark:border-[#F5E6CD]/15 text-[#5C4E3A] dark:text-[#A89C86] rounded-xl hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary active:scale-95 transition-colors"
                    >
                      <Printer aria-hidden="true" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCopyRecipe}
                      aria-label="Copiar texto de la receta"
                      className="p-3 border border-[#241B10]/15 dark:border-[#F5E6CD]/15 text-[#5C4E3A] dark:text-[#A89C86] rounded-xl hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary active:scale-95 transition-colors"
                    >
                      <Share2 aria-hidden="true" className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>

           {imageUrl && (
             <div className="md:w-5/12 lg:w-1/2 h-64 md:h-auto relative min-h-[300px] print:h-64 print:w-full">
               <RecipeImage 
                 src={imageUrl} 
                 alt={recipe_metadata.title} 
                 loading="lazy"
                 className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 animate-in fade-in"
                 onLoad={(e) => (e.currentTarget.style.opacity = "1")}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
             </div>
           )}
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        <div className="md:col-span-4 relative break-inside-avoid">
          <div className="space-y-6 md:sticky md:top-8">
            <div className="bg-white dark:bg-[#18130D] p-6 rounded-2xl shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10 print:shadow-none print:border print:border-gray-300 transition-colors duration-300">
              <h3 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-md text-green-600 dark:text-green-400 print:bg-transparent print:p-0">🥕</span> Ingredientes
              </h3>
              <ul className="space-y-3">
                {ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start justify-between text-sm border-b border-dashed border-[#241B10]/10 dark:border-[#F5E6CD]/10 pb-2 last:border-0 last:pb-0">
                    <span className="text-[#3A2E1D] dark:text-[#D4D4D8] font-medium leading-tight">{ing.item}</span>
                    <span className="text-[#6B5D48] dark:text-[#9A8D74] text-xs bg-[#FCF6EC] dark:bg-[#221B12] px-2 py-1 rounded ml-2 whitespace-nowrap font-medium print:bg-white print:border print:border-[#241B10]/15">{ing.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-[#18130D] p-6 rounded-2xl shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10 print:shadow-none print:border print:border-gray-300 transition-colors duration-300">
              <h3 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md text-blue-600 dark:text-blue-400 print:bg-transparent print:p-0"><UtensilsCrossed className="w-4 h-4" /></span> Utensilios
              </h3>
              <div className="flex flex-wrap gap-2">
                {utensils.map((u, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 text-[#5C4E3A] dark:text-[#A89C86] text-xs font-medium rounded-full print:border print:border-[#241B10]/15 print:bg-white">
                    {u}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 text-sm text-[#6B5D48] dark:text-[#9A8D74] bg-[#FCF6EC] dark:bg-[#18130D] px-4 py-3 rounded-xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 justify-between print:bg-white print:border print:border-gray-300 transition-colors duration-300">
                <span>Prot: <b className="text-[#241B10] dark:text-[#D4D4D8]">{recipe_metadata.macros.protein}</b></span>
                <span>Carbs: <b className="text-[#241B10] dark:text-[#D4D4D8]">{recipe_metadata.macros.carbs}</b></span>
                <span>Grasa: <b className="text-[#241B10] dark:text-[#D4D4D8]">{recipe_metadata.macros.fat}</b></span>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6]">Pasos de Preparación</h3>
             <span className="text-xs font-semibold text-[#6B5D48] bg-primary/10 dark:text-[#D4D4D8] px-3 py-1 rounded-full print:bg-white print:border print:border-[#241B10]/15">{steps.length} Pasos</span>
          </div>
          
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <Reveal key={idx} delayMs={Math.min(idx, 6) * 80} className="print:opacity-100">
              <div
                className="bg-white dark:bg-[#18130D] rounded-2xl p-6 border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm hover:border-primary/30 dark:hover:border-primary/30 transition group break-inside-avoid print:shadow-none print:border-[#241B10]/15"
              >
                <div className="flex flex-col gap-4">
                    <div className="flex gap-5">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md print:shadow-none print:bg-gray-800">
                                {step.step_number}
                            </div>
                        </div>

                        <div className="flex-grow pt-1">
                            <h4 className="font-bold text-[#241B10] dark:text-[#F8F2E6] text-lg mb-2">Paso {step.step_number}</h4>
                            <p className="text-[#3A2E1D] dark:text-[#D4D4D8] leading-relaxed text-base">
                                {step.instruction}
                            </p>
                        </div>
                    </div>
                </div>
              </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex justify-center pt-4 no-print">
             <button
               onClick={onGenerateAgain}
               className="group flex items-center gap-2 px-8 py-4 bg-white dark:bg-[#18130D] border-2 border-[#241B10]/10 dark:border-[#F5E6CD]/10 text-[#5C4E3A] dark:text-[#A89C86] font-bold rounded-2xl hover:border-primary hover:text-primary active:scale-[0.98] transition shadow-sm hover:shadow-md"
             >
               <RefreshCw aria-hidden="true" className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
               Generar otra versión
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;