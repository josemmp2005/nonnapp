import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from './shared';

const MAMMA_FEATURES = ['Recetas ilimitadas', 'Modo despensa completo', 'Alergias e ingredientes personalizados', 'Historial completo'];
const NONNA_FEATURES = ['Chat con el chef', 'La Mesa de la Nonna', 'Planificador semanal', 'Soporte prioritario VIP'];

const PricingSection: React.FC = () => (
  <section className="landing-grain bg-[#FCF6EC] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-12 md:mb-14">
        <span className="block text-xs font-semibold text-primary mb-2.5">La Famiglia</span>
        <h2 className="mb-3 text-2xl md:text-[34px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">Elige tu lugar en la mesa</h2>
        <p className="text-sm text-[#8C7C63] dark:text-[#8B8B90]">Desde el nieto que aprende hasta la Nonna que lo sabe todo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">

        {/* Il Nipote */}
        <div className="bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 p-8 rounded-xl flex flex-col transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2">
          <h3 className="mb-1 text-base font-semibold text-[#241B10] dark:text-[#F8F2E6]">Il Nipote</h3>
          <p className="mb-5 text-xs text-[#8C7C63] dark:text-[#6C6C72]">El nieto aprendiz</p>
          <div className="mb-6 text-3xl font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">Gratis</div>
          <div className="flex flex-col gap-3 mb-7 flex-grow">
            <div className="flex items-center gap-2.5 text-[13px] text-[#3A2E1D] dark:text-[#B4B4B9]">
              <CheckIcon className="w-3.5 h-3.5 text-primary" /> 2 recetas al día
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-[#3A2E1D] dark:text-[#B4B4B9]">
              <CheckIcon className="w-3.5 h-3.5 text-primary" /> Modo despensa básico
            </div>
            <div className="text-[13px] text-[#B7AA92] dark:text-[#4E4E52] line-through">Sin chat con el chef</div>
          </div>
          <Link to="/app" className="text-center py-2.5 rounded-lg border border-[#241B10]/15 dark:border-[#F5E6CD]/15 text-[#241B10] dark:text-[#F8F2E6] text-sm font-semibold hover:bg-[#241B10]/[0.03] dark:hover:bg-white/5 hover:border-primary/40 active:scale-95 transition-all duration-300">
            Empezar a aprender
          </Link>
        </div>

        {/* La Mamma — always dark, brand-forward */}
        <div className="bg-[#18130D] border border-primary/50 p-8 rounded-xl flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 md:scale-[1.02] hover:md:scale-[1.05]">
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-primary text-[#130F0A] text-[10px] font-bold tracking-wide uppercase rounded">Más popular</div>
          <h3 className="mb-1 text-lg font-semibold text-[#F8F2E6]">La Mamma</h3>
          <p className="mb-5 text-xs text-[#6C6C72]">La jefa de cocina</p>
          <div className="flex items-baseline gap-1.5 mb-6">
            <span className="text-[34px] font-bold tracking-tight text-[#F8F2E6]">9,99€</span>
            <span className="text-xs text-[#6C6C72]">/mes</span>
          </div>
          <div className="flex flex-col gap-3 mb-7 flex-grow">
            {MAMMA_FEATURES.map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-[13px] text-[#D4D4D8] font-medium">
                <CheckIcon className="w-3.5 h-3.5 text-primary" /> {t}
              </div>
            ))}
          </div>
          <Link to="/auth" className="text-center py-3 rounded-lg bg-primary text-[#130F0A] text-sm font-semibold shadow-lg shadow-primary/30 hover:bg-orange-400 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-300">
            Gestionar la cocina
          </Link>
        </div>

        {/* La Nonna */}
        <div className="bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 p-8 rounded-xl flex flex-col transition-all duration-300 hover:border-[#9C7A32]/40 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2">
          <h3 className="mb-1 text-base font-semibold text-[#241B10] dark:text-[#F8F2E6] flex items-center gap-1.5">
            La Nonna
            <svg className="w-3.5 h-3.5 text-[#9C7A32] dark:text-[#C9A876]" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l-1.5-9L8 12l4-8 4 8 5.5-3L20 18z" /></svg>
          </h3>
          <p className="mb-5 text-xs text-[#8C7C63] dark:text-[#6C6C72]">La matriarca suprema</p>
          <div className="flex items-baseline gap-1.5 mb-6">
            <span className="text-[30px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">19,99€</span>
            <span className="text-xs text-[#8C7C63] dark:text-[#6C6C72]">/mes</span>
          </div>
          <div className="flex flex-col gap-3 mb-7 flex-grow">
            <div className="flex items-center gap-2.5 text-[13px] text-[#3A2E1D] dark:text-[#D4D4D8] font-medium">
              <svg className="w-3.5 h-3.5 text-[#9C7A32] dark:text-[#C9A876]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6L12 2z" /></svg>
              Todo lo de La Mamma
            </div>
            {NONNA_FEATURES.map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-[13px] text-[#3A2E1D] dark:text-[#B4B4B9]">
                <CheckIcon className="w-3.5 h-3.5 text-[#9C7A32] dark:text-[#C9A876]" /> {t}
              </div>
            ))}
          </div>
          <Link to="/auth" className="text-center py-2.5 rounded-lg border border-[#9C7A32]/50 dark:border-[#C9A876]/50 text-[#9C7A32] dark:text-[#C9A876] text-sm font-semibold hover:bg-[#9C7A32]/5 dark:hover:bg-[#C9A876]/5 active:scale-95 transition-all duration-300">
            Heredar el secreto
          </Link>
        </div>

      </div>
    </div>
  </section>
);

export default PricingSection;
