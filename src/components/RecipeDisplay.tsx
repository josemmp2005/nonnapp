import React, { useState } from 'react';
import { Clock, Users, Flame, UtensilsCrossed, RefreshCw, Share2, PlayCircle, ShoppingCart, Camera, Loader2, Printer, Lock, Crown } from 'lucide-react';
import type { AIRecipeResponse } from '../types';
import { useToast } from '../context/ToastContext';
import { useSubscription } from '../context/SubscriptionContext';
import CookMode from './CookMode';
import ShoppingListModal from './ShoppingListModal';
import ChefChat from './ChefChat';
import { generateRecipeImage } from '../services/gemini-edge';

interface Props {
  recipe: AIRecipeResponse;
  imageUrl: string | null;
  onGenerateAgain: () => void;
  isPro?: boolean;
}

const RecipeDisplay: React.FC<Props> = ({ recipe, imageUrl, onGenerateAgain, isPro = false }) => {
  const { recipe_metadata, ingredients, utensils, steps } = recipe;
  const { showToast } = useToast();
  const { limits } = useSubscription();
  
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  // State for step images
  const [stepImages, setStepImages] = useState<Record<number, string>>({});
  const [loadingSteps, setLoadingSteps] = useState<Record<number, boolean>>({});

  const handleChefChatClick = () => {
    if (!limits.hasChefChat) {
      showToast('El chat con el Chef está disponible en los planes La Mamma y La Nonna. ¡Actualiza para disfrutarlo!', 'info');
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

  const handleGenerateStepImage = async (stepNumber: number, prompt: string) => {
    if (!isPro) {
        showToast('Esta función es exclusiva para usuarios Pro.', 'info');
        return;
    }

    if (loadingSteps[stepNumber] || stepImages[stepNumber]) return;

    setLoadingSteps(prev => ({ ...prev, [stepNumber]: true }));
    try {
        const enhancedPrompt = `Photorealistic food photography action shot: ${prompt}. Close up, professional lighting, 4k.`;
        const img = await generateRecipeImage(enhancedPrompt);
        if (img) {
            setStepImages(prev => ({ ...prev, [stepNumber]: img }));
        } else {
            showToast('No se pudo generar la imagen del paso.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error generando imagen.', 'error');
    } finally {
        setLoadingSteps(prev => ({ ...prev, [stepNumber]: false }));
    }
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
                className="fixed bottom-24 right-4 md:right-8 z-40 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white p-4 rounded-full shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 active:scale-95 group"
                title="Chat con el Chef (Premium)"
              >
                <div className="relative">
                  <Lock className="w-6 h-6" />
                  <Crown className="w-3 h-3 absolute -top-1 -right-1 text-amber-300" />
                </div>
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

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8 print:shadow-none print:border-0 transition-colors duration-300">
        <div className={`flex flex-col-reverse ${imageUrl ? 'md:flex-row' : ''}`}>
           
           <div className={`p-6 md:p-8 flex flex-col justify-center ${imageUrl ? 'md:w-7/12 lg:w-1/2' : 'w-full text-center items-center'}`}>
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full mb-4 uppercase tracking-wide ${!imageUrl && 'mx-auto'} print:border print:border-gray-300 print:bg-white`}>
                  {recipe_metadata.difficulty}
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                  {recipe_metadata.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {recipe_metadata.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 dark:border-gray-700 py-6 mb-6 w-full">
                 <div className="text-center px-2 border-r border-gray-100 dark:border-gray-700 last:border-0">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-2 print:hidden" />
                    <span className="block font-bold text-gray-900 dark:text-white">{recipe_metadata.cooking_time}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Tiempo</span>
                 </div>
                 <div className="text-center px-2 border-r border-gray-100 dark:border-gray-700 last:border-0">
                    <Users className="w-5 h-5 text-secondary mx-auto mb-2 print:hidden" />
                    <span className="block font-bold text-gray-900 dark:text-white">{recipe_metadata.servings}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Personas</span>
                 </div>
                 <div className="text-center px-2">
                    <Flame className="w-5 h-5 text-red-500 mx-auto mb-2 print:hidden" />
                    <span className="block font-bold text-gray-900 dark:text-white">{recipe_metadata.calories}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Kcal</span>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full no-print">
                 <button 
                    onClick={() => setIsCookModeOpen(true)}
                    className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                 >
                    <PlayCircle className="w-5 h-5" /> Cocinar Ahora
                 </button>
                 
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setIsShoppingListOpen(true)}
                      className="p-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors flex items-center gap-2 font-medium"
                      title="Lista de la compra"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span className="hidden sm:inline">Compra</span>
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="p-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
                      title="Imprimir"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleCopyRecipe}
                      className="p-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
                      title="Copiar texto"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>

           {imageUrl && (
             <div className="md:w-5/12 lg:w-1/2 h-64 md:h-auto relative min-h-[300px] print:h-64 print:w-full">
               <img 
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 print:shadow-none print:border print:border-gray-300 transition-colors duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-md text-green-600 dark:text-green-400 print:bg-transparent print:p-0">🥕</span> Ingredientes
              </h3>
              <ul className="space-y-3">
                {ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start justify-between text-sm border-b border-dashed border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-700 dark:text-gray-300 font-medium leading-tight">{ing.item}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded ml-2 whitespace-nowrap font-medium print:bg-white print:border print:border-gray-200">{ing.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 print:shadow-none print:border print:border-gray-300 transition-colors duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md text-blue-600 dark:text-blue-400 print:bg-transparent print:p-0"><UtensilsCrossed className="w-4 h-4" /></span> Utensilios
              </h3>
              <div className="flex flex-wrap gap-2">
                {utensils.map((u, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full print:border print:border-gray-200 print:bg-white">
                    {u}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 justify-between print:bg-white print:border print:border-gray-300 transition-colors duration-300">
                <span>Prot: <b className="text-gray-900 dark:text-gray-200">{recipe_metadata.macros.protein}</b></span>
                <span>Carbs: <b className="text-gray-900 dark:text-gray-200">{recipe_metadata.macros.carbs}</b></span>
                <span>Grasa: <b className="text-gray-900 dark:text-gray-200">{recipe_metadata.macros.fat}</b></span>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pasos de Preparación</h3>
             <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full print:bg-white print:border print:border-gray-200">{steps.length} Pasos</span>
          </div>
          
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary/30 dark:hover:border-primary/30 transition-all group break-inside-avoid print:shadow-none print:border-gray-200"
              >
                <div className="flex flex-col gap-4">
                    <div className="flex gap-5">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md print:shadow-none print:bg-gray-800">
                                {step.step_number}
                            </div>
                        </div>
                        
                        <div className="flex-grow pt-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Paso {step.step_number}</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                                {step.instruction}
                            </p>
                        </div>
                        
                        {/* Action Button for Image Generation (Hidden in Print) */}
                        <div className="no-print">
                            <button 
                                onClick={() => handleGenerateStepImage(step.step_number, step.visual_prompt)}
                                disabled={loadingSteps[step.step_number] || !!stepImages[step.step_number]}
                                className={`p-2 rounded-lg transition-colors ${
                                    stepImages[step.step_number] ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 
                                    !isPro ? 'text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30' :
                                    'text-gray-400 hover:text-primary hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                }`}
                                title={
                                    stepImages[step.step_number] ? "Imagen generada" : 
                                    !isPro ? "Función PRO: Generar imagen del paso" :
                                    "Ver imagen del paso"
                                }
                            >
                                {loadingSteps[step.step_number] ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                ) : !isPro && !stepImages[step.step_number] ? (
                                    <Lock className="w-5 h-5" />
                                ) : (
                                    <Camera className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Step Image */}
                    {stepImages[step.step_number] && (
                        <div className="ml-15 pl-15 animate-in fade-in zoom-in duration-300">
                            <div className="rounded-xl overflow-hidden h-48 md:h-64 relative bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                <img 
                                    src={stepImages[step.step_number]} 
                                    alt={`Paso ${step.step_number}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center pt-4 no-print">
             <button 
               onClick={onGenerateAgain}
               className="group flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md"
             >
               <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
               Generar otra versión
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;