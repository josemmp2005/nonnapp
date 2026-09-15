import React, { useEffect, useState } from 'react';
import { ChefHat } from 'lucide-react';
import { IngredientIcon } from './IngredientIcon';
import type { IngredientKey } from './ingredientData';

const MESSAGES = ['Analizando tus ingredientes...', 'Buscando combinaciones...', 'Preparando algo delicioso...'];
const ORBIT_INGREDIENTS: IngredientKey[] = ['tomato', 'chicken', 'cheese', 'rice'];

// Loader propio en vez de un spinner genérico: un ChefHat central fijo con
// pequeños iconos de ingrediente orbitando alrededor (CSS puro, @keyframes
// en index.css) y el texto de estado rotando cada ~1.4s. Todo decorativo —
// no representa una llamada real a la IA, es la demostración del paso 02.
const CookingLoader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMessageIndex((i) => (i + 1) % MESSAGES.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-4">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/15 dark:border-primary/20" />
        <div className="absolute inset-0 motion-safe:animate-[spin_9s_linear_infinite]">
          {ORBIT_INGREDIENTS.map((ing, i) => (
            <span
              key={ing}
              className="absolute w-7 h-7 -ml-3.5 -mt-3.5 flex items-center justify-center rounded-full bg-white dark:bg-[#18130D] shadow-md text-primary"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${(360 / ORBIT_INGREDIENTS.length) * i}deg) translate(3.5rem) rotate(-${(360 / ORBIT_INGREDIENTS.length) * i}deg)`,
              }}
            >
              <IngredientIcon ingredient={ing} className="w-3.5 h-3.5" />
            </span>
          ))}
        </div>
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ChefHat className="w-7 h-7" />
        </div>
      </div>
      <p className="text-sm font-medium text-[#5C4E3A] dark:text-[#A89C86] h-5 transition-all duration-300" key={messageIndex}>
        {MESSAGES[messageIndex]}
      </p>
    </div>
  );
};

export default CookingLoader;
