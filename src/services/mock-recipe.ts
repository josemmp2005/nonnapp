import type { AIRecipeResponse } from '../types';

/**
 * Mock recipe para testing cuando Gemini API está en rate limit
 * Activar cambiando USE_MOCK en gemini-edge.ts
 */
export const getMockRecipe = (prompt: string): AIRecipeResponse => {
  return {
    recipe_metadata: {
      title: `Receta Mock: ${prompt.substring(0, 30)}...`,
      description: 'Esta es una receta de prueba mientras esperamos que se resetee el límite de la API de Gemini.',
      difficulty: 'Media',
      cooking_time: '30 min',
      servings: 2,
      calories: 450,
      macros: {
        protein: '25g',
        carbs: '40g',
        fat: '15g'
      }
    },
    ingredients: [
      { item: 'Ingrediente de prueba 1', quantity: '200g' },
      { item: 'Ingrediente de prueba 2', quantity: '1 unidad' },
      { item: 'Ingrediente de prueba 3', quantity: '100ml' }
    ],
    utensils: ['Sartén', 'Cuchillo', 'Tabla de cortar'],
    steps: [
      {
        step_number: 1,
        instruction: 'Este es un paso de prueba. La receta real se generará cuando la API de Gemini esté disponible.',
        visual_tag: 'Preparación',
        visual_prompt: 'Ingredientes preparados'
      },
      {
        step_number: 2,
        instruction: 'Segundo paso de la receta mock para poder probar el sistema de suscripciones.',
        visual_tag: 'Cocción',
        visual_prompt: 'Cocinando ingredientes'
      },
      {
        step_number: 3,
        instruction: 'Paso final de prueba. Recuerda que esto es temporal.',
        visual_tag: 'Finalización',
        visual_prompt: 'Plato terminado'
      }
    ]
  };
};
