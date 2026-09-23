import React from 'react';
import { Link } from 'react-router-dom';
import tomatoSoup from '../../assets/tomato-soup.webp';
import { NonnaAvatar } from './shared';

const HeroSection: React.FC = () => (
  <section className="relative landing-hero-lines bg-[#FCF6EC] dark:bg-[#130F0A] pt-16 pb-0">
    <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[640px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.14)_0%,rgba(249,115,22,0)_72%)] dark:bg-[radial-gradient(circle,rgba(249,115,22,0.12)_0%,rgba(249,115,22,0)_72%)]" />

    <div className="max-w-[820px] mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="mb-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[#241B10] dark:text-[#F8F2E6]">
        Tu despensa, convertida<br />en la cena de hoy.
      </h1>

      <p className="mb-9 text-base md:text-lg leading-relaxed text-[#5C4E3A] dark:text-[#A89C86] max-w-md mx-auto">
        Dile a Nonnapp qué tienes en la nevera. En segundos recibes una receta completa, paso a paso, pensada como lo haría tu abuela.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 md:mb-16">
        <Link
          to="/app"
          className="group flex items-center gap-2 px-7 py-3 bg-primary text-[#130F0A] text-sm font-semibold rounded-lg shadow-lg shadow-primary/25 hover:bg-orange-400 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
        >
          Entrar a la Cocina
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
        <a
          href="#como-funciona"
          className="group flex items-center gap-1.5 text-sm font-medium text-[#3A2E1D] dark:text-[#E7DCC5] hover:text-primary dark:hover:text-primary transition-colors duration-300"
        >
          Ver cómo funciona
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    </div>

    {/* Product mock */}
    <div className="max-w-[960px] mx-auto px-6 pb-20 md:pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
      <div className="hidden sm:block font-hand absolute -top-1 right-14 md:right-16 z-20 -rotate-[4deg] bg-[#F0E4CE] text-[#2A2114] px-4 py-2 rounded-sm text-base md:text-lg shadow-lg border border-black/5">
        Directo de la cocina de la Nonna
      </div>

      <div className="bg-[#18130D] border border-[#F5E6CD]/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 transition-transform duration-500 hover:-translate-y-1.5">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F5E6CD]/10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#453A28]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#453A28]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#453A28]" />
          <span className="ml-2 text-[11px] text-[#9A8D74]">nonnapp.com/app/generate</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr]">
          <div className="p-6 border-b sm:border-b-0 sm:border-r border-[#F5E6CD]/10">
            <div className="text-[11px] font-semibold tracking-wide uppercase text-[#9A8D74] mb-3">Tus ingredientes</div>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-3 py-1.5 bg-[#221B12] border border-[#F5E6CD]/10 rounded-full text-xs text-[#E7DCC5]">Huevos</span>
              <span className="px-3 py-1.5 bg-[#221B12] border border-[#F5E6CD]/10 rounded-full text-xs text-[#E7DCC5]">Tomate</span>
              <span className="px-3 py-1.5 bg-[#221B12] border border-[#F5E6CD]/10 rounded-full text-xs text-[#E7DCC5]">Pan duro</span>
            </div>
            <div className="text-[11px] font-semibold tracking-wide uppercase text-[#9A8D74] mb-2">Modo</div>
            <div className="text-sm text-[#E7DCC5] mb-5">Cero desperdicio</div>
            <div className="text-center py-2.5 bg-primary text-[#130F0A] text-sm font-semibold rounded-lg">Generar receta</div>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-2.5 p-3 bg-primary/[0.06] border border-primary/15 rounded-lg mb-4">
              <NonnaAvatar className="w-9 h-9 mt-0.5" />
              <div>
                <div className="font-voice text-sm leading-snug text-[#F0DFC4]">"¡Bambino! Con huevos, tomate y pan duro ya tenemos cena."</div>
                <div className="font-hand text-base text-[#C3B89F] -mt-0.5">— La Nonna</div>
              </div>
            </div>
            <div className="flex items-start justify-between mb-4 gap-3">
              <div>
                <div className="text-base font-bold text-[#F8F2E6] mb-1">Pappa al Pomodoro Toscana</div>
                <div className="text-xs text-[#9A8D74]">Sugerida por la Nonna · basada en tu despensa</div>
              </div>
              <span className="px-2.5 py-1 bg-primary/15 text-orange-400 text-[11px] font-semibold rounded whitespace-nowrap">Cero desperdicio</span>
            </div>
            <div className="rounded-lg overflow-hidden mb-4">
              <img src={tomatoSoup} alt="Pappa al Pomodoro" className="w-full h-[170px] object-cover [filter:saturate(1.08)_sepia(.08)_contrast(1.02)]" />
            </div>
            <div className="flex gap-5 pb-4 mb-4 border-b border-[#F5E6CD]/10">
              <div className="flex items-center gap-1.5 text-xs text-[#A89C86]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
                20 min
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#A89C86]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /><circle cx="12" cy="7" r="4" /></svg>
                4 raciones
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#A89C86]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c1.4 2.8-1 4.3-1 6.8 0 1.6 1.2 2.9 2.9 2.9s2.9-1.3 2.9-2.9c0-.9-.4-1.6-.9-2.2C17.4 8.4 19 10.9 19 13.8a7 7 0 1 1-14 0c0-2.9 1.3-5.2 3-6.9C9.8 4.9 11 3.5 12 2z" /></svg>
                Fácil
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 text-xs text-[#B4A98F]"><span className="text-[#5C5346]">1</span> Sofríe el ajo y añade el tomate triturado.</div>
              <div className="flex gap-2.5 text-xs text-[#5C5346]"><span className="text-[#3A3A3E]">2</span> Incorpora el pan duro troceado y deja reposar.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
