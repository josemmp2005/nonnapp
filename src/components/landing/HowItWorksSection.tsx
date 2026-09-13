import React from 'react';

const STEPS = [
  {
    n: '01',
    title: 'Cuéntale qué tienes',
    text: 'Ingredientes, sobras o alergias: dile a la Nonna qué hay hoy en tu nevera.',
    icon: <path d="M4 9h16l-1.5 10.2a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 9z" />,
    icon2: <path d="M8.5 9l1-4.5M15.5 9l-1-4.5M9.5 13v4M14.5 13v4" />,
  },
  {
    n: '02',
    title: 'Ella piensa como una Nonna',
    text: 'La IA cruza tradición italiana con tu despensa para crear algo delicioso, sin desperdiciar nada.',
    icon: <path d="M12 2c1.4 2.8-1 4.3-1 6.8 0 1.6 1.2 2.9 2.9 2.9s2.9-1.3 2.9-2.9c0-.9-.4-1.6-.9-2.2C17.4 8.4 19 10.9 19 13.8a7 7 0 1 1-14 0c0-2.9 1.3-5.2 3-6.9C9.8 4.9 11 3.5 12 2z" />,
  },
  {
    n: '03',
    title: 'Cocina paso a paso',
    text: 'Instrucciones claras y ordenadas, listas para seguir en la cocina, guardar o imprimir.',
    icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  },
];

const HowItWorksSection: React.FC = () => (
  <section id="como-funciona" className="landing-grain bg-[#FCF6EC] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="max-w-lg mb-12 md:mb-14">
        <span className="block text-xs font-semibold text-primary mb-2.5">Cómo funciona</span>
        <h2 className="text-2xl md:text-[34px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">De la despensa al plato en tres pasos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#241B10]/10 dark:bg-[#F5E6CD]/10 border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-xl overflow-hidden">
        {STEPS.map((step) => (
          <div key={step.n} className="group bg-[#FCF6EC] dark:bg-[#130F0A] p-7 transition-all duration-300 hover:bg-white dark:hover:bg-[#18130D] hover:z-10 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
            <div className="text-xs font-semibold text-[#8C7C63] dark:text-[#6E6350] mb-4">{step.n}</div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {step.icon}{step.icon2}
              </svg>
            </div>
            <h3 className="mb-2 text-[15px] font-semibold text-[#241B10] dark:text-[#F8F2E6]">{step.title}</h3>
            <p className="text-[13.5px] leading-relaxed text-[#8C7C63] dark:text-[#948974]">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
