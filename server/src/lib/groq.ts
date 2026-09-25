/**
 * Cliente HTTP de la API de Groq (chat de texto, con modo JSON) para generar
 * recetas y responder al chef.
 */

import { env } from '../env.js';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatOptions {
  jsonMode?: boolean;
  temperature?: number;
}

export const groqChat = async (messages: GroqMessage[], options: GroqChatOptions = {}): Promise<string> => {
  if (!env.groqApiKey) {
    throw new Error('GROQ_API_KEY no configurada en el servidor');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify({
      model: env.groqModel,
      messages,
      temperature: options.temperature ?? 0.7,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // `status` va en el propio Error (no solo en el mensaje) para que las
    // rutas puedan distinguir un 429 de Groq (límite de tokens/minuto — se
    // agota rápido) de cualquier otro fallo, sin parsear el texto del mensaje.
    throw Object.assign(new Error(`Groq API error: ${response.status} - ${errorText.substring(0, 200)}`), {
      status: response.status,
    });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Respuesta vacía de Groq');
  }
  return content;
};
