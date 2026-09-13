import { SUPABASE_URL } from "../constants";
import type { AIRecipeResponse, UserProfile } from "../types";
import { supabaseClient } from "./supabase";
import { geminiRateLimiter, recipeCache } from "../utils/rateLimiter";
import { getMockRecipe } from "./mock-recipe";

// 🚨 DESARROLLO: Activa esto si la API de Gemini está en rate limit (429)
const USE_MOCK_RECIPE = false; // Cambia a true para usar datos de prueba

/**
 * Generate recipe using Supabase Edge Function
 * This keeps the Gemini API key secure on the server
 */
export const generateRecipeAI = async (
  prompt: string, 
  mode: 'text' | 'pantry', 
  userProfile: UserProfile,
  timeLimit?: string,
  ingredients?: string,
  servings?: number,
  utensils?: string
): Promise<AIRecipeResponse> => {
  
  // 🚨 MOCK MODE: Para desarrollo cuando API está en límite
  if (USE_MOCK_RECIPE) {
    console.warn('⚠️ USANDO DATOS MOCK - Gemini API en rate limit');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
    return getMockRecipe(prompt);
  }
  
  // Crear clave de caché basada en los parámetros
  const cacheKey = JSON.stringify({ prompt, mode, ingredients, servings, timeLimit, utensils });
  
  // Verificar caché
  const cached = recipeCache.get(cacheKey);
  if (cached) {
    console.log('✅ Receta obtenida del caché');
    return cached as AIRecipeResponse;
  }

  // Usar rate limiter para controlar frecuencia
  return geminiRateLimiter.execute(async () => {
    const queueLength = geminiRateLimiter.getQueueLength();
    if (queueLength > 0) {
      console.log(`⏳ Hay ${queueLength} solicitudes en cola. Por favor espera...`);
    }

    try {
      // Get the session token for authenticated requests
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      // Call the Edge Function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          prompt,
          mode,
          ingredients,
          servings,
          timeLimit,
          utensils,
          userProfile
        })
      });

    if (!response.ok) {
      let errorMessage = 'Failed to generate recipe';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
        
        // Log detailed error info
        console.error('Edge Function Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorResponse: error,
          timestamp: new Date().toISOString()
        });
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
        console.error('Edge Function Error (no JSON):', {
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString()
        });
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Recipe generation failed');
    }

    // Guardar en caché
    recipeCache.set(cacheKey, result.data);

    return result.data;
  } catch (error: any) {
    console.error('Error calling Edge Function:', {
      message: error.message,
      stack: error.stack,
      fullError: error,
      timestamp: new Date().toISOString()
    });
    throw new Error(error.message || 'Failed to generate recipe. Please try again.');
  }
  });
};

/**
 * Generate recipe image using Supabase Edge Function
 */
export const generateRecipeImage = async (prompt: string): Promise<string | null> => {
  try {
    console.log('📸 Llamando a Edge Function generate-image...');
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      console.error('❌ Image generation failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('📦 Response from generate-image:', result.success ? '✅ Success' : '❌ Failed');
    return result.success ? result.imageUrl : null;
  } catch (error) {
    console.error('❌ Error generating image:', error);
    return null;
  }
};

/**
 * Ask chef questions about a recipe (chat functionality)
 */
export const askChefAboutRecipe = async (
  question: string,
  recipe: AIRecipeResponse,
  chatHistory: Array<{ role: string; text: string }>
): Promise<string> => {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    // You could create a separate edge function for chat, or extend generate-recipe
    // For now, we'll call generate-recipe with a chat-style prompt
    const prompt = `Pregunta del usuario sobre la receta "${recipe.recipe_metadata.title}": ${question}

Receta completa:
${JSON.stringify(recipe, null, 2)}

Historial de chat:
${chatHistory.map(m => `${m.role}: ${m.text}`).join('\n')}

Responde de forma concisa y útil como un chef experto.`;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({
        prompt,
        mode: 'text',
        userProfile: {}
      })
    });

    if (!response.ok) {
      return "Lo siento, no pude procesar tu pregunta. Intenta de nuevo.";
    }

    const result = await response.json();
    return result.data?.recipe_metadata?.description || "Lo siento, no pude generar una respuesta.";
  } catch (error) {
    console.error('Error in chef chat:', error);
    return "Hubo un error al procesar tu pregunta.";
  }
};
