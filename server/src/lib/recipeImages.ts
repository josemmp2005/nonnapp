// Banco de fotos de recetas curado a mano: cada entrada enlaza fotos reales
// de Unsplash (misma estrategia que ya usan `RecipeShowcaseSection.tsx` y
// `chefTableContent.ts` en el frontend — URLs directas a `images.unsplash.com`,
// nunca se descargan ni se guardan binarios en el repo). No hay generación de
// imagen por IA: se elige la entrada cuya lista de `keywords` más coincide con
// el título/descripción/ingredientes de la receta, y dentro de esa entrada se
// escoge una foto al azar entre sus alternativas — así dos recetas de la
// misma categoría (dos "pasta con tomate", por ejemplo) no siempre enseñan
// literalmente la misma foto.

interface ImageEntry {
  keywords: string[];
  urls: string[];
}

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const IMAGE_BANK: ImageEntry[] = [
  {
    keywords: ['pasta', 'espagueti', 'spaghetti', 'macarrones', 'tallarines', 'fideos', 'fettuccine'],
    urls: [u('1608219992759-8d74ed8d76eb'), u('1476718406336-bb5a9690ee2a'), u('1504674900247-0877df9cc836')],
  },
  { keywords: ['lasaña', 'lasagna'], urls: [u('1466637574441-749b8f19452f')] },
  { keywords: ['berenjena', 'norma'], urls: [u('1473093295043-cdd812d0e601')] },
  { keywords: ['pizza'], urls: [u('1565299624946-b28f40a0ae38'), u('1568901346375-23c9450c58cd')] },
  {
    keywords: ['sopa', 'crema', 'caldo', 'consomé'],
    urls: [u('1547592166-23ac45744acd'), u('1571997478779-2adcbbe9ab2f')],
  },
  {
    keywords: ['ensalada', 'lechuga', 'vegetal fresco'],
    urls: [u('1546069901-ba9599a7e63c'), u('1512152272829-e3139592d56f')],
  },
  {
    keywords: ['pollo', 'chicken', 'pechuga'],
    urls: [u('1547592180-85f173990554'), u('1495214783159-3503fd1b572d')],
  },
  { keywords: ['ternera', 'carne', 'res', 'osobuco', 'filete', 'solomillo'], urls: [u('1615937657715-bc7b4b7962c1')] },
  {
    keywords: ['salmón', 'pescado', 'atún', 'lubina', 'bacalao'],
    urls: [u('1467003909585-2f8a7270028d'), u('1519676867240-f03562e64548')],
  },
  { keywords: ['marisco', 'gamba', 'camarón', 'langostino', 'ceviche', 'tiradito'], urls: [u('1540189549336-e6e99c3679fe')] },
  { keywords: ['arroz', 'risotto', 'paella'], urls: [u('1476124369491-e7addf5db371'), u('1541014741259-de529411b96a')] },
  {
    keywords: ['tarta', 'pastel', 'cake', 'postre dulce'],
    urls: [u('1587314168485-3236d6710814'), u('1563379926898-05f4575a45d8'), u('1517244683847-7456b63c5969')],
  },
  { keywords: ['tarta de queso', 'cheesecake'], urls: [u('1565958011703-44f9829ba187')] },
  {
    keywords: ['desayuno', 'huevo', 'tostada', 'tortilla'],
    urls: [u('1525351484163-7529414344d8'), u('1567620905732-2d1ec7ab7445'), u('1544025162-d76694265947')],
  },
  { keywords: ['bocadillo', 'sándwich', 'sandwich'], urls: [u('1550507992-eb63ffee0847'), u('1608897013039-887f21d8c804')] },
  { keywords: ['taco', 'mexicana', 'burrito', 'nachos', 'quesadilla'], urls: [u('1551504734-5ee1c4a1479b')] },
  { keywords: ['salteado', 'wok', 'asiática', 'thai', 'noodles', 'fideos chinos', 'curry'], urls: [u('1512058564366-18510be2db19'), u('1543339494-b4cd4f7ba686')] },
  { keywords: ['pan', 'panadería', 'masa madre', 'bollo'], urls: [u('1509440159596-0249088772ff'), u('1626074353765-517a681e40be')] },
  {
    keywords: ['verdura', 'vegetariano', 'vegano', 'brócoli', 'calabacín'],
    urls: [u('1540420773420-3366772f4999'), u('1547496502-affa22d38842')],
  },
  { keywords: ['patata', 'papa', 'puré'], urls: [u('1518013431117-eb1465fa5752'), u('1516685018646-549198525c1b')] },
  {
    keywords: ['barbacoa', 'bbq', 'parrilla', 'brasa'],
    urls: [u('1555939594-58d7cb561ad1'), u('1563805042-7684c019e1cb')],
  },
  { keywords: ['batido', 'smoothie', 'zumo', 'bebida'], urls: [u('1502741338009-cac2772e18bc'), u('1484723091739-30a097e8f929')] },
  { keywords: ['coliflor', 'quinoa', 'bowl saludable'], urls: [u('1512621776951-a57141f2eefd')] },
  { keywords: ['hamburguesa', 'burger'], urls: [u('1571091718767-18b5b1457add'), u('1490645935967-10de6ba17061'), u('1476224203421-9ac39bcb3327')] },
  { keywords: ['queso', 'tabla', 'embutido', 'charcutería'], urls: [u('1432139509613-5c4255815697')] },
];

const DEFAULT_IMAGES = [u('1495521821757-a1efb6729352'), u('1481931098730-318b6f776db0')];

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // quita acentos para que "pastel"/"pastél" cuenten igual

const pickRandom = (urls: string[]): string => urls[Math.floor(Math.random() * urls.length)];

// Elige la entrada cuya lista de keywords más aparece (como substring) en el
// título + descripción + nombres de ingredientes de la receta, y dentro de
// esa entrada una foto al azar entre sus alternativas. Sin match (puntuación
// 0), se usa una foto genérica de plato de comida.
export const pickRecipeImage = (title: string, description: string, ingredients: string[]): string => {
  const haystack = normalize([title, description, ...ingredients].join(' '));

  let best: { score: number; urls: string[] } = { score: 0, urls: DEFAULT_IMAGES };
  for (const entry of IMAGE_BANK) {
    const score = entry.keywords.reduce(
      (count, kw) => (haystack.includes(normalize(kw)) ? count + 1 : count),
      0
    );
    if (score > best.score) {
      best = { score, urls: entry.urls };
    }
  }
  return pickRandom(best.urls);
};
