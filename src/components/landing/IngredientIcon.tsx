import React from 'react';
import { Drumstick, Egg } from 'lucide-react';
import type { IngredientKey } from './ingredientData';

// lucide-react no tiene icono para arroz/tomate/queso/brócoli/pasta/cebolla/
// aguacate — estos se dibujan a mano en el mismo lenguaje visual que lucide
// (viewBox 24x24, stroke=currentColor, trazo redondeado) para que no se
// note la costura. Pollo/huevo sí existen en lucide (Drumstick/Egg), se
// reutilizan tal cual en vez de reinventarlos.
const CUSTOM_PATHS: Record<Exclude<IngredientKey, 'chicken' | 'egg'>, React.ReactNode> = {
  rice: (
    <>
      <path d="M4 13h16a8 4.5 0 0 1-16 0z" />
      <path d="M8 13c0-2.2 1-4.3 2-6M12 13c0-2.6.8-5 1.6-7M16 13c0-1.8-.5-3.5-1.3-5.2" />
    </>
  ),
  tomato: (
    <>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M9 6.5c1-1.3 2-1.8 3-1.8s2 .5 3 1.8M12 4.7V3" />
    </>
  ),
  cheese: (
    <>
      <path d="M3 17.5h18L13.1 4.9a1.3 1.3 0 0 0-2.2 0L3 17.5z" />
      <circle cx="10.5" cy="13" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="15" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  broccoli: (
    <>
      <circle cx="9" cy="7.5" r="2.8" />
      <circle cx="14.5" cy="6.5" r="2.8" />
      <circle cx="12" cy="10.5" r="2.8" />
      <path d="M12 13v8" />
    </>
  ),
  pasta: (
    <>
      <path d="M12 4a8 8 0 1 0 8 8" />
      <path d="M12 8a4 4 0 1 0 4 4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  onion: (
    <>
      <path d="M12 21c-3.6 0-6.2-2.7-6.2-6.3 0-4.5 2.7-7.6 6.2-10 3.5 2.4 6.2 5.5 6.2 10 0 3.6-2.6 6.3-6.2 6.3z" />
      <path d="M12 4.7V3" />
      <path d="M8.6 9.3c1 1 2.1 1.5 3.4 1.5s2.4-.5 3.4-1.5M7.7 14c1.3 1.4 2.8 2.1 4.3 2.1s3-.7 4.3-2.1" />
    </>
  ),
  avocado: (
    <>
      <path d="M12 3c-4 0-7 4.2-7 9.3a7 7 0 0 0 14 0C19 7.2 16 3 12 3z" />
      <circle cx="12" cy="13.5" r="3" />
    </>
  ),
};

interface Props {
  ingredient: IngredientKey;
  className?: string;
}

export const IngredientIcon: React.FC<Props> = ({ ingredient, className = 'w-5 h-5' }) => {
  if (ingredient === 'chicken') return <Drumstick className={className} />;
  if (ingredient === 'egg') return <Egg className={className} />;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {CUSTOM_PATHS[ingredient]}
    </svg>
  );
};

export default IngredientIcon;
