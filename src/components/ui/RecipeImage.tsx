/**
 * `<img>` para fotos de receta con loader y respaldo: muestra un esqueleto
 * mientras la foto se descarga y la revela de golpe (con fundido) al estar
 * completa; si el enlace de Unsplash ya no carga, pinta un recuadro con un
 * gorro de chef.
 */

import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
}

// Las fotos de receta son enlaces a Unsplash de 1200 px: tardan en llegar y el
// navegador las pinta a trozos (borrosa, luego nítida) sobre una caja vacía,
// lo que se veía como si la foto "cambiara". Aquí la <img> se queda invisible
// hasta que termina de cargar y, mientras tanto, un esqueleto ocupa su sitio.
//
// El esqueleto es un hermano `absolute inset-0`, así que el contenedor de la
// imagen debe ser `relative`. Si la foto falla (las de Unsplash pueden
// retirarse y las recetas guardadas conservan el enlace para siempre) se pinta
// un recuadro neutro con el gorro de chef y las mismas clases de tamaño que la
// imagen, en vez del icono de imagen rota.
const RecipeImage: React.FC<Props> = ({ src, alt = '', className = '', style, onLoad, onError, ...rest }) => {
  // Guardan la URL (no un booleano) para que, si `src` cambia, el estado de la
  // foto anterior no se arrastre a la nueva.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={`${className} !opacity-100 flex items-center justify-center bg-primary/10 dark:bg-primary/5`}
      >
        <ChefHat aria-hidden="true" className="w-1/4 h-1/4 min-w-5 min-h-5 max-w-12 max-h-12 text-primary/40" />
      </div>
    );
  }

  const loaded = loadedSrc === src;

  return (
    <>
      {!loaded && <span aria-hidden="true" className="absolute inset-0 bg-primary/15 dark:bg-primary/10 motion-safe:animate-pulse" />}
      <img
        {...rest}
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500`}
        style={loaded ? style : { ...style, opacity: 0 }}
        onLoad={(e) => {
          setLoadedSrc(src);
          onLoad?.(e);
        }}
        onError={(e) => {
          setFailedSrc(src);
          onError?.(e);
        }}
      />
    </>
  );
};

export default RecipeImage;
