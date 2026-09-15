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

export const INGREDIENT_LABELS: Record<IngredientKey, string> = {
  chicken: 'Pollo',
  rice: 'Arroz',
  tomato: 'Tomate',
  cheese: 'Queso',
  egg: 'Huevo',
  broccoli: 'Brócoli',
  pasta: 'Pasta',
  onion: 'Cebolla',
  avocado: 'Aguacate',
};
