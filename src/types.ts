
// Mapeo de la respuesta JSON de la IA según el PDF (Página 8-10)
export interface RecipeMetadata {
  title: string;
  description: string;
  difficulty: string;
  cooking_time: string;
  servings: number;
  calories: number;
  macros: {
    protein: string;
    carbs: string;
    fat: string;
  };
}

export interface IngredientItem {
  item: string;
  quantity: string;
}

export interface StepItem {
  step_number: number;
  instruction: string;
  visual_tag: string;
  visual_prompt: string;
}

export interface AIRecipeResponse {
  recipe_metadata: RecipeMetadata;
  ingredients: IngredientItem[];
  utensils: string[];
  steps: StepItem[];
}

// Subscription Types
export type SubscriptionPlan = 'Nipote' | 'Mamma' | 'Nonna';

export interface SubscriptionData {
  plan_type: SubscriptionPlan;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

export interface SubscriptionLimits {
  maxRecipesPerDay: number;
  hasAdvancedPantry: boolean;
  hasImageGeneration: boolean;
  hasChefChat: boolean;
  hasWeeklyPlanner: boolean;
  hasFullHistory: boolean;
  hasPrioritySupport: boolean;
}

// Estructura para la UI y Base de Datos (simplificado para frontend)
export interface UserProfile {
  allergies: string;
  disliked_ingredients: string;
  cooking_skill: 'beginner' | 'intermediate' | 'advanced';
  use_allergies?: boolean;
  use_utensils?: boolean;
  available_utensils?: string;
  is_pro?: boolean; // Deprecated: usar SubscriptionContext
}

export interface RecipeDB extends AIRecipeResponse {
  id?: number; // ID from Supabase
  main_image_url?: string;
  created_at?: string;
  is_ai_generated?: boolean;
}

export interface GenerationParams {
  prompt: string;
  mode: 'text' | 'pantry';
  ingredients?: string;
  servings: number;
  timeLimit?: string;
  utensils?: string;
}