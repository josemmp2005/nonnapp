
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_TEXT, GEMINI_MODEL_IMAGE } from "../constants";
import type { AIRecipeResponse, UserProfile } from "../types";

// Initialize Gemini Client
// IMPORTANT: In a real app, never expose API_KEY in frontend code. Use a proxy.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!apiKey) {
  console.error("⚠️ VITE_GEMINI_API_KEY is not configured in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Helper to retry operations with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Check if error is retryable (e.g., 503 Service Unavailable, 429 Too Many Requests)
    // For simplicity in this demo, we retry on most errors except strict auth errors
    const isRetryable = error.status === 503 || error.status === 429 || error.message?.includes('fetch failed');
    
    if (!isRetryable && retries < 3) throw error; // If not strictly retryable but we are deep in retries, maybe throw

    console.warn(`AI request failed. Retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

export const generateRecipeAI = async (
  prompt: string, 
  mode: 'text' | 'pantry', 
  userProfile: UserProfile,
  timeLimit?: string
): Promise<AIRecipeResponse> => {
  
  // Validate API key
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file");
  }

  // Validate userProfile to avoid null/undefined errors
  if (!userProfile) {
    throw new Error("User profile is required to generate recipes");
  }
  
  // Construct System Instruction based on PDF "Prompt Contextual" (Page 1.2)
  let systemInstruction = `
    Eres un chef experto asistido por IA. 
    Tu objetivo es generar recetas detalladas y estructuradas en formato JSON estricto.
    
    Contexto del usuario:
    - Alergias: ${userProfile.allergies || 'Ninguna'}
    - Ingredientes odiados: ${userProfile.disliked_ingredients || 'Ninguno'}
    - Nivel de habilidad: ${userProfile.cooking_skill || 'intermediate'}

    Si el modo es 'pantry', prioriza usar los ingredientes mencionados.
    Si el modo es 'text', inspírate en la descripción creativa.
    
    Debes generar visual prompts para 'Nano Banana' para cada paso.
  `;

  if (timeLimit && timeLimit !== 'unlimited') {
    systemInstruction += `\n IMPORTANTE: La receta DEBE poder prepararse y cocinarse en menos de ${timeLimit}. Ajusta técnicas y complejidad para cumplir este requisito estrictamente.`;
  }

  const finalPrompt = mode === 'pantry' 
    ? `Crea una receta usando estos ingredientes: ${prompt}`
    : `Crea una receta para: ${prompt}`;

  // Define Schema matching PDF Page 8-10
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      recipe_metadata: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          cooking_time: { type: Type.STRING },
          servings: { type: Type.INTEGER },
          calories: { type: Type.INTEGER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.STRING },
              carbs: { type: Type.STRING },
              fat: { type: Type.STRING }
            }
          }
        }
      },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            quantity: { type: Type.STRING }
          }
        }
      },
      utensils: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step_number: { type: Type.INTEGER },
            instruction: { type: Type.STRING },
            visual_tag: { type: Type.STRING },
            visual_prompt: { type: Type.STRING, description: "Detailed visual description for image generation of this step" }
          }
        }
      }
    }
  };

  return retryOperation(async () => {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: finalPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema as any, 
        },
      });

      if (response.text) {
        return JSON.parse(response.text) as AIRecipeResponse;
      } else {
        throw new Error("No response text from Gemini");
      }
    } catch (error) {
      console.error("Gemini API attempt failed:", error);
      throw error;
    }
  });
};

export const generateRecipeImage = async (visualPrompt: string): Promise<string | null> => {
  // We don't necessarily retry images as aggressively to save time/quota, 
  // but a single retry is good practice.
  return retryOperation(async () => {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_IMAGE,
        contents: {
          parts: [{ text: visualPrompt }],
        },
        config: {}
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.warn("Image generation failed:", error);
      throw error; 
    }
  }, 1, 1000).catch(() => null); // If retries fail, return null (fallback to placeholder)
};

export const askChefAboutRecipe = async (
  question: string,
  recipeContext: AIRecipeResponse,
  history: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
  
  const systemInstruction = `
    Eres un Sous-Chef amigable y experto.
    El usuario está cocinando la siguiente receta ahora mismo:
    
    TÍTULO: ${recipeContext.recipe_metadata.title}
    INGREDIENTES: ${recipeContext.ingredients.map(i => i.item).join(', ')}
    PASOS: ${recipeContext.steps.map(s => s.step_number + '. ' + s.instruction).join('\n')}
    
    Responde a las preguntas del usuario sobre esta receta de forma breve, concisa y útil.
    Si te piden cambios (sustituciones), da opciones seguras.
    Mantén un tono animado y servicial.
  `;

  try {
    const chat = ai.chats.create({
      model: GEMINI_MODEL_TEXT,
      config: { systemInstruction },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: question });
    return result.text || "Lo siento, no he entendido bien la pregunta. ¿Puedes reformularla?";
  } catch (error) {
    console.error("Chat error:", error);
    return "Tuve un pequeño problema de conexión en la cocina. ¿Me lo repites?";
  }
};
