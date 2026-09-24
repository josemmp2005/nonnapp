/**
 * `<img>` para fotos de receta con respaldo: si el enlace de Unsplash ya no
 * carga, pinta un recuadro con un gorro de chef.
 */

import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
}

// <img> con respaldo. Las fotos de receta son enlaces a Unsplash y pueden
// retirarse con el tiempo (ya pasó con una del banco antiguo, y las recetas
// guardadas conservan el enlace para siempre). Si la foto no carga se pinta un
// recuadro neutro con el gorro de chef, con las mismas clases de tamaño que la
// imagen, en vez del icono de imagen rota (o un hueco vacío si la imagen
// entraba con opacity-0 esperando a su onLoad).
const RecipeImage: React.FC<Props> = ({ src, alt = '', className = '', ...rest }) => {
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

  return <img {...rest} src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />;
};

export default RecipeImage;
