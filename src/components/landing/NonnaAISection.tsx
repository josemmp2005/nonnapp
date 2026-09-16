import React from 'react';
import { Clock, ShoppingBasket, Users, Sparkles, History } from 'lucide-react';
import nonnaPhoto from '../../assets/nonna.webp';
import { Logo } from '../Logo';
import { Reveal } from './shared';

// Copy anclado a funcionalidades reales (timeLimit/mode/servings de
// GenerationParams, e historial automático) — nada de "recetas favoritas"
// ni gestos que la app no tiene todavía.
const FEATURES: { icon: React.ReactNode; label: string; float?: boolean }[] = [
  { icon: <Clock className="w-5 h-5" />, label: 'Se adapta al tiempo que tienes', float: true },
  { icon: <ShoppingBasket className="w-5 h-5" />, label: 'Aprovecha tus ingredientes' },
  { icon: <Users className="w-5 h-5" />, label: 'Ajusta las cantidades', float: true },
  { icon: <Sparkles className="w-5 h-5" />, label: 'Siempre una idea nueva' },
  { icon: <History className="w-5 h-5" />, label: 'Todo se guarda en tu historial' },
];

const NonnaAISection: React.FC = () => (
  <section className="bg-[#F1F5EC] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-12 lg:gap-16 items-center">
        <Reveal className="mx-auto lg:mx-0">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-[#18130D] shadow-xl">
              <img src={nonnaPhoto} alt="La Nonna" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-white dark:bg-[#18130D] shadow-lg flex items-center justify-center p-2.5">
              <Logo className="w-full h-full" showText={false} />
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="block text-xs font-semibold text-primary mb-2.5">Tecnología con cariño</span>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6] mb-3">
              La experiencia de una Nonna.
              <br />
              La potencia de la IA.
            </h2>
            <p className="text-sm md:text-[15.5px] text-[#5C4E3A] dark:text-[#8B8B90] mb-8 max-w-lg">
              Nonnapp no es un chatbot frío: razona como alguien que lleva toda la vida cocinando con lo que
              tiene a mano.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.label} delayMs={i * 80}>
                <div
                  className={`flex items-center gap-3 p-3.5 bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-xl shadow-sm ${
                    f.float ? 'motion-safe:animate-[float_6s_ease-in-out_infinite]' : ''
                  }`}
                  style={f.float ? { animationDelay: `${i * 300}ms` } : undefined}
                >
                  <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    {f.icon}
                  </span>
                  <span className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">{f.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default NonnaAISection;
