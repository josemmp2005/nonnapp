import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, DEFAULT_USER_PROFILE } from '../constants';
import type { RecipeDB, AIRecipeResponse, UserProfile } from '../types';


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    },
  },
  global: {
    headers: {
      'x-application-name': 'sabora-app',
    },
  },
});

export const supabaseClient = supabase;

// Exponer en window para debugging (solo en desarrollo)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).supabaseClient = supabase;
  console.log('🔧 [Debug] supabaseClient available at window.supabaseClient');
}

/* --- AUTHENTICATION --- */

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, metadata?: { username: string; avatar_url?: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata // This saves username and avatar_url to raw_user_meta_data
    }
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/app`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

export const updateUserPassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
};

/* --- STORAGE & AVATARS --- */

/**
 * Upload avatar to Supabase Storage
 * Returns the public URL of the uploaded file
 */
export const uploadAvatar = async (userId: string, file: File): Promise<{ url: string | null; error: any }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Delete old avatar if exists
    const { data: existingFiles } = await supabase.storage
      .from('user-uploads')
      .list('avatars', {
        search: userId
      });

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `avatars/${f.name}`);
      await supabase.storage.from('user-uploads').remove(filesToDelete);
    }

    // Upload new avatar
    const { error } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return { url: null, error };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload avatar exception:', error);
    return { url: null, error };
  }
};

/* --- STORAGE & PROFILE --- */

/**
 * Updates the Supabase Auth Metadata AND public.users table.
 * NOW SUPPORTS BASE64 Images stored directly in DB.
 */
export const upsertUserProfile = async (_userId: string, profile: { username: string; avatar_url?: string | null; email?: string }) => {
  try {
    const authUpdates: any = {
      username: profile.username
    };

    const { error: authError } = await supabaseClient.auth.updateUser({
      data: authUpdates
    });
    
    if (authError) {
      return { error: authError };
    }
    
    return { error: null };
  } catch (error) {
    return { error: error as any };
  }
};

/**
 * Checks the 'public.subscriptions' table for an active 'chef' plan.
 */
const getSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan_type, is_active, end_date')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('plan_type', 'chef')
      .maybeSingle(); // Usamos maybeSingle porque puede no haber filas

    if (error) {
      console.warn("Error checking subscription:", error.message);
      return false;
    }

    if (!data) return false;

    // Check expiration if exists
    if (data.end_date) {
      const endDate = new Date(data.end_date);
      if (endDate < new Date()) return false;
    }

    return true;
  } catch (err) {
    console.error("Subscription check failed", err);
    return false;
  }
};

/**
 * Fetches Chef Configuration from 'user_profiles' table AND subscription status
 */
export const getUserPreferences = async (userId: string): Promise<UserProfile | null> => {
  // 1. Fetch Profile Preferences
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.warn("Error fetching user preferences:", error.message);
  }

  // 2. Fetch Real Subscription Status from DB
  const isPro = await getSubscriptionStatus(userId);

  if (!data) {
    // Return default profile but with real sub status
    return { ...DEFAULT_USER_PROFILE, is_pro: isPro };
  }

  return {
    ...DEFAULT_USER_PROFILE,
    allergies: data.allergies || "",
    disliked_ingredients: data.disliked_ingredients || "",
    cooking_skill: (data.hability as any) || "intermediate",
    use_allergies: !!data.allergies && data.allergies.length > 0,
    use_utensils: false, 
    available_utensils: "", // Faltaría leer de la DB si agregaste la columna
    is_pro: isPro // Real value from subscriptions table
  };
};

/**
 * Saves Chef Configuration to 'user_profiles' table
 */
export const saveChefPreferences = async (userId: string, profile: UserProfile) => {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ 
      user_id: userId,
      allergies: profile.allergies,
      disliked_ingredients: profile.disliked_ingredients,
      hability: profile.cooking_skill,
    }, { onConflict: 'user_id' });
  
  if (error) {
    console.error("DB Error saving preferences:", JSON.stringify(error, null, 2));
  }
  return { error };
};

/**
 * Toggles subscription for Testing/Demo purposes.
 * Real implementation would use Stripe Webhooks.
 */
export const toggleSubscription = async (userId: string, currentStatus: boolean) => {
  if (currentStatus) {
    // Cancel subscription (set is_active = false)
    // We update all active chef subscriptions for this user
    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('plan_type', 'chef');
    return { error };
  } else {
    // Create new subscription
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: 'chef',
        is_active: true,
        start_date: new Date().toISOString(),
        // No end_date means lifetime/auto-renew for this demo
      });
    return { error };
  }
};

/* --- DATABASE RECIPES --- */

export const checkSmartCache = async (prompt: string): Promise<RecipeDB | null> => {
  // Simple cache check for MVP
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .ilike('generation_prompt', `%${prompt}%`)
    .limit(1)
    .maybeSingle(); 

  if (error || !data) return null;

  return null; 
};

/**
 * Saves a generated recipe to the database following strict Schema:
 * Throws specific error if daily limit is exceeded (RLS policy)
 */
export const saveRecipeToDB = async (
  userId: string | undefined,
  recipe: AIRecipeResponse, 
  originalPrompt: string, 
  imageUrl: string | null
) => {
  if (!userId) {
    console.warn("No user ID provided, skipping DB save");
    return null;
  }

  try {
    // 1. Insert into public.recipes
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        title: recipe.recipe_metadata.title,
        description: recipe.recipe_metadata.description,
        difficulty: recipe.recipe_metadata.difficulty,
        cooking_time: recipe.recipe_metadata.cooking_time,
        servings: recipe.recipe_metadata.servings,
        calories: recipe.recipe_metadata.calories,
        macros: recipe.recipe_metadata.macros, // JSONB
        main_image_url: imageUrl,
        generation_prompt: originalPrompt,
        is_ai_generated: true,
        source_origin: 'IA'
      })
      .select()
      .single();

    if (recipeError) {
      // Detectar error de política RLS (límite diario)
      if (recipeError.code === '42501' || recipeError.message?.includes('policy')) {
        const limitError = new Error('DAILY_LIMIT_EXCEEDED');
        limitError.name = 'DailyLimitError';
        throw limitError;
      }
      
      console.error("Error saving recipe header:", JSON.stringify(recipeError, null, 2));
      throw recipeError;
    }

    if (!recipeData) {
      throw new Error('No recipe data returned');
    }

    const recipeId = recipeData.id;

    // 2. Insert Steps
    const stepsPayload = recipe.steps.map(step => ({
      recipe_id: recipeId,
      step_number: step.step_number,
      instruction: step.instruction,
      visual_tag: step.visual_tag,
      visual_prompt: step.visual_prompt
    }));
    
    const { error: stepsError } = await supabase.from('recipe_steps').insert(stepsPayload);
    if (stepsError) console.error("Error saving steps:", JSON.stringify(stepsError, null, 2));

    // 3. Handle Ingredients (Normalize)
    for (const ing of recipe.ingredients) {
      const normalizedName = ing.item.trim();
      
      // A. Upsert Ingredient 
      await supabase
        .from('ingredients')
        .upsert({ name: normalizedName }, { onConflict: 'name', ignoreDuplicates: true });

      // B. Get ID
      const { data: ingData } = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', normalizedName)
        .single();

      if (ingData) {
        // C. Insert Relation
        await supabase.from('recipe_ingredients').insert({
          recipe_id: recipeId,
          ingredient_id: ingData.id,
          quantity: ing.quantity
        });
      }
    }

    // 4. Handle Utensils (Normalize)
    if (recipe.utensils && recipe.utensils.length > 0) {
      for (const utensilName of recipe.utensils) {
        const normalizedName = utensilName.trim();

        // A. Upsert Utensil
        await supabase
          .from('utensils')
          .upsert({ name: normalizedName }, { onConflict: 'name', ignoreDuplicates: true });

        // B. Get ID
        const { data: utensilData } = await supabase
          .from('utensils')
          .select('id')
          .eq('name', normalizedName)
          .single();

        if (utensilData) {
           // C. Insert Relation
           await supabase.from('recipe_utensils').insert({
             recipe_id: recipeId,
             utensil_id: utensilData.id
           });
        }
      }
    }
    
    return { ...recipe, id: recipeId, main_image_url: imageUrl };

  } catch (error) {
    console.error("Critical error in saveRecipeToDB transaction:", JSON.stringify(error, null, 2));
    throw error;
  }
};

const mapDBRowToRecipe = (row: any): RecipeDB => ({
  id: row.id,
  main_image_url: row.main_image_url,
  created_at: row.created_at,
  is_ai_generated: row.is_ai_generated,
  recipe_metadata: {
    title: row.title || 'Receta sin título',
    description: row.description || '',
    difficulty: row.difficulty || 'Media',
    cooking_time: row.cooking_time || 'N/A',
    servings: row.servings || 2,
    calories: row.calories || 0,
    macros: row.macros || { protein: '0g', carbs: '0g', fat: '0g' }
  },
  ingredients: [],
  utensils: [],
  steps: []
});

export const fetchRecentRecipes = async (): Promise<RecipeDB[]> => {
  console.log('📥 Fetching recent recipes from DB...');
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error("❌ Error fetching recent history:", JSON.stringify(error, null, 2));
      return [];
    }
    
    console.log('✅ Recipes fetched:', data?.length || 0);
    return (data || []).map(mapDBRowToRecipe);
  } catch (err) {
    console.error('❌ Exception in fetchRecentRecipes:', err);
    return [];
  }
};

export const fetchUserHistory = async (userId: string): Promise<RecipeDB[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching full history:", JSON.stringify(error, null, 2));
    return [];
  }
  
  return (data || []).map(mapDBRowToRecipe);
};

export const getFullRecipeById = async (recipeId: string | number): Promise<RecipeDB | null> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_steps (
          step_number,
          instruction,
          visual_tag,
          visual_prompt
        ),
        recipe_ingredients (
          quantity,
          ingredients (
            name
          )
        ),
        recipe_utensils (
          utensils (
            name
          )
        )
      `)
      .eq('id', recipeId)
      .single();

    if (error || !data) {
      console.error("Error fetching full recipe:", JSON.stringify(error, null, 2));
      return null;
    }

    const reconstructedRecipe: RecipeDB = {
      id: data.id,
      main_image_url: data.main_image_url,
      created_at: data.created_at,
      is_ai_generated: data.is_ai_generated,
      recipe_metadata: {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        cooking_time: data.cooking_time,
        servings: data.servings,
        calories: data.calories,
        macros: data.macros || { protein: '0g', carbs: '0g', fat: '0g' }
      },
      steps: (data.recipe_steps || []).sort((a: any, b: any) => a.step_number - b.step_number),
      ingredients: (data.recipe_ingredients || []).map((ri: any) => ({
        item: ri.ingredients?.name || 'Desconocido',
        quantity: ri.quantity || ''
      })),
      utensils: (data.recipe_utensils || []).map((ru: any) => ru.utensils?.name || '')
    };

    return reconstructedRecipe;

  } catch (err) {
    console.error("Error parsing recipe details:", err);
    return null;
  }
};