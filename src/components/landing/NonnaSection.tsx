import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleQuestion } from 'lucide-react';
import nonnaChat from '../../assets/nonna/nonna-chat.webp';
import { Logo } from '../Logo';
import { Reveal } from './shared';

const QUESTIONS = ['¿Puedo sustituir la nata?', '¿Cuánto tiempo dejo reposar esto?', '¿Qué hago si no tengo huevos?'];

// Sección dedicada a la personalidad del asistente (distinta de "Cómo
// funciona" o del generador): aquí el foco es el chat en vivo mientras se
// cocina (Mesa de la Nonna, /app/chef), no la generación de recetas — por
// eso el fondo cambia a un oliva muy pálido, para separarla del resto.
const NonnaSection: React.FC = () => (
  <section id="nonna" className="scroll-mt-20 bg-accent-50 dark:bg-cream-dark border-t border-ink/10 dark:border-ink-light/10 py-16 md:py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_1fr] gap-12 lg:gap-16 items-center">
        <Reveal className="mx-auto lg:mx-0">
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 mx-auto">
            <div className="w-full h-full rounded-full bg-surface dark:bg-surface-dark shadow-xl overflow-hidden flex items-end justify-center">
              <img src={nonnaChat} alt="La Nonna" className="w-[115%] h-[115%] object-contain object-bottom" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-surface dark:bg-surface-dark shadow-lg flex items-center justify-center p-2.5">
              <Logo className="w-full h-full" showText={false} />
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="block text-xs font-semibold text-accent mb-2.5">¿Te has quedado con una duda?</span>
            <h2 className="font-display font-semibold text-2xl md:text-[34px] tracking-tight text-ink dark:text-ink-light mb-3">
              Pregunta a Nonna.
            </h2>
            <p className="text-sm md:text-[15.5px] leading-relaxed text-muted dark:text-muted-dark mb-7 max-w-lg">
              Sustituciones, cantidades, tiempos, técnicas... Nonna está ahí mientras cocinas.
            </p>
          </Reveal>

          <Reveal delayMs={100} className="flex flex-col gap-2.5 mb-8 max-w-md">
            {QUESTIONS.map((q) => (
              <div
                key={q}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 rounded-2xl rounded-bl-md text-sm text-body dark:text-body-dark shadow-sm w-fit"
              >
                <MessageCircleQuestion aria-hidden="true" className="w-4 h-4 text-accent flex-shrink-0" />
                {q}
              </div>
            ))}
          </Reveal>

          <Reveal delayMs={180}>
            <Link
              to="/app/chef"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
            >
              Preguntar a Nonna
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default NonnaSection;
