import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { requirePlan } from '../middleware/plan.js';
import { env } from '../env.js';
import { pool } from '../db.js';
import { groqChat } from '../lib/groq.js';
import { getActivePlan } from '../lib/subscription.js';
import { validateBody } from '../lib/validate.js';
import { generateRecipeSchema, generateImageSchema, chatSchema } from '../lib/schemas.js';

const router = Router();
// Exige email verificado (igual que recipes/profile/subscription): una cuenta
// sin verificar no puede usar nada de la app, no solo generar con IA.
router.use(requireAuth, requireVerifiedEmail);

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

const RECIPE_JSON_FORMAT = `Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto extra), con esta forma exacta:
{
  "recipe_metadata": {
    "title": "string",
    "description": "string",
    "difficulty": "Fácil" | "Media" | "Difícil",
    "cooking_time": "string, ej. '30 min'",
    "servings": number,
    "calories": number,
    "macros": { "protein": "string, ej. '25g'", "carbs": "string", "fat": "string" }
  },
  "ingredients": [ { "item": "string", "quantity": "string" } ],
  "utensils": [ "string" ],
  "steps": [ { "step_number": number, "instruction": "string", "visual_tag": "string", "visual_prompt": "string, descripción visual detallada del paso" } ]
}`;

router.post('/generate-recipe', validateBody(generateRecipeSchema), async (req, res) => {
  const { prompt, mode, ingredients, servings, timeLimit, utensils, userProfile } = req.body;

  // El modo despensa (hasAdvancedPantry en el frontend) es de pago — se
  // comprueba aquí porque la restricción de la UI no basta, cualquiera puede
  // llamar a esta ruta directamente con mode: 'pantry'.
  if (mode === 'pantry') {
    const plan = await getActivePlan(pool, req.userId!);
    if (plan === 'nipote') {
      return res.status(403).json({ error: 'PLAN_REQUIRED', plan, requiredPlans: ['mamma', 'nonna'] });
    }
  }

  let systemInstruction = `
    Eres un chef experto asistido por IA.
    Tu objetivo es generar recetas detalladas y estructuradas en formato JSON estricto.

    Contexto del usuario:
    - Alergias: ${userProfile?.allergies || 'Ninguna'}
    - Ingredientes odiados: ${userProfile?.disliked_ingredients || 'Ninguno'}
    - Nivel de habilidad: ${userProfile?.cooking_skill || 'intermediate'}

    Si el modo es 'pantry', prioriza usar los ingredientes mencionados.
    Si el modo es 'text', inspírate en la descripción creativa.
    Debes generar visual prompts para imágenes de cada paso.

    ${RECIPE_JSON_FORMAT}
  `;
  if (utensils) systemInstruction += `\nUtensilios disponibles: ${utensils}`;
  if (timeLimit && timeLimit !== 'unlimited') {
    systemInstruction += `\nIMPORTANTE: La receta DEBE poder prepararse y cocinarse en menos de ${timeLimit}.`;
  }

  const finalPrompt =
    mode === 'pantry'
      ? `Crea una receta usando estos ingredientes: ${ingredients || prompt}`
      : `Crea una receta para: ${prompt}`;

  try {
    const raw = await groqChat(
      [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: finalPrompt },
      ],
      { jsonMode: true }
    );

    const data = JSON.parse(raw);
    if (servings) data.recipe_metadata.servings = servings;

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error generando receta:', err);
    return res.status(502).json({ success: false, error: 'No se pudo generar la receta' });
  }
});

router.post('/generate-image', validateBody(generateImageSchema), requirePlan('mamma', 'nonna'), async (req, res) => {
  if (!env.geminiApiKey) {
    // Sin clave de Gemini configurada: se degrada a "sin imagen" en vez de romper el flujo.
    return res.json({ success: true, imageUrl: null });
  }

  const { prompt } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: env.geminiModelImage,
      contents: { parts: [{ text: prompt }] },
      config: {},
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.json({
          success: true,
          imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
        });
      }
    }
    return res.json({ success: true, imageUrl: null });
  } catch (err) {
    console.warn('Error generando imagen:', err);
    return res.json({ success: true, imageUrl: null }); // fallback silencioso, como el flujo actual
  }
});

router.post('/chat', validateBody(chatSchema), requirePlan('mamma', 'nonna'), async (req, res) => {
  const { question, recipeContext, history } = req.body;

  const systemInstruction = `
    Eres un Sous-Chef amigable y experto.
    El usuario está cocinando la siguiente receta ahora mismo:

    TÍTULO: ${recipeContext.recipe_metadata.title}
    INGREDIENTES: ${(recipeContext.ingredients || []).map((i: any) => i.item).join(', ')}
    PASOS: ${(recipeContext.steps || []).map((s: any) => `${s.step_number}. ${s.instruction}`).join('\n')}

    Responde a las preguntas del usuario sobre esta receta de forma breve, concisa y útil.
    Si te piden cambios (sustituciones), da opciones seguras.
    Mantén un tono animado y servicial.
  `;

  const messages = [
    { role: 'system' as const, content: systemInstruction },
    ...(history || []).map((h: { role: 'user' | 'model'; text: string }) => ({
      role: (h.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: h.text,
    })),
    { role: 'user' as const, content: question },
  ];

  try {
    const reply = await groqChat(messages);
    return res.json({ reply });
  } catch (err) {
    console.error('Error en chat:', err);
    return res.status(502).json({ reply: 'Tuve un pequeño problema de conexión en la cocina. ¿Me lo repites?' });
  }
});

export default router;
