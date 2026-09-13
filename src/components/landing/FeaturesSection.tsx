import React from 'react';

const FEATURES = [
  {
    title: 'Cero desperdicio',
    text: 'La Nonna nunca tiraba comida. La IA prioriza lo que ya tienes, ahorrando dinero y cuidando el planeta.',
    icon: <><path d="M6 20C4 12 9 5 19 4c0 10-7 15-13 16z" /><path d="M6.5 19.5C9 14 12 10 17 6" /></>,
  },
  {
    title: 'Cocina con alma',
    text: 'No son solo instrucciones robóticas: recibes consejos y trucos con ese cariño de cocina de casa.',
    icon: <path d="M12 20s-7-4.3-9.5-8.8C.8 8 2.6 4.5 6 4.5c2 0 3.4 1 6 3.5 2.6-2.5 4-3.5 6-3.5 3.4 0 5.2 3.5 3.5 6.7C19 15.7 12 20 12 20z" />,
  },
  {
    title: 'Velocidad moderna',
    text: 'La sabiduría de antaño a la velocidad de hoy: receta y lista de la compra en segundos.',
    icon: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" stroke="none" />,
  },
];

const RULES = [
  'Nunca se tira comida.',
  'Si dudas, añade más ajo.',
  'La paciencia es el ingrediente secreto.',
  'Todo sabe mejor compartido.',
];

const FeaturesSection: React.FC = () => (
  <section className="landing-grain bg-[#FCF6EC] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="max-w-xl mb-12 md:mb-14">
        <span className="block text-xs font-semibold text-primary mb-2.5">El secreto</span>
        <h2 className="mb-4 text-2xl md:text-[34px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">Lo que hace especial a Nonnapp</h2>
        <p className="text-sm md:text-[15.5px] leading-relaxed text-[#5C4E3A] dark:text-[#8B8B90]">¿Cómo cocinaba tu abuela un banquete con tres ingredientes en la nevera? Le hemos enseñado esa magia a nuestra IA.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="group bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 p-7 rounded-xl transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5">
            <div className="w-[34px] h-[34px] rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
              </svg>
            </div>
            <h3 className="mb-2 text-[15.5px] font-semibold text-[#241B10] dark:text-[#F8F2E6]">{f.title}</h3>
            <p className="text-[13.5px] leading-relaxed text-[#8C7C63] dark:text-[#948974]">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-12 border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10">
        <div className="flex items-baseline gap-3.5 mb-6">
          <span className="text-xs font-semibold text-primary">Los mandamientos de la Nonna</span>
          <span className="font-hand text-base text-[#8C7C63] dark:text-[#7C715E]">escritos con cariño</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
          {RULES.map((rule, i) => (
            <div key={rule} className="group flex items-center gap-4 py-4 border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 transition-all duration-300 hover:pl-2 hover:border-primary/40">
              <span className="text-xs font-semibold text-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-125">0{i + 1}</span>
              <span className="text-sm text-[#3A2E1D] dark:text-[#D4D4D8] transition-colors duration-300 group-hover:text-primary">{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
