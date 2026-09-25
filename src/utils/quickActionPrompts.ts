/**
 * Textos que el dashboard manda a la IA en las acciones rápidas (Sorpréndeme,
 * Desayuno rápido, Modo Fit). Cada pulsación añade un enfoque distinto al texto
 * base para que las recetas no salgan siempre iguales.
 */

export type QuickAction = 'breakfast' | 'healthy' | 'surprise';

// Con un texto fijo la IA converge siempre en lo mismo (en las pruebas: 12 de 17
// desayunos rápidos eran de avena, todas las cenas fit de pollo y 11 de 39
// sorpresas un "Bunny Chow"). Se le da una pista distinta cada vez y los
// enfoques salen de una "bolsa" barajada: ninguno se repite hasta haber salido
// todos. Además, al pedir un formato que el modelo suele rellenar siempre con lo
// mismo (ensalada, sopa, salteado) se le dice explícitamente qué evitar.
const BREAKFAST_ANGLES = [
  'salado y con huevos (revueltos, pochados, en cocotte, muffins de huevo...)',
  'a base de tostadas o pan con un topping creativo (ricotta, hummus, aguacate, salmón, tomate...)',
  'dulce, con fruta fresca y yogur, requesón o queso fresco',
  'unas tortitas, crepes o gofres rápidos y saludables',
  'un batido o smoothie completo, para tomar en vaso',
  'de inspiración internacional (shakshuka, tamagoyaki, arepas, chilaquiles, congee...) y que salga en 15 minutos',
  'salado, con queso fresco, aguacate, tomate o verduras, sin huevo',
  'estilo mediterráneo, con pan, aceite de oliva, tomate y algo de proteína',
  'con frutos secos, semillas y fruta, sin cocinar',
  'un sándwich o wrap de desayuno con proteína',
];

const HEALTHY_ANGLES = [
  'con pescado azul o blanco (salmón, merluza, dorada, atún...)',
  'con huevo (tortilla, revuelto, huevos al horno...)',
  'con marisco (gambas, calamar, mejillones, pulpo...)',
  'con carne magra que no sea pollo (pavo, ternera, cerdo, conejo...)',
  'con tofu, tempeh o legumbres como proteína principal',
  'en formato ensalada completa y contundente, sin pollo',
  'en formato crema o sopa proteica, sin pollo',
  'con verduras al horno o a la plancha y una proteína que no sea pollo',
  'con pollo, pero con una preparación original',
  'estilo salteado o wok, rápido y sin pollo',
];

const SURPRISE_REGIONS = [
  'Perú', 'Japón', 'Corea', 'Vietnam', 'Tailandia', 'Indonesia', 'Filipinas', 'Sri Lanka',
  'China (una región concreta: Sichuan, Cantón, Hunan...)', 'India (una región concreta, no un curry genérico)',
  'Georgia (Cáucaso)', 'Turquía', 'Líbano', 'Irán', 'Uzbekistán', 'Marruecos', 'Túnez', 'Etiopía',
  'Nigeria', 'Ghana', 'Senegal', 'Sudáfrica', 'México (una región concreta)', 'Colombia', 'Brasil',
  'Argentina', 'Venezuela', 'el Caribe', 'Portugal', 'Grecia', 'Hungría', 'Polonia', 'los países nórdicos',
];

const PROMPTS: Record<QuickAction, { angles: string[]; build: (angle: string) => string }> = {
  breakfast: {
    angles: BREAKFAST_ANGLES,
    build: (angle) => `Un desayuno energético, saludable y rápido para empezar el día. Esta vez, ${angle}. No uses avena.`,
  },
  healthy: {
    angles: HEALTHY_ANGLES,
    build: (angle) => `Una cena ligera, baja en carbohidratos, alta en proteínas y llena de sabor. Esta vez, ${angle}.`,
  },
  surprise: {
    angles: SURPRISE_REGIONS,
    build: (region) => `Sorpréndeme con una receta exótica de ${region}. Algo que probablemente no haya cocinado antes.`,
  },
};

// Orden aleatorio de los índices 0..n-1 (Fisher-Yates). `% (i + 1)` cubre el
// borde random() === 1, que queda fuera del rango de Math.random.
const shuffledIndexes = (n: number, random: () => number): number[] => {
  const indexes = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)) % (i + 1);
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return indexes;
};

// `random` se inyecta para poder probarlo; el estado (la bolsa de enfoques que
// quedan de cada acción) vive en la instancia, no en el módulo.
export const createQuickActionPrompts = (random: () => number = Math.random) => {
  const bags: Partial<Record<QuickAction, number[]>> = {};
  const last: Partial<Record<QuickAction, number>> = {};
  return (action: QuickAction): string => {
    const { angles, build } = PROMPTS[action];
    let bag = bags[action];
    if (!bag || bag.length === 0) {
      bag = shuffledIndexes(angles.length, random);
      // Se saca por el final: el que saldría primero no puede ser el último de la ronda anterior.
      const next = bag.length - 1;
      if (bag[next] === last[action]) [bag[next], bag[0]] = [bag[0], bag[next]];
      bags[action] = bag;
    }
    const index = bag.pop()!;
    last[action] = index;
    return build(angles[index]);
  };
};

export const quickActionPrompt = createQuickActionPrompts();
