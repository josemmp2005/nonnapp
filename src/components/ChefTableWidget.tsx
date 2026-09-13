
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, BookOpen, ArrowRight, Heart, Flower2, Lock, Crown } from 'lucide-react';
import type { RecipeDB } from '../types';
import { useToast } from '../context/ToastContext';

// Estilos de "Nonnas" Predefinidos
const CHEF_STYLES = [
  {
    id: 'francesca',
    name: 'Nonna Francesca',
    subtitle: 'La Exigente',
    description: 'No tolera un corte mal hecho. Técnica perfecta y sabores intensos.',
    style: 'Estilo de cocina de alta gama, técnica francesa moderna pero con alma italiana, exigente, presentación minimalista y elegante.',
    image: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9f4?auto=format&fit=crop&w=400&q=80',
    color: 'from-red-500 to-orange-600',
    dish: 'Osobuco a la Milanesa Perfecto'
  },
  {
    id: 'maria',
    name: 'Nonna Maria',
    subtitle: 'La Clásica',
    description: 'Comida que te abraza. Mucha mantequilla y mucho amor.',
    style: 'Estilo casero rústico, cocina italiana tradicional de la vieja escuela, porciones generosas, ingredientes frescos y simples, confort food.',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=400&q=80',
    color: 'from-green-500 to-emerald-700',
    dish: 'Lasaña de la Abuela'
  },
  {
    id: 'valentina',
    name: 'Nonna Valentina',
    subtitle: 'La Viajera',
    description: 'Vivió 10 años en Asia y Sudamérica. Le gusta experimentar.',
    style: 'Cocina fusión italo-asiática-latina, atrevida, picante, cítrica, emplatado colorido y artístico, ingredientes exóticos.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80',
    color: 'from-purple-500 to-indigo-600',
    dish: 'Tiradito de Lubina al Pesto'
  },
  {
    id: 'sofia',
    name: 'Nonna Sofia',
    subtitle: 'La Moderna',
    description: 'Dice que la quinoa es el nuevo arroz. Saludable y bio.',
    style: 'Cocina basada en plantas, superalimentos, vibrante, fresca, bowls nutritivos, bajo en carbohidratos, keto-friendly.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    color: 'from-lime-500 to-green-600',
    dish: 'Risotto de Coliflor y Trufa'
  }
];

// Recetas de Autor (Recetas de Familia)
const FEATURED_RECIPES: RecipeDB[] = [
    {
        id: 99901,
        main_image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1200&auto=format&fit=crop",
        recipe_metadata: {
            title: "Risotto de Setas de la Familia",
            description: "La receta secreta del domingo. Un risotto cremoso con setas silvestres, terminado con aceite de trufa y parmesano reggiano de 24 meses.",
            difficulty: "Media",
            cooking_time: "45 min",
            servings: 4,
            calories: 650,
            macros: { protein: "18g", carbs: "80g", fat: "28g" }
        },
        ingredients: [
            { item: "Arroz Arborio", quantity: "320g" },
            { item: "Setas variadas (Boletus, Champiñón)", quantity: "400g" },
            { item: "Caldo de verduras", quantity: "1.5L" },
            { item: "Vino blanco seco", quantity: "150ml" },
            { item: "Mantequilla", quantity: "60g" },
            { item: "Queso Parmesano", quantity: "80g" },
            { item: "Aceite de trufa", quantity: "1 cda" }
        ],
        steps: [
            { step_number: 1, instruction: "Sofríe la cebolla picada muy fina en la mitad de la mantequilla hasta que esté transparente.", visual_tag: "sofrito", visual_prompt: "" },
            { step_number: 2, instruction: "Añade las setas troceadas y cocina hasta que suelten su agua y se doren ligeramente.", visual_tag: "setas", visual_prompt: "" },
            { step_number: 3, instruction: "Incorpora el arroz y tuéstalo (nacarar) durante 2 minutos hasta que los bordes sean translúcidos.", visual_tag: "arroz", visual_prompt: "" },
            { step_number: 4, instruction: "Vierte el vino blanco y deja evaporar el alcohol completamente.", visual_tag: "vino", visual_prompt: "" },
            { step_number: 5, instruction: "Añade el caldo caliente cazo a cazo, removiendo constantemente. Espera a que se absorba antes de añadir más.", visual_tag: "caldo", visual_prompt: "" },
            { step_number: 6, instruction: "Mantecar: Retira del fuego, añade el resto de mantequilla, el parmesano y el aceite de trufa. Remueve enérgicamente.", visual_tag: "mantecar", visual_prompt: "" }
        ],
        utensils: ["Olla ancha", "Cucharón", "Espátula de madera"],
        is_ai_generated: false
    },
    {
        id: 99902,
        main_image_url: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?q=80&w=1200&auto=format&fit=crop",
        recipe_metadata: {
            title: "Salmón al Limón de la Tía",
            description: "Filetes de salmón fresco horneados con una costra de hierbas, acompañados de espárragos trigueros y una salsa ligera de mantequilla y limón.",
            difficulty: "Fácil",
            cooking_time: "25 min",
            servings: 2,
            calories: 480,
            macros: { protein: "35g", carbs: "8g", fat: "32g" }
        },
        ingredients: [
            { item: "Lomos de Salmón", quantity: "2 unidades" },
            { item: "Espárragos verdes", quantity: "1 manojo" },
            { item: "Limón", quantity: "1 unidad" },
            { item: "Eneldo fresco", quantity: "1 ramillete" },
            { item: "Ajo", quantity: "2 dientes" },
            { item: "Mantequilla", quantity: "30g" }
        ],
        steps: [
            { step_number: 1, instruction: "Precalienta el horno a 200°C.", visual_tag: "horno", visual_prompt: "" },
            { step_number: 2, instruction: "Coloca el salmón y los espárragos en una bandeja. Salpimienta al gusto.", visual_tag: "bandeja", visual_prompt: "" },
            { step_number: 3, instruction: "Mezcla la mantequilla derretida con ajo picado, zumo de limón y eneldo.", visual_tag: "salsa", visual_prompt: "" },
            { step_number: 4, instruction: "Pincela el salmón y las verduras con la mezcla.", visual_tag: "pincelar", visual_prompt: "" },
            { step_number: 5, instruction: "Hornea durante 12-15 minutos hasta que el salmón esté rosado y se deslasque fácilmente.", visual_tag: "hornear", visual_prompt: "" }
        ],
        utensils: ["Bandeja de horno", "Bol pequeño"],
        is_ai_generated: false
    },
    {
        id: 99903,
        main_image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&auto=format&fit=crop",
        recipe_metadata: {
            title: "Tarta de Queso Sin Horno",
            description: "Una versión ligera de la clásica tarta de queso, con una base de galleta crujiente y un coulis casero de frutos del bosque. Imposible fallar.",
            difficulty: "Fácil",
            cooking_time: "20 min (+3h frío)",
            servings: 8,
            calories: 320,
            macros: { protein: "8g", carbs: "35g", fat: "18g" }
        },
        ingredients: [
            { item: "Queso crema", quantity: "400g" },
            { item: "Nata para montar", quantity: "200ml" },
            { item: "Azúcar", quantity: "100g" },
            { item: "Galletas tipo Digestive", quantity: "150g" },
            { item: "Mantequilla", quantity: "60g" },
            { item: "Frutos rojos", quantity: "200g" }
        ],
        steps: [
            { step_number: 1, instruction: "Tritura las galletas y mézclalas con la mantequilla derretida. Cubre la base del molde.", visual_tag: "base", visual_prompt: "" },
            { step_number: 2, instruction: "Bate el queso crema con el azúcar hasta que esté suave.", visual_tag: "crema", visual_prompt: "" },
            { step_number: 3, instruction: "Monta la nata e incorpórala a la mezcla de queso con movimientos envolventes.", visual_tag: "mezcla", visual_prompt: "" },
            { step_number: 4, instruction: "Vierte sobre la base y refrigera mínimo 3 horas.", visual_tag: "refrigerar", visual_prompt: "" },
            { step_number: 5, instruction: "Cocina los frutos rojos con un poco de azúcar hasta tener una salsa espesa. Deja enfriar y sirve encima.", visual_tag: "coulis", visual_prompt: "" }
        ],
        utensils: ["Molde desmontable", "Batidora"],
        is_ai_generated: false
    }
];

interface Props {
  variant?: 'dashboard' | 'full';
  isLocked?: boolean;
}

const ChefTableWidget: React.FC<Props> = ({ variant = 'dashboard', isLocked = false }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [chefTab, setChefTab] = useState<'styles' | 'featured'>('styles');

  const triggerChefSpecial = (preset: typeof CHEF_STYLES[0]) => {
    if (isLocked) {
      showToast('La Mesa de la Nonna está disponible en los planes La Mamma y La Nonna. ¡Actualiza para disfrutarlo!', 'info');
      return;
    }
    const prompt = `Actúa como ${preset.name} (${preset.subtitle}). Crea un plato espectacular y único (${preset.dish} o similar) siguiendo estrictamente este estilo: ${preset.style}. Sorpréndeme como si fuera tu nieto favorito.`;
    navigate('/app/generate', { 
        state: { 
            autoTrigger: true,
            prompt,
            mode: 'text',
            timeLimit: 'unlimited'
        } 
    });
  };

  const openFeaturedRecipe = (recipe: RecipeDB) => {
    if (isLocked) {
      showToast('Las Recetas de Familia están disponibles en los planes La Mamma y La Nonna. ¡Actualiza para disfrutarlas!', 'info');
      return;
    }
    navigate(`/app/recipe/featured-${recipe.id}`, {
        state: { recipeData: recipe }
    });
  };

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-1 gap-4">
            <div className="flex items-center gap-2">
                <Heart className={`text-primary ${variant === 'full' ? 'w-8 h-8' : 'w-6 h-6'}`} />
                <h2 className={`${variant === 'full' ? 'text-3xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white`}>
                    La Mesa de la Nonna
                </h2>
            </div>
            
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button 
                onClick={() => setChefTab('styles')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${chefTab === 'styles' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                Sus Secretos
                </button>
                <button 
                onClick={() => setChefTab('featured')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${chefTab === 'featured' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                Recetas de Familia
                </button>
            </div>
        </div>
        
        {chefTab === 'styles' ? (
            <div className={`grid gap-4 animate-in fade-in slide-in-from-bottom-2 ${variant === 'full' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
                {CHEF_STYLES.map((preset) => (
                <button
                    key={preset.id}
                    onClick={() => triggerChefSpecial(preset)}
                    className={`group relative h-72 rounded-2xl overflow-hidden text-left shadow-md hover:shadow-xl transition-all ${isLocked ? 'cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    disabled={isLocked}
                >
                    <img 
                    src={preset.image} 
                    alt={preset.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isLocked ? 'filter grayscale opacity-60' : 'group-hover:scale-110'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    
                    {/* Lock Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-xl">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white font-bold text-sm flex items-center gap-1 justify-center">
                            <Crown className="w-4 h-4 text-amber-300" />
                            Premium
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 p-5 w-full">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-gradient-to-br ${preset.color} text-white shadow-lg`}>
                        <Flower2 className="w-5 h-5 fill-current" />
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight">{preset.name}</h3>
                        <span className="text-primary text-xs font-bold uppercase tracking-widest mb-1 block">{preset.subtitle}</span>
                        <p className="text-gray-300 text-xs line-clamp-2 mb-2 leading-relaxed">{preset.description}</p>
                        <div className="flex items-center gap-1 text-white/80 text-xs font-medium border-t border-white/20 pt-2 mt-2">
                            <Flame className="w-3 h-3 text-orange-400" />
                            <span>Cocinar estilo {preset.name.split(' ')[1]}</span>
                        </div>
                    </div>
                </button>
                ))}
            </div>
        ) : (
            <div className={`grid gap-6 animate-in fade-in slide-in-from-right-2 ${variant === 'full' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
                {FEATURED_RECIPES.map((recipe) => (
                <div 
                    key={recipe.id}
                    onClick={() => openFeaturedRecipe(recipe)}
                    className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col relative ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <div className="h-48 relative overflow-hidden">
                        <img 
                            src={recipe.main_image_url} 
                            alt={recipe.recipe_metadata.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ${isLocked ? 'filter grayscale opacity-60' : 'group-hover:scale-105'}`}
                        />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-900 dark:text-white shadow-sm flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-primary" /> Receta
                        </div>
                        
                        {/* Lock Overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-sm">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                              <Lock className="w-7 h-7 text-white" />
                            </div>
                          </div>
                        )}
                    </div>
                    <div className={`p-5 flex-grow flex flex-col ${isLocked ? 'opacity-60' : ''}`}>
                        <div className="mb-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-orange-50 dark:bg-orange-900/20 p       x-2 py-1 rounded-md mb-2 inline-block">
                                {recipe.recipe_metadata.difficulty} • {recipe.recipe_metadata.cooking_time}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                                {recipe.recipe_metadata.title}
                            </h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                            {recipe.recipe_metadata.description}
                        </p>
                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm font-medium">
                            <span className="text-gray-400 text-xs">
                                {recipe.ingredients.length} Ingredientes
                            </span>
                            <span className="text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                Ver receta <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default ChefTableWidget;
