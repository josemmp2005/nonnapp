import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight } from 'lucide-react';
import { IngredientIcon } from './IngredientIcon';
import { Reveal } from './shared';

const FinalCtaSection: React.FC = () => (
  <section className="relative border-t border-white/10 bg-[#18130D] py-20 md:py-28 text-center overflow-hidden">
    <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 w-[560px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.14)_0%,rgba(249,115,22,0)_72%)]" />

    {/* Ingredientes decorativos, parcialmente cortados por los bordes */}
    <IngredientIcon ingredient="tomato" className="hidden sm:block absolute -left-6 top-10 w-24 h-24 text-white/[0.06] rotate-[-8deg]" />
    <IngredientIcon ingredient="avocado" className="hidden sm:block absolute -right-8 top-1/3 w-28 h-28 text-white/[0.06] rotate-[10deg]" />
    <IngredientIcon ingredient="onion" className="hidden sm:block absolute left-8 -bottom-8 w-24 h-24 text-white/[0.06] rotate-[6deg]" />
    <IngredientIcon ingredient="broccoli" className="hidden sm:block absolute -right-6 -bottom-6 w-28 h-28 text-white/[0.06] rotate-[-10deg]" />

    <div className="max-w-xl mx-auto px-6 relative z-10">
      <Reveal>
        <h2 className="mb-5 text-3xl md:text-[40px] font-bold tracking-tight leading-tight text-white">
          Tu próxima receta está a un ingrediente de distancia.
        </h2>
        <p className="mb-9 text-sm md:text-base text-white/60 max-w-md mx-auto">
          Abre la nevera. Cuéntanos qué tienes. Nonnapp se encarga del resto.
        </p>
        <Link
          to="/app"
          className="group inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-white text-base font-bold rounded-xl shadow-lg shadow-black/20 hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
        >
          <ChefHat className="w-5 h-5" />
          Comenzar a cocinar
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <p className="mt-5 text-xs text-white/40">Prueba gratis. Sin tarjeta de crédito.</p>
      </Reveal>
    </div>
  </section>
);

export default FinalCtaSection;
