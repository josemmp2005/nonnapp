/**
 * Tests del banco de imágenes de recetas: formato de las entradas y elección
 * de foto por palabras clave.
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_IMAGES, IMAGE_BANK, pickImageEntry, pickRecipeImage } from '../src/lib/recipeImages.js';

// Devuelve las fotos de la entrada del banco que contiene esa keyword exacta.
const urlsOf = (keyword: string): string[] => {
  const entry = IMAGE_BANK.find((e) => e.keywords.includes(keyword));
  if (!entry) throw new Error(`No hay ninguna entrada con la keyword "${keyword}"`);
  return entry.urls;
};

const pick = (title: string, description = '', ingredients: string[] = []) =>
  pickRecipeImage(title, description, ingredients);

// La entrada del banco que contiene esa keyword (sin aleatoriedad de por medio).
const entryOf = (keyword: string) => {
  const entry = IMAGE_BANK.find((e) => e.keywords.includes(keyword));
  if (!entry) throw new Error(`No hay ninguna entrada con la keyword "${keyword}"`);
  return entry;
};

describe('IMAGE_BANK', () => {
  it('cada entrada tiene keywords y al menos una foto con el formato esperado', () => {
    for (const entry of IMAGE_BANK) {
      expect(entry.keywords.length).toBeGreaterThan(0);
      expect(entry.urls.length).toBeGreaterThan(0);
      for (const url of entry.urls) {
        expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-\d+-[0-9a-f]+\?auto=format&fit=crop&w=1200&q=80$/);
      }
    }
  });

  it('no repite la misma keyword en dos entradas distintas', () => {
    const seen = new Map<string, number>();
    for (const [i, entry] of IMAGE_BANK.entries()) {
      for (const kw of entry.keywords) {
        expect(seen.has(kw), `"${kw}" está en las entradas ${seen.get(kw)} y ${i}`).toBe(false);
        seen.set(kw, i);
      }
    }
  });

  it('las palabras débiles (weak) son keywords de la propia entrada', () => {
    for (const entry of IMAGE_BANK) {
      for (const kw of entry.weak ?? []) {
        expect(entry.keywords, `"${kw}" está en weak pero no en keywords`).toContain(kw);
      }
    }
  });

  it('no repite fotos dentro de una misma entrada', () => {
    for (const entry of IMAGE_BANK) {
      expect(new Set(entry.urls).size).toBe(entry.urls.length);
    }
  });
});

describe('pickRecipeImage', () => {
  it('elige la categoría correcta para platos concretos', () => {
    expect(urlsOf('paella')).toContain(pick('Paella valenciana'));
    expect(urlsOf('sushi')).toContain(pick('Sushi casero de salmón'));
    expect(urlsOf('gazpacho')).toContain(pick('Gazpacho andaluz'));
    expect(urlsOf('tiramisú')).toContain(pick('Tiramisú clásico'));
  });

  it('un plato concreto gana a su categoría genérica', () => {
    // "paella" (concreta) frente a "arroz"/"marisco" (genéricas)
    expect(urlsOf('paella')).toContain(pick('Paella de marisco', 'Arroz con gambas y mejillones'));
    // "tortilla de patata" frente a "patata"/"desayuno"
    expect(urlsOf('tortilla de patata')).toContain(pick('Tortilla de patata', '', ['Patatas', 'Huevos']));
    // "pollo frito" frente a "pollo"
    expect(urlsOf('pollo frito')).toContain(pick('Pollo frito crujiente'));
  });

  it('un plato con nombre propio gana a una categoría genérica aunque vaya después', () => {
    expect(urlsOf('carbonara')).toContain(pick('Pasta carbonara cremosa'));
    expect(urlsOf('pesto')).toContain(pick('Pasta al pesto'));
  });

  it('entre categorías genéricas gana la que va primero en el título (plato principal)', () => {
    expect(urlsOf('ensalada')).toContain(pick('Ensalada de garbanzos'));
    expect(urlsOf('ensalada')).toContain(pick('Ensalada César con pollo crujiente'));
    expect(urlsOf('pasta')).toContain(pick('Pasta con gambas'));
    expect(urlsOf('sopa')).toContain(pick('Crema de calabacín'));
  });

  it('si el título no dice nada, decide la descripción y los ingredientes', () => {
    expect(urlsOf('pollo')).toContain(pick('Cena rápida', 'Un plato sencillo', ['Pechuga de pollo', 'Sal']));
  });

  it('una keyword de varias palabras pesa más que la genérica', () => {
    expect(urlsOf('tarta de queso')).toContain(pick('Tarta de queso al horno'));
    expect(urlsOf('sopa de cebolla')).toContain(pick('Sopa de cebolla gratinada'));
    expect(urlsOf('chocolate caliente')).toContain(pick('Chocolate caliente espeso'));
  });

  it('el título pesa más que los ingredientes', () => {
    // Un postre con huevos y harina en los ingredientes sigue siendo un postre
    expect(urlsOf('flan')).toContain(pick('Flan de huevo', '', ['Huevos', 'Leche', 'Azúcar', 'Pan']));
  });

  it('acepta plurales y no distingue acentos ni mayúsculas', () => {
    expect(urlsOf('tortita')).toContain(pick('PANCAKES con frutos rojos'));
    expect(urlsOf('gamba')).toContain(pick('Gambas al ajillo'));
    expect(urlsOf('lenteja')).toContain(pick('Lentejas estofadas'));
    expect(urlsOf('cuscús')).toContain(pick('Cuscus con verduras'));
  });

  it('no da falsos positivos por coincidencia dentro de otra palabra', () => {
    // "pan" no debe casar con "pancakes"/"panceta", ni "res" (ya eliminada) con "fresa"
    expect(urlsOf('tortita')).toContain(pick('Pancakes de avena'));
    expect(urlsOf('fresa')).toContain(pick('Fresas con nata'));
    // "pasta" dentro de "pastas de té" o "pastel" no debe disparar pasta
    expect(urlsOf('pastel')).toContain(pick('Pastel de zanahoria'));
  });

  it('usa una foto genérica cuando nada coincide', () => {
    expect(DEFAULT_IMAGES).toContain(pick('Receta misteriosa', 'Algo sin identificar', ['Sal']));
  });

  it('reparte entre las alternativas de una categoría (no siempre la misma)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 200; i++) results.add(pick('Paella valenciana'));
    expect(results.size).toBeGreaterThan(1);
  });
});

// Casos reales de recetas generadas (Sorpréndeme, Desayuno rápido, Modo Fit...)
// que acababan con una foto que no encajaba.
describe('pickImageEntry: casos reales', () => {
  it('"bowl" o "desayuno" describen el formato o el momento, no el plato: gana lo que va dentro', () => {
    expect(pickImageEntry('Bowl de avena energizante al microondas', '', [])).toBe(entryOf('avena'));
    expect(pickImageEntry('Bowl energético de avena y frutas', '', [])).toBe(entryOf('avena'));
    expect(pickImageEntry('Desayuno energético de avena con frutas', '', [])).toBe(entryOf('avena'));
    expect(pickImageEntry('Bowl de pollo con arroz', '', [])).toBe(entryOf('pollo'));
  });

  it('pero un bowl o un desayuno sin nada más concreto sigue teniendo su foto', () => {
    expect(pickImageEntry('Bowl saludable de verduras', '', [])).toBe(entryOf('bowl'));
    expect(pickImageEntry('Bowl de quinoa', '', [])).toBe(entryOf('quinoa'));
    expect(pickImageEntry('Desayuno completo', '', [])).toBe(entryOf('desayuno'));
    // "desayuno" es débil: gana el plato concreto (huevos revueltos) a la categoría
    expect(pickImageEntry('Desayuno con huevos revueltos', '', [])).toBe(entryOf('huevos revueltos'));
  });

  it('reconoce platos exóticos por su nombre', () => {
    expect(pickImageEntry('Bánh Xèo (crepes vietnamitas salteados)', '', [])).toBe(entryOf('pad thai'));
    expect(pickImageEntry('Bunny Chow Sudafricano', 'Pan hueco relleno de guiso', ['Pan de molde'])).toBe(entryOf('curry'));
  });

  it('un derivado no cuenta como el ingrediente ("pasta de camarón" no es pasta)', () => {
    expect(
      pickImageEntry(
        'Laing filipino (hojas de taro en leche de coco)',
        'Un plato tradicional filipino de hojas de taro cocidas lentamente en leche de coco aromatizada con camarón, chiles y especias.',
        ['Hojas de taro frescas', 'Leche de coco', 'Pasta de camarón (bagoong alamang)', 'Chiles rojos', 'Cebolla mediana']
      )
    ).toBeNull();
    // "caldo de pollo" tampoco convierte una sopa de verduras en un plato de pollo
    expect(pickImageEntry('Plato del día', 'Verduras al vapor', ['Caldo de pollo'])).toBeNull();
  });

  it('un participio de la descripción ("cocido lentamente") no dispara la categoría cocido', () => {
    expect(
      pickImageEntry(
        'Khorkhog Mongoliano',
        'Un festín tradicional de Mongolia: cordero cocido lentamente con verduras y piedras calientes.',
        ['Cordero (paleta o pierna)', 'Papas', 'Zanahorias', 'Cebolla', 'Sal gruesa']
      )
    ).toBe(entryOf('cordero'));
  });

  it('el ingrediente principal (los primeros de la lista) pesa más que el resto', () => {
    expect(
      pickImageEntry('Bobotie sudafricano', 'Cazuela de carne picada con especias y una capa cremosa de huevo.', [
        'Carne picada de res o cordero',
        'Cebolla picada',
        'Pan de molde sin corteza',
        'Leche',
        'Huevos',
      ])
    ).toBe(entryOf('ternera'));
  });

  it('una sola mención suelta en la descripción no basta: mejor la foto genérica que una equivocada', () => {
    expect(pickImageEntry('Plato misterioso', 'Un guiso con un toque de camarón.', ['Sal'])).toBeNull();
    expect(DEFAULT_IMAGES).toContain(pick('Plato misterioso', 'Un guiso con un toque de camarón.', ['Sal']));
  });
});
