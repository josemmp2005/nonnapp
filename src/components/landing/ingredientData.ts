/**
 * Claves de los ingredientes de las demos de la landing (`IngredientKey`) y el
 * hook `useIngredientLabels`, que devuelve sus nombres traducidos.
 */

import { useTranslation } from 'react-i18next';

export type IngredientKey =
  | 'chicken'
  | 'rice'
  | 'tomato'
  | 'cheese'
  | 'egg'
  | 'broccoli'
  | 'pasta'
  | 'onion'
  | 'avocado';

const INGREDIENT_KEYS: IngredientKey[] = ['chicken', 'rice', 'tomato', 'cheese', 'egg', 'broccoli', 'pasta', 'onion', 'avocado'];

// Hook en vez de un objeto estático: los nombres de ingrediente están
// traducidos (namespace `ingredients` en src/i18n/locales) y deben re-generarse
// cuando cambia el idioma, igual que el resto de la landing.
export const useIngredientLabels = (): Record<IngredientKey, string> => {
  const { t } = useTranslation();
  return Object.fromEntries(INGREDIENT_KEYS.map((key) => [key, t(`ingredients.${key}`)])) as Record<IngredientKey, string>;
};
