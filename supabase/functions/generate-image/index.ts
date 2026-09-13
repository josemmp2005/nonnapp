import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    const GEMINI_MODEL_IMAGE = Deno.env.get('GEMINI_MODEL_IMAGE') || 'imagen-3.0-generate-001'

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Call Imagen API with retry logic
    let response
    let retries = 0
    const maxRetries = 3
    
    while (retries < maxRetries) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_IMAGE}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      )

      // If rate limited (429), wait and retry
      if (response.status === 429 && retries < maxRetries - 1) {
        const waitTime = Math.pow(2, retries) * 1000 // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${retries + 1}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        retries++
        continue
      }

      break
    }

    if (!response.ok) {
      const error = await response.text()
      console.error('Imagen API error:', error)
      
      if (response.status === 429) {
        throw new Error('Límite de solicitudes excedido. Por favor, espera unos minutos.')
      }
      
      throw new Error(`Image generation error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Imagen API response:', JSON.stringify(data, null, 2))
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response')
      throw new Error('No se pudo generar la imagen')
    }
    
    // Extract base64 image from response
    const imageData = data.candidates[0]?.content?.parts[0]?.inlineData?.data

    return new Response(
      JSON.stringify({ success: true, imageUrl: imageData ? `data:image/png;base64,${imageData}` : null }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
