/**
 * Avatar de la Nonna: recorta una de sus poses (ilustraciones de
 * `assets/nonna/`) para mostrarla en círculo.
 */

import React from 'react';
import nonnaChat from '../../assets/nonna/nonna-chat.webp';
import nonnaThinking from '../../assets/nonna/nonna-thinking.webp';
import nonnaWink from '../../assets/nonna/nonna-wink.webp';

// Cada pose es una ilustración cuadrada con transparencia. Para el avatar
// circular se amplía `zoom` veces y se desplaza para que (cx, cy) —el centro
// de la cara, en fracción de la imagen— caiga en el centro del círculo.
const POSES = {
  chat: { src: nonnaChat, cx: 0.52, cy: 0.45, zoom: 1.4 },
  thinking: { src: nonnaThinking, cx: 0.5, cy: 0.42, zoom: 1.4 },
  wink: { src: nonnaWink, cx: 0.5, cy: 0.42, zoom: 1.35 },
};

export type NonnaPose = keyof typeof POSES;

interface NonnaAvatarProps {
  pose?: NonnaPose;
  className?: string;
  // Vacío = decorativo (p. ej. dentro de un botón que ya tiene aria-label).
  alt?: string;
}

// Avatar de la mascota (manual visual, secciones 27-32): `chat` para el
// asistente en general, `thinking` mientras prepara una respuesta.
export const NonnaAvatar: React.FC<NonnaAvatarProps> = ({ pose = 'chat', className = 'w-8 h-8', alt = 'Nonna' }) => {
  const { src, cx, cy, zoom } = POSES[pose];
  return (
    <div className={`relative flex-shrink-0 rounded-full overflow-hidden bg-primary/15 ${className}`}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute max-w-none select-none"
        style={{
          width: `${zoom * 100}%`,
          height: `${zoom * 100}%`,
          left: `${(0.5 - cx * zoom) * 100}%`,
          top: `${(0.5 - cy * zoom) * 100}%`,
        }}
      />
    </div>
  );
};

export default NonnaAvatar;
