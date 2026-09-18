import React, { useState } from 'react';
import { Sparkles, Clock, Bookmark, ChefHat } from 'lucide-react';
import { Reveal } from './shared';
import { IngredientIcon } from './IngredientIcon';

const DEMO_VIDEO_SRC = '/videos/nonnapp-demo-mobile.mp4';

// Vídeo en vez de GIF: mismo resultado visual (autoplay, loop, sin
// controles) pero ~10x más ligero (300 KB vs. los 3 MB del GIF original),
// que era el mayor causante del peso total de la landing en Lighthouse.
// Si no carga (por lo que sea), se cae a un mockup estático de la interfaz
// en vez de dejar un hueco roto.
const PhoneFallbackMockup: React.FC = () => (
  <div className="absolute inset-0 flex flex-col bg-[#0D0A06]">
    <div className="px-4 pt-8 pb-3 border-b border-white/10">
      <div className="text-[10px] font-semibold tracking-wide uppercase text-white/40 mb-2">Tus ingredientes</div>
      <div className="flex flex-wrap gap-1.5">
        {(['chicken', 'rice', 'tomato'] as const).map((ing) => (
          <span key={ing} className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-[10px] text-white/80">
            <IngredientIcon ingredient={ing} className="w-3 h-3" />
          </span>
        ))}
      </div>
    </div>
    <div className="flex-grow flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
        <ChefHat className="w-6 h-6" />
      </div>
      <p className="text-xs text-white/60">Nonnapp está preparando tu receta...</p>
    </div>
  </div>
);

const DemoVideoSection: React.FC = () => {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section className="bg-[#152A1E] py-16 md:py-24 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.10)_0%,rgba(249,115,22,0)_72%)]" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <Reveal>
          <span className="block text-xs font-semibold text-primary mb-2.5">La app en acción</span>
          <h2 className="text-2xl md:text-[34px] font-bold tracking-tight text-white mb-3">Mira cómo funciona Nonnapp</h2>
          <p className="text-sm md:text-[15.5px] text-white/60 max-w-md mx-auto mb-12 md:mb-14">
            De ingredientes sueltos a una receta completa en segundos.
          </p>
        </Reveal>

        <Reveal delayMs={100} className="relative inline-block">
          {/* Marco de teléfono — aspect-ratio igual al del GIF real (500x782) para que
              object-cover no tenga que recortar los laterales y cortar texto */}
          <div className="relative w-[240px] sm:w-[280px] aspect-[500/782] mx-auto rounded-[2.5rem] border-[6px] border-[#0D0A06] bg-[#0D0A06] shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0D0A06] rounded-b-2xl z-20" />
            {!videoFailed ? (
              <video
                src={DEMO_VIDEO_SRC}
                width={500}
                height={782}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setVideoFailed(true)}
              />
            ) : (
              <PhoneFallbackMockup />
            )}
          </div>

          {/* Badges flotantes */}
          <div className="hidden md:flex absolute top-10 -left-36 items-center gap-2 px-3.5 py-2 rounded-full bg-white shadow-lg text-xs font-semibold text-[#241B10] motion-safe:animate-[float_5s_ease-in-out_infinite]">
            <Sparkles className="w-4 h-4 text-primary" />
            Generado con IA
          </div>
          <div className="hidden md:flex absolute top-1/2 -right-32 items-center gap-2 px-3.5 py-2 rounded-full bg-white shadow-lg text-xs font-semibold text-[#241B10] motion-safe:animate-[float_5s_ease-in-out_infinite_0.7s]">
            <Clock className="w-4 h-4 text-primary" />
            25 min
          </div>
          <div className="hidden md:flex absolute bottom-10 -left-32 items-center gap-2 px-3.5 py-2 rounded-full bg-white shadow-lg text-xs font-semibold text-[#241B10] motion-safe:animate-[float_5s_ease-in-out_infinite_1.4s]">
            <Bookmark className="w-4 h-4 text-primary" />
            Guardar receta
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default DemoVideoSection;
