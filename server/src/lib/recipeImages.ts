// Banco de fotos de recetas curado a mano: cada entrada enlaza fotos reales
// de Unsplash (misma estrategia que ya usan `RecipeShowcaseSection.tsx` y
// `chefTableContent.ts` en el frontend — URLs directas a `images.unsplash.com`,
// nunca se descargan ni se guardan binarios en el repo). No hay generación de
// imagen por IA: se elige la entrada cuya lista de `keywords` mejor encaja con
// el título/descripción/ingredientes de la receta, y dentro de esa entrada se
// escoge una foto al azar entre sus alternativas — así dos recetas de la
// misma categoría (dos "pasta con tomate", por ejemplo) no siempre enseñan
// literalmente la misma foto.
//
// Cómo ampliarlo: cada foto se ha revisado a ojo (no basta con que la URL
// responda 200: hay búsquedas que devuelven ventanas, lunas o comida de perro)
// y se comprueba que la URL final responde. Las fotos de Unsplash pueden
// retirarse con el tiempo — `tests/recipeImages.test.ts` valida el formato,
// pero para detectar fotos caídas hay que comprobar las URLs a mano.

export interface ImageEntry {
  keywords: string[];
  urls: string[];
  // Categoría genérica (pasta, pollo, ensalada, sopa...) frente a un plato con
  // nombre propio (carbonara, paella, pesto...): si el título menciona las dos,
  // gana el plato con nombre propio. Ver `pickRecipeImage`.
  generic?: boolean;
  // Subconjunto de `keywords` que solo describe el formato o el momento, no el
  // plato ("bowl", "desayuno"): pierden contra cualquier otra keyword del
  // título, así que "Bowl de avena" es avena y no un bowl de verduras.
  weak?: string[];
}

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// El ORDEN importa: a igual puntuación gana la entrada que va antes, así que
// los platos concretos van antes que sus categorías genéricas (paella antes
// que arroz, pollo frito antes que pollo, tortilla de patata antes que patata).
export const IMAGE_BANK: ImageEntry[] = [
  // --- Platos españoles y de cuchara ---
  {
    keywords: ['paella', 'fideua', 'arroz caldoso', 'arroz a banda'],
    urls: [u('1623961990059-28356e226a77'), u('1630175860333-5131bda75071'), u('1682988771291-da784f151ef7'), u('1714383611437-485d97141913')],
  },
  {
    keywords: ['tortilla de patata', 'tortilla de patatas', 'tortilla española', 'frittata'],
    urls: [u('1595519516956-9d085ab1cd50'), u('1780704664094-1595bf7c9a46'), u('1639669794539-952631b44515')],
  },
  {
    keywords: ['croqueta', 'croquette'],
    urls: [u('1674480367370-4e4bd64eb3c5'), u('1626011852881-4609127619a8'), u('1781446842582-0c30c427cd66')],
  },
  {
    keywords: ['gazpacho', 'salmorejo', 'ajoblanco', 'sopa fría'],
    urls: [u('1624382075163-a4fdb99b99ec'), u('1529566186297-155c18f9a434')],
  },
  {
    keywords: ['lenteja', 'garbanzo', 'alubia', 'judía', 'fabada', 'cocido', 'potaje', 'frijol', 'legumbre', 'fabes', 'pochas'],
    generic: true,
    urls: [u('1648455320791-a667c8aab7e4'), u('1543338861-24992308962f'), u('1591386767153-987783380885'), u('1612700722193-f0410adb8949')],
  },
  {
    keywords: ['guiso', 'estofado', 'carrillera', 'rabo de toro', 'stew', 'caldereta', 'chili'],
    urls: [u('1664741662725-bd131742b7b7'), u('1608500218882-986df81d55fc'), u('1596797038530-2c107229654b'), u('1723511413901-99439b957bbf')],
  },
  {
    keywords: ['ratatouille', 'pisto', 'menestra', 'samfaina', 'escalivada', 'tumbet'],
    urls: [u('1652622550740-f90d03edfbf0'), u('1785703285213-c15cbb8a286e'), u('1572453800999-e8d2d1589b7c')],
  },

  // --- Pasta e italiana ---
  {
    keywords: ['lasaña', 'lasagna', 'lasagne', 'canelón'],
    urls: [u('1466637574441-749b8f19452f'), u('1633436374784-7f9502eb348a'), u('1614961908593-2c6bf2bdf2ba'), u('1762631883229-95cfb6a063ad'), u('1709429790175-b02bb1b19207')],
  },
  {
    keywords: ['gnocchi', 'ñoqui', 'ravioli', 'tortellini', 'pasta rellena'],
    urls: [u('1645087177483-f760329f470f'), u('1757972367438-581ad5e299f5'), u('1628885363743-fbf9c98d4196'), u('1461009463816-4edea93afd6f'), u('1602198497744-89aa8454840a')],
  },
  {
    keywords: ['carbonara'],
    urls: [u('1608756687911-aa1599ab3bd9'), u('1560434019-4558f9a9e2a1'), u('1579631542720-3a87824fff86')],
  },
  {
    keywords: ['boloñesa', 'bolognese', 'ragú', 'ragu'],
    urls: [u('1692071097529-320eb2b32292'), u('1598866594230-a7c12756260f'), u('1600803734709-83f30a78e312')],
  },
  {
    keywords: ['pesto'],
    urls: [u('1706051574488-5fd203d39b3d'), u('1605590955562-be1a5fda4161'), u('1743352388509-835796029c79'), u('1707448460889-e268eb742820')],
  },
  {
    keywords: ['macarrones con queso', 'mac and cheese', 'mac & cheese'],
    urls: [u('1543339531-242d0bc29010'), u('1708184528301-b0dad28dded5'), u('1667499989723-c4ab9549d63c'), u('1654780105295-9227206f11ec')],
  },
  {
    keywords: ['berenjena', 'norma'],
    urls: [u('1473093295043-cdd812d0e601')],
  },
  {
    keywords: ['pizza', 'margarita', 'margherita', 'calzone'],
    urls: [u('1565299624946-b28f40a0ae38'), u('1568901346375-23c9450c58cd'), u('1658478006307-525ab032ab26'), u('1774806189085-50ffb246e013'), u('1649688423692-308d2fc1027d'), u('1604068549290-dea0e4a305ca')],
  },
  {
    keywords: ['pasta', 'espagueti', 'spaghetti', 'macarrones', 'tallarines', 'fideos', 'fettuccine'],
    generic: true,
    urls: [u('1608219992759-8d74ed8d76eb'), u('1476718406336-bb5a9690ee2a'), u('1504674900247-0877df9cc836')],
  },

  // --- Asia y Oriente Medio ---
  {
    keywords: ['sushi', 'maki', 'nigiri', 'sashimi', 'temaki'],
    urls: [u('1611143669185-af224c5e3252'), u('1617196035154-1e7e6e28b0db'), u('1607301405418-780ee5e6dd10'), u('1584583570840-0a3d88497593')],
  },
  {
    keywords: ['poke', 'poké'],
    urls: [u('1597958792579-bd3517df6399'), u('1759429179911-4e1f0e4e69f7'), u('1602881917445-0b1ba001addf'), u('1602881916963-5daf2d97c06e')],
  },
  {
    keywords: ['ramen', 'udon', 'pho', 'sopa de fideos'],
    urls: [u('1591814468924-caf88d1232e1'), u('1569718212165-3a8278d5f624'), u('1591325418441-ff678baf78ef'), u('1663147634679-78f6374cdde6')],
  },
  {
    keywords: ['gyoza', 'dumpling', 'wonton', 'baozi', 'dim sum'],
    urls: [u('1638502338747-f7f368214cce'), u('1768326119773-05cae29f4106'), u('1604632910985-5a738e3237d2'), u('1664138218128-2dcf791a9d27')],
  },
  {
    keywords: ['pad thai', 'bibimbap', 'kimchi', 'banh mi', 'rollito de primavera', 'spring roll', 'banh xeo', 'vietnamita', 'coreana', 'tailandesa'],
    urls: [u('1655091273851-7bdc2e578a88'), u('1590301157890-4810ed352733'), u('1713047203705-44dd7d762d0c'), u('1582454235987-1e597bafcf58')],
  },
  {
    keywords: ['tikka', 'masala', 'biryani', 'naan', 'dal', 'indio', 'india', 'tandoori', 'curry', 'bunny chow'],
    urls: [u('1631292784640-2b24be784d5d'), u('1631515243349-e0cb75fb8d3a'), u('1631452180539-96aca7d48617'), u('1716535232842-d10da4eb33d5')],
  },
  {
    keywords: ['salteado', 'wok', 'asiática', 'thai', 'noodles', 'fideos chinos'],
    urls: [u('1512058564366-18510be2db19'), u('1543339494-b4cd4f7ba686')],
  },
  {
    keywords: ['falafel', 'kebab', 'shawarma', 'pita', 'durum', 'gyros', 'souvlaki', 'kofta'],
    urls: [u('1680405531955-8b4981bb1b0c'), u('1633321702518-7feccafb94d5'), u('1558458601-0d69a278b8e6'), u('1532636875304-0c89119d9b4d')],
  },
  {
    keywords: ['hummus', 'humus', 'baba ganoush', 'tzatziki', 'mezze'],
    urls: [u('1603133872497-f29809b750bf'), u('1637949907734-d5583aa35b41'), u('1753364547864-679728b22c31'), u('1637949385162-e416fb15b2ce')],
  },
  {
    keywords: ['cuscús', 'couscous', 'tabulé', 'bulgur'],
    urls: [u('1607116685391-29c9e9726561'), u('1626901148200-0e934140a02b'), u('1739217744880-472f59559cc5'), u('1788538244952-de7dbe58a5ae')],
  },

  // --- Latinoamérica y bowls ---
  {
    keywords: ['empanada', 'empanadilla', 'pastelito'],
    urls: [u('1624128082323-beb6b8b508db'), u('1634750188038-d0f806ebe6c5'), u('1679310249395-ae267ae0d273'), u('1609525313344-a56b96f20718')],
  },
  {
    keywords: ['arepa', 'pupusa'],
    urls: [u('1587603366933-aa6947174c65'), u('1747671730852-357e42bb9372'), u('1644753787071-8933b5daed2d'), u('1619683909099-03814b162136')],
  },
  {
    keywords: ['taco', 'mexicana', 'burrito', 'nachos', 'quesadilla', 'enchilada', 'fajita', 'chilaquiles', 'tex-mex'],
    urls: [u('1551504734-5ee1c4a1479b'), u('1613514785940-daed07799d9b'), u('1700625916627-16ad4fb0553c'), u('1599974579688-8dbdd335c77f'), u('1534352956036-cd81e27dd615'), u('1613514967307-d5b3471b2453'), u('1666025956292-c5bf3417aaaf')],
  },
  {
    keywords: ['coliflor', 'quinoa', 'bowl', 'buddha bowl', 'bowl saludable', 'burrito bowl'],
    generic: true,
    weak: ['bowl'],
    urls: [u('1512621776951-a57141f2eefd'), u('1615865417491-9941019fbc00'), u('1623428186429-e76984bf48ad'), u('1623428187425-873f16e10554'), u('1649000475401-6bc57e7ecf48'), u('1566740933449-11e38b77e6e5'), u('1743779665801-ae26f2d84525'), u('1635107420370-b9fac732b284'), u('1668665771757-4d42737d295a')],
  },

  // --- Carnes ---
  {
    keywords: ['steak', 'entrecot', 'entrecôte', 'chuletón', 'bistec', 'churrasco', 'solomillo', 'filete', 'ribeye'],
    urls: [u('1546964124-0cce460f38ef'), u('1706650616334-97875fae8521'), u('1583953623787-ada99d338235'), u('1712746785126-e9f28b5b3cc0')],
  },
  {
    keywords: ['albóndiga', 'meatball'],
    urls: [u('1529042410759-befb1204b468'), u('1677139599935-67eb22b12bb1'), u('1515516969-d4008cc6241a'), u('1625147541750-dfecb0a624a5')],
  },
  {
    keywords: ['pollo frito', 'alita', 'nugget', 'fried chicken', 'pollo rebozado'],
    urls: [u('1694853651800-3e9b4aa96a42'), u('1650939986300-ce9609921fa7'), u('1637273484026-11d51fb64024'), u('1624153064067-566cae78993d')],
  },
  {
    keywords: ['pavo', 'pato', 'pintada', 'capón', 'turkey', 'duck', 'codorniz'],
    generic: true,
    urls: [u('1606728035253-49e8a23146de'), u('1611489142329-5f62cfa43e6e'), u('1445865303228-f3c2d519aa97'), u('1611270630211-3a7e9496c24c')],
  },
  {
    keywords: ['cordero', 'lamb', 'cabrito', 'cochinillo', 'lechazo', 'paletilla'],
    generic: true,
    urls: [u('1635897411141-7bd2b9c6ab16'), u('1580476262843-d5e9b687d4d4'), u('1625604087024-7fb428fc4626'), u('1625631980820-fbdc8ca2e902')],
  },
  {
    keywords: ['cerdo', 'costilla', 'lomo', 'panceta', 'chuleta', 'pork', 'secreto', 'presa'],
    generic: true,
    urls: [u('1679711246825-1f2bd51b16d0'), u('1652209898504-ea7f96b44580'), u('1595507238835-bff863eb6edb'), u('1652378452875-5f80beafc549')],
  },
  {
    keywords: ['pollo', 'chicken', 'pechuga', 'muslo', 'contramuslo'],
    generic: true,
    urls: [u('1547592180-85f173990554'), u('1495214783159-3503fd1b572d'), u('1615557960916-5f4791effe9d'), u('1598515214211-89d3c73ae83b'), u('1606728035253-49e8a23146de'), u('1652545296821-09a023a9fd08')],
  },
  {
    keywords: ['hamburguesa', 'burger', 'cheeseburger'],
    urls: [u('1571091718767-18b5b1457add'), u('1490645935967-10de6ba17061'), u('1476224203421-9ac39bcb3327'), u('1572802419224-296b0aeee0d9'), u('1610440042657-612c34d95e9f'), u('1667329829058-ac191ba4a905'), u('1568901346375-23c9450c58cd')],
  },
  {
    keywords: ['brocheta', 'pincho', 'pinchito', 'skewer', 'espeto'],
    urls: [u('1626323107927-008ae2828ab6'), u('1603360946369-dc9bb6258143'), u('1593708659671-595be1c95128'), u('1705359573325-f2006d5e459f')],
  },
  {
    keywords: ['barbacoa', 'bbq', 'parrilla', 'brasa'],
    generic: true,
    urls: [u('1555939594-58d7cb561ad1'), u('1563805042-7684c019e1cb')],
  },
  {
    keywords: ['ternera', 'carne', 'osobuco', 'vacuno', 'buey', 'carne picada'],
    generic: true,
    urls: [u('1615937657715-bc7b4b7962c1'), u('1546964124-0cce460f38ef'), u('1706650616334-97875fae8521')],
  },

  // --- Sopas y ensaladas ---
  {
    keywords: ['sopa de cebolla', 'onion soup'],
    urls: [u('1589563766992-49797b1148a2'), u('1741318714411-fad939b8580a'), u('1648889095694-c597b314356e')],
  },
  {
    keywords: ['calabaza', 'pumpkin', 'crema de calabaza', 'butternut'],
    generic: true,
    urls: [u('1530734575165-ce39d996fbaa'), u('1476718406336-bb5a9690ee2a'), u('1541095441899-5d96a6da10b8'), u('1708410262792-74d07c9f2581')],
  },
  {
    keywords: ['sopa', 'crema de', 'caldo', 'consomé', 'minestrone', 'puchero', 'crema de verduras', 'crema de champiñones', 'crema de puerros', 'vichyssoise'],
    generic: true,
    urls: [u('1547592166-23ac45744acd'), u('1571997478779-2adcbbe9ab2f'), u('1584972922016-912db9f3df22'), u('1603105037880-880cd4edfb0d'), u('1665594051407-7385d281ad76'), u('1594756202469-9ff9799b2e4e')],
  },
  {
    keywords: ['caprese', 'ensalada griega', 'ensalada caprese', 'ensalada de tomate'],
    urls: [u('1610817153377-e54299ffdb1e'), u('1769458313937-b5ad8f84942e'), u('1625944230945-1b7dd3b949ab'), u('1573409157844-6a56035363fc')],
  },
  {
    keywords: ['ensalada', 'lechuga', 'vegetal fresco'],
    generic: true,
    urls: [u('1546069901-ba9599a7e63c'), u('1512152272829-e3139592d56f'), u('1605291535065-e1d52d2b264a'), u('1580013759032-c96505e24c1f'), u('1690573313202-4493a7d02e9c')],
  },

  // --- Verduras ---
  {
    keywords: ['espinaca', 'acelga', 'kale', 'col rizada', 'grelos'],
    generic: true,
    urls: [u('1778851182989-ea3f9d2d280b'), u('1771573042838-8b3adf17562e'), u('1580910365203-91ea9115a319'), u('1567056602606-6172dedda3ac')],
  },
  {
    keywords: ['seta', 'champiñón', 'hongo', 'portobello', 'shiitake', 'boletus', 'níscalo'],
    generic: true,
    urls: [u('1652088063505-d6d4d390b295'), u('1473093226795-af9932fe5856'), u('1772198537624-5501e3667457')],
  },
  {
    keywords: ['tofu', 'tempeh', 'seitan', 'soja', 'edamame'],
    generic: true,
    urls: [u('1546069901-55d1670321aa'), u('1722635940350-d1b2e5129379'), u('1596352670192-5a95e357df7b'), u('1546069901-5ec6a79120b0')],
  },
  {
    keywords: ['verdura', 'vegetariano', 'vegano', 'brócoli', 'calabacín', 'pimiento', 'hortaliza', 'judías verdes', 'verduras asadas', 'verduras a la plancha'],
    generic: true,
    urls: [u('1540420773420-3366772f4999'), u('1547496502-affa22d38842'), u('1625944227313-4f7f68e6b3fa'), u('1641106598699-fded88953e2e'), u('1636743716922-1884c23fb6f6'), u('1572928896925-36df69c2567c')],
  },

  // --- Pescado y marisco ---
  {
    keywords: ['ceviche', 'tiradito', 'leche de tigre'],
    urls: [u('1535399831218-d5bd36d1a6b3'), u('1681394421550-83cc9341b9f8'), u('1731570225640-7ddad4231679'), u('1601579110733-f654670d8c30')],
  },
  {
    keywords: ['calamar', 'pulpo', 'sepia', 'chipirón', 'rabas', 'octopus', 'squid'],
    generic: true,
    urls: [u('1682264895449-f75b342cbab6'), u('1582629413153-f78e0c252cf5'), u('1734771219838-61863137b117')],
  },
  {
    keywords: ['mejillón', 'almeja', 'vieira', 'ostra', 'berberecho', 'navaja', 'mussel', 'clam'],
    generic: true,
    urls: [u('1582759777896-0aaa738a5c38'), u('1600265721436-734abbfe2137'), u('1608135227059-95aacee01035')],
  },
  {
    keywords: ['marisco', 'gamba', 'camarón', 'langostino', 'cigala', 'bogavante', 'langosta'],
    generic: true,
    urls: [u('1540189549336-e6e99c3679fe'), u('1691201659377-978b28daa417'), u('1625943555419-56a2cb596640'), u('1625943553852-781c6dd46faa'), u('1579783411296-c908953b2dcd')],
  },
  {
    keywords: ['salmón', 'pescado', 'atún', 'lubina', 'bacalao', 'merluza', 'dorada', 'trucha', 'sardina', 'boquerón', 'rape', 'emperador'],
    generic: true,
    urls: [u('1580476262798-bddd9f4b7369'), u('1560717845-968823efbee1'), u('1532550907401-a500c9a57435'), u('1587913956756-4fcf4833241d'), u('1608424414817-2f029ed49832'), u('1556814901-18c866c057da'), u('1535424921017-85119f91e5a1')],
  },

  // --- Arroces ---
  {
    keywords: ['risotto'],
    urls: [u('1682428617976-f25633ed8469'), u('1476124369491-e7addf5db371'), u('1712407881629-a8ca82a3c64f'), u('1680404840959-3211731fbb52')],
  },
  {
    keywords: ['arroz frito', 'arroz salteado', 'fried rice', 'arroz tres delicias'],
    urls: [u('1603133872878-684f208fb84b'), u('1751618646882-4221d5e3b1c2'), u('1612755637313-9517f17d84b5'), u('1596560548464-f010549b84d7')],
  },
  {
    keywords: ['arroz con leche', 'rice pudding'],
    urls: [u('1665529555367-8a4672d97641'), u('1665529545347-8eac2abf7f41'), u('1600676626897-eb2fb18a21e0'), u('1604748839931-5b5104964970')],
  },
  {
    keywords: ['arroz', 'rice', 'arroz blanco'],
    generic: true,
    urls: [u('1476124369491-e7addf5db371'), u('1541014741259-de529411b96a')],
  },

  // --- Desayunos, bocadillos y panes ---
  {
    keywords: ['quiche', 'tarta salada', 'hojaldre', 'pastel de carne'],
    urls: [u('1650844010413-3f24dc1c182b'), u('1608855238293-a8853e7f7c98'), u('1565593427994-7d6d81690905'), u('1788600447970-6b5167889f34')],
  },
  {
    keywords: ['focaccia', 'bagel', 'ciabatta'],
    urls: [u('1711805064484-a77096f599a6'), u('1687175452217-e4f8e523b5b5'), u('1613152834645-875f24eb961c'), u('1621792955662-8959d3a3e10e')],
  },
  {
    keywords: ['bocadillo', 'sándwich', 'sandwich', 'bocata', 'panini', 'tostado', 'croque', 'montadito'],
    generic: true,
    urls: [u('1550507992-eb63ffee0847'), u('1608897013039-887f21d8c804'), u('1709689156424-16fe0e05b47b'), u('1678969405738-323f9acb3c18'), u('1528735602780-2552fd46c7af'), u('1709689156420-4de2c03a2e9e')],
  },
  {
    keywords: ['wrap'],
    urls: [u('1632660346941-023cc64e1252'), u('1563282397-db1ac3a6bf86'), u('1719282431723-9d0f4370d4bc'), u('1626700051175-6818013e1d4f')],
  },
  {
    keywords: ['bruschetta', 'tapa', 'crostini', 'pimientos de padrón', 'picoteo', 'aperitivo'],
    urls: [u('1572695157366-5e585ab2b69f'), u('1630230596557-ad07b433f5c0'), u('1709740198353-df155e1acf36'), u('1542986151-13ecf8e0453e')],
  },
  {
    keywords: ['aguacate', 'avocado', 'guacamole'],
    generic: true,
    urls: [u('1687276287139-88f7333c8ca4'), u('1623691752358-0be1e4235183'), u('1633204339691-9d3645430e14'), u('1595016111459-799a195e7452')],
  },
  {
    keywords: ['tortita', 'pancake', 'crepe', 'crepes', 'gofre', 'waffle', 'panqueque', 'hotcake'],
    urls: [u('1587339144367-f1cacbecac82'), u('1568051243851-f9b136146e97'), u('1690267780363-342025f3cd71'), u('1612182062966-c8fe45ecbf73'), u('1519676867240-f03562e64548')],
  },
  {
    keywords: ['torrija', 'french toast', 'pan perdido'],
    urls: [u('1620921575116-fb8902865f81'), u('1631359544940-535dcc2dc72c'), u('1597200284813-aeddf0653f54'), u('1748468863720-8b7345b1b29d')],
  },
  {
    keywords: ['huevos revueltos', 'huevos rotos', 'huevos fritos', 'huevos pochados', 'huevos benedict', 'omelette', 'revuelto', 'tortilla francesa', 'tortilla de huevo'],
    urls: [u('1687630433653-e6c9faec95b3'), u('1563690449029-d6e1b8d6003d'), u('1677844592730-ce9c936d8f1a'), u('1562918005-50afb98e5d32')],
  },
  {
    keywords: ['avena', 'porridge', 'granola', 'yogur', 'yogurt', 'overnight', 'muesli', 'açaí', 'smoothie bowl'],
    generic: true,
    urls: [u('1654923064926-be7e64267a31'), u('1552320764-9fc870798a3f'), u('1684403731883-67a71a793d2d'), u('1590288488147-f46142daf112')],
  },
  {
    keywords: ['desayuno', 'huevo', 'tostada', 'brunch', 'breakfast', 'tortilla'],
    generic: true,
    weak: ['desayuno', 'brunch', 'breakfast'],
    urls: [u('1525351484163-7529414344d8'), u('1567620905732-2d1ec7ab7445'), u('1544025162-d76694265947')],
  },
  {
    keywords: ['croissant', 'napolitana', 'bollería', 'brioche', 'pain au chocolat', 'ensaimada'],
    urls: [u('1613929231151-d7571591259e'), u('1681218424681-b4f8228ecea9'), u('1583338917451-face2751d8d5')],
  },
  {
    keywords: ['pan', 'panadería', 'masa madre', 'bollo', 'hogaza', 'baguette', 'pan casero', 'sourdough'],
    generic: true,
    urls: [u('1509440159596-0249088772ff'), u('1626074353765-517a681e40be'), u('1675725291010-cb1020860cb2'), u('1517141544637-42b300cb4ee9'), u('1620921586333-b7566c34550a'), u('1562099870-a3c3f2f3b44d')],
  },

  // --- Postres y dulces ---
  {
    keywords: ['galleta', 'cookie', 'brownie', 'muffin', 'magdalena', 'cupcake', 'mantecado', 'polvorón'],
    urls: [u('1499636136210-6f4ee915583e'), u('1636743715220-d8f8dd900b87'), u('1607958996333-41aef7caefaa'), u('1634513760358-849d427caaad')],
  },
  {
    keywords: ['chocolate caliente', 'chocolate a la taza', 'cacao caliente', 'hot chocolate'],
    urls: [u('1637572815755-c4b80092dce1'), u('1608651057580-4a50b2fc2281'), u('1608735484399-b7ec8f9945c1'), u('1542990253-0d0f5be5f0ed')],
  },
  {
    keywords: ['chocolate', 'mousse', 'coulant', 'fondant', 'cacao', 'trufa'],
    generic: true,
    urls: [u('1698688334089-c68105801d02'), u('1603032305813-be7441bc1037'), u('1673551490243-f29547426841'), u('1654921913191-f535f8978768')],
  },
  {
    keywords: ['helado', 'sorbete', 'gelato', 'granizado', 'ice cream'],
    urls: [u('1629385701021-fcd568a743e8'), u('1570197788417-0e82375c9371'), u('1497034825429-c343d7c6a68f'), u('1560008581-09826d1de69e')],
  },
  {
    keywords: ['tiramisú', 'tiramisu', 'mascarpone'],
    urls: [u('1571115177098-24ec42ed204d'), u('1631206753348-db44968fd440'), u('1662230786065-154eafffa3e6'), u('1710106519622-8c49d0bcff2f')],
  },
  {
    keywords: ['flan', 'natilla', 'crema catalana', 'pudín', 'pudding', 'panna cotta', 'panacota', 'cuajada'],
    urls: [u('1653988354010-39637252a2db'), u('1702728052103-69473aa7ed77'), u('1603236268617-d023914d9416'), u('1518710101263-54e0350377bb')],
  },
  {
    keywords: ['churro', 'porra', 'buñuelo'],
    urls: [u('1615915848347-5ad361d3e9fd'), u('1505851498219-ee2449c18936'), u('1735590624268-67c7845577b4')],
  },
  {
    keywords: ['donut', 'rosquilla', 'dona', 'berlina'],
    urls: [u('1646615077267-97c6088b74d9'), u('1527515545081-5db817172677'), u('1514517521153-1be72277b32f')],
  },
  {
    keywords: ['tarta de queso', 'cheesecake'],
    urls: [u('1565958011703-44f9829ba187')],
  },
  {
    keywords: ['tarta de manzana', 'pie de manzana', 'apple pie', 'tatin', 'strudel', 'manzana'],
    urls: [u('1621743478914-cc8a86d7e7b5'), u('1562007908-69cf18a6da04'), u('1667804068710-c0eaa0e6e250'), u('1584541305671-af4f46b4be2f'), u('1572383672419-ab35444a6934')],
  },
  {
    keywords: ['tarta', 'pastel', 'cake', 'postre dulce', 'bizcocho', 'pavlova'],
    generic: true,
    urls: [u('1587314168485-3236d6710814'), u('1563379926898-05f4575a45d8'), u('1517244683847-7456b63c5969')],
  },
  {
    keywords: ['fruta', 'macedonia', 'fresa', 'plátano', 'melocotón', 'sandía', 'melón', 'frutos rojos', 'fruit'],
    generic: true,
    urls: [u('1658431618300-a69b07fb5782'), u('1631718051263-c567dca19362'), u('1490474418585-ba9bad8fd0ea')],
  },
  {
    keywords: ['mermelada', 'confitura', 'conserva', 'encurtido', 'pickle', 'chutney', 'compota'],
    generic: true,
    urls: [u('1631394058703-ccddee661403'), u('1707092009843-2b5a919d17b0'), u('1645871317023-00ca188755de'), u('1645871306587-bebaa2f1dfc0')],
  },

  // --- Bebidas ---
  {
    keywords: ['batido', 'smoothie', 'zumo', 'jugo', 'bebida', 'licuado'],
    generic: true,
    urls: [u('1502741338009-cac2772e18bc'), u('1484723091739-30a097e8f929'), u('1650660149368-95e712f12ef0'), u('1665833876953-9aa02c235d9f'), u('1610970881699-44a5587cabec'), u('1511909525232-61113c912358')],
  },
  {
    keywords: ['limonada', 'lemonade', 'naranjada', 'agua fresca'],
    urls: [u('1623084921164-4a8c5c37a912'), u('1656936637945-571e3f0893f9'), u('1523677011781-c91d1bbe2f9e')],
  },
  {
    keywords: ['café', 'capuchino', 'cappuccino', 'latte', 'espresso', 'cortado', 'matcha'],
    generic: true,
    urls: [u('1502462041640-b3d7e50d0662'), u('1587080413959-06b859fb107d'), u('1503481766315-7a586b20f66d'), u('1541167760496-1628856ab772')],
  },
  {
    keywords: ['sangría', 'cocktail', 'cóctel', 'mojito', 'spritz', 'aperol', 'tinto de verano', 'vermut'],
    urls: [u('1693680501302-92c21ca086e0'), u('1657313666513-70770d329ef4'), u('1570598912132-0ba1dc952b7d'), u('1610935590777-a644e5c30e29')],
  },

  // --- Otros ---
  {
    keywords: ['patata', 'papa', 'puré'],
    generic: true,
    urls: [u('1518013431117-eb1465fa5752'), u('1516685018646-549198525c1b')],
  },
  {
    keywords: ['queso', 'tabla', 'embutido', 'charcutería', 'fondue', 'raclette'],
    generic: true,
    urls: [u('1432139509613-5c4255815697'), u('1589881210718-42da05899fe4'), u('1601912262364-3a35aa0d9399'), u('1727975399471-1d6f8ce91bbb'), u('1668094497457-29f4bd775c95')],
  },
];

export const DEFAULT_IMAGES = [u('1495521821757-a1efb6729352'), u('1481931098730-318b6f776db0')];

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // quita acentos para que "pastel"/"pastél" cuenten igual

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Coincidencia por palabra completa, tolerando plural ("gamba"/"gambas",
// "limón"/"limones"). Antes era por subcadena y daba falsos positivos como
// "res" dentro de "fresa" o "pan" dentro de "pancakes".
// Niveles: 0 = plato con nombre propio, 1 = categoría genérica, 2 = palabra débil
// (formato o momento del día: bowl, desayuno...).
const WEAK_TIER = 2;
const compiled = IMAGE_BANK.map((entry) => {
  const weak = new Set((entry.weak ?? []).map((kw) => normalize(kw.trim())));
  return {
    entry,
    matchers: entry.keywords.map((kw) => {
      const normalized = normalize(kw.trim());
      return {
        tier: weak.has(normalized) ? WEAK_TIER : entry.generic ? 1 : 0,
        length: normalized.length,
        words: normalized.split(/\s+/).length,
        // grupo 1 = la keyword en sí (sin el carácter separador que la precede)
        re: new RegExp(`(?:^|[^a-z0-9])(${escapeRegExp(normalized)}(?:s|es)?)(?![a-z0-9])`),
      };
    }),
  };
});

// "pasta de camarón", "harina de arroz" o "caldo de pollo" son derivados que
// se usan como base o condimento, no el ingrediente que da nombre al plato: se
// quitan antes de puntuar la descripción y los ingredientes.
const DERIVED_PRODUCT =
  /\b(?:pasta|harina|caldo|salsa|aceite|zumo|jugo|polvo|extracto|vinagre|licor|concentrado|esencia|cubito|pastilla)s? (?:de |del |de la |de los |de las )[a-z0-9]+/g;
const stripDerived = (text: string): string => text.replace(DERIVED_PRODUCT, ' ');

// Los primeros ingredientes de la lista son el plato principal (Groq los da en
// ese orden); el resto son acompañamientos y fondo de despensa.
const MAIN_INGREDIENTS = 3;
const MAIN_INGREDIENT_WEIGHT = 3;
const SIDE_INGREDIENT_WEIGHT = 1;
// Sin al menos esta puntuación (una mención en un ingrediente principal, o dos
// en la descripción) se prefiere la foto genérica antes que una equivocada.
const MIN_REST_SCORE = 2;

interface TitleMatch {
  tier: number;
  start: number;
  length: number;
}

// ¿`a` gana a `b`? Primero el nivel (plato con nombre propio antes que
// categoría genérica), luego la posición en el título (antes = mejor) y a
// igual posición la keyword más larga (la más específica).
const beats = (a: TitleMatch, b: TitleMatch | null): boolean =>
  !b ||
  a.tier < b.tier ||
  (a.tier === b.tier && (a.start < b.start || (a.start === b.start && a.length > b.length)));

const pickRandom = (urls: string[]): string => urls[Math.floor(Math.random() * urls.length)];

// Reglas, pensadas para títulos en español ("Ensalada de pollo", "Pasta
// carbonara", "Paella de marisco"):
//   1. Sumar coincidencias de la descripción hacía ganar a ingredientes
//      sueltos sobre el plato real (una paella cuya descripción cita tres
//      mariscos acababa con foto de marisco), así que si el título contiene
//      alguna keyword, decide solo el título:
//        a. un plato con nombre propio (carbonara, paella, pesto...) gana a una
//           categoría genérica (`generic`: pasta, pollo, ensalada, sopa...);
//        b. entre iguales, el que aparece antes en el título (el plato
//           principal suele ir primero; lo demás son acompañamientos);
//        c. a igual posición, la keyword más larga ("tarta de queso" antes
//           que "tarta"); y si sigue empatado, el que va antes en el banco.
//        d. las palabras `weak` (bowl, desayuno) solo deciden si no hay ninguna
//           otra keyword en el título.
//   2. Si el título no coincide con nada, decide la descripción + ingredientes:
//      cada keyword suma sus palabras, con más peso si está en uno de los
//      primeros ingredientes, sin contar derivados ("pasta de camarón") y solo
//      si llega a un mínimo — mejor la foto genérica que una equivocada.
// Devuelve la entrada elegida (o null si nada encaja: foto genérica de plato).
export const pickImageEntry = (title: string, description: string, ingredients: string[]): ImageEntry | null => {
  const titleText = normalize(title);
  const descriptionText = stripDerived(normalize(description));
  const ingredientTexts = ingredients.map((ingredient) => stripDerived(normalize(ingredient)));

  let bestByTitle: { match: TitleMatch; entry: ImageEntry } | null = null;
  let bestByRest: { score: number; entry: ImageEntry | null } = { score: MIN_REST_SCORE - 1, entry: null };

  for (const { entry, matchers } of compiled) {
    let entryMatch: TitleMatch | null = null;
    let restScore = 0;

    for (const { tier, length, words, re } of matchers) {
      const inTitle = re.exec(titleText);
      if (inTitle) {
        const candidate = { tier, start: inTitle.index + inTitle[0].length - inTitle[1].length, length };
        if (beats(candidate, entryMatch)) entryMatch = candidate;
      } else {
        // Una keyword cuenta una vez por la descripción y una vez por el mejor
        // ingrediente en el que aparece (no por cada "tomate" de la lista).
        let ingredientWeight = 0;
        ingredientTexts.forEach((text, i) => {
          if (re.test(text)) {
            ingredientWeight = Math.max(ingredientWeight, i < MAIN_INGREDIENTS ? MAIN_INGREDIENT_WEIGHT : SIDE_INGREDIENT_WEIGHT);
          }
        });
        restScore += words * ((re.test(descriptionText) ? 1 : 0) + ingredientWeight);
      }
    }

    if (entryMatch) {
      if (beats(entryMatch, bestByTitle && bestByTitle.match)) bestByTitle = { match: entryMatch, entry };
    } else if (restScore > bestByRest.score) {
      bestByRest = { score: restScore, entry };
    }
  }

  return bestByTitle ? bestByTitle.entry : bestByRest.entry;
};

// De la entrada elegida se devuelve una foto al azar; sin ninguna coincidencia
// se usa una foto genérica de plato.
export const pickRecipeImage = (title: string, description: string, ingredients: string[]): string =>
  pickRandom((pickImageEntry(title, description, ingredients) ?? { urls: DEFAULT_IMAGES }).urls);
