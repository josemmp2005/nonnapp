import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, mode, ingredients, servings, timeLimit, utensils, userProfile } = await req.json()

    // Get Gemini API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL_TEXT') || 'gemini-2.0-flash-lite'

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured in Supabase secrets')
    }

    // Build the prompt based on mode
    let finalPrompt = ''
    if (mode === 'pantry' && ingredients) {
      finalPrompt = `Eres un chef profesional experto. Genera una receta creativa y deliciosa usando SOLO estos ingredientes: ${ingredients}.`
    } else {
      finalPrompt = `Eres un chef profesional experto. Genera una receta para: ${prompt}`
    }

    // Add user preferences to prompt
    if (userProfile?.allergies && userProfile.use_allergies) {
      finalPrompt += `\n\nALERGIAS/RESTRICCIONES: ${userProfile.allergies}. NO incluyas estos ingredientes.`
    }
    if (userProfile?.disliked_ingredients) {
      finalPrompt += `\n\nIngredientes NO deseados: ${userProfile.disliked_ingredients}. Evítalos si es posible.`
    }
    if (utensils) {
      finalPrompt += `\n\nUtensilios disponibles: ${utensils}`
    }
    if (timeLimit) {
      finalPrompt += `\n\nTiempo máximo: ${timeLimit}`
    }
    if (servings) {
      finalPrompt += `\n\nPorciones: ${servings}`
    }

    finalPrompt += `\n\nIMPORTANTE: Responde ÚNICAMENTE con el objeto JSON. No incluyas explicaciones, markdown, ni texto adicional. Solo el JSON puro y válido.

Formato JSON requerido:
{
  "recipe_metadata": {
    "title": "Nombre de la receta",
    "description": "Descripción breve y apetitosa",
    "difficulty": "Fácil",
    "cooking_time": "30 min",
    "servings": ${servings || 2},
    "calories": 450,
    "macros": {
      "protein": "25g",
      "carbs": "40g",
      "fat": "15g"
    }
  },
  "ingredients": [
    {"item": "Ingrediente 1", "quantity": "200g"},
    {"item": "Ingrediente 2", "quantity": "1 unidad"}
  ],
  "utensils": ["Sartén", "Cuchillo", "Tabla de cortar"],
  "steps": [
    {
      "step_number": 1,
      "instruction": "Instrucción detallada del paso 1",
      "visual_tag": "Preparación",
      "visual_prompt": "Ingredientes cortados y preparados en la mesa"
    }
  ]
}`

    // Call Gemini API with retry logic
    let response
    let retries = 0
    const maxRetries = 2 // Reducido a 2 para evitar timeout
    
    while (retries < maxRetries) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 segundos timeout
      
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: finalPrompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                topP: 0.8,
                topK: 40,
              }
            })
          }
        )
        
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        // Si es timeout o abort, reintentar
        if (fetchError.name === 'AbortError' && retries < maxRetries - 1) {
          console.log(`Request timeout. Retrying ${retries + 1}/${maxRetries}`)
          retries++
          continue
        }
        throw fetchError
      }

      // If rate limited (429), wait and retry
      if (response.status === 429 && retries < maxRetries - 1) {
        const waitTime = Math.pow(2, retries) * 1000 // Exponential backoff: 1s, 2s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${retries + 1}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        retries++
        continue
      }

      // If success or non-429 error, break the loop
      break
    }

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      
      if (response.status === 429) {
        throw new Error('Límite de solicitudes excedido. Por favor, espera unos minutos antes de intentar de nuevo.')
      }
      
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('Gemini response:', JSON.stringify(data, null, 2))
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response')
      throw new Error('No response from Gemini API')
    }
    
    if (!data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Invalid response structure')
      throw new Error('Invalid response structure from Gemini')
    }
    
    const textResponse = data.candidates[0].content.parts[0].text
    console.log('Raw text response:', textResponse)

    // Clean and parse JSON
    let jsonText = textResponse.trim()
    
    // Remove markdown code blocks if present
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```\s*/g, '')
    }
    
    // Extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response')
      throw new Error('No valid JSON found in response')
    }

    let recipeData
    try {
      recipeData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Attempted to parse:', jsonMatch[0])
      throw new Error('Failed to parse recipe JSON')
    }

    return new Response(
      JSON.stringify({ success: true, data: recipeData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in generate-recipe:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
