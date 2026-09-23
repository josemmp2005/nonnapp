import React from 'react';

const StatsStripSection: React.FC = () => (
  <section className="border-y border-[#241B10]/10 dark:border-[#F5E6CD]/10 bg-[#FCF6EC] dark:bg-[#130F0A]">
    <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 divide-x divide-[#241B10]/10 dark:divide-[#F5E6CD]/10">
      <div className="py-7 text-center">
        <div className="text-xl md:text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] tracking-tight">3 pasos</div>
        <div className="text-[11px] md:text-xs text-[#6B5D48] dark:text-[#9A8D74] mt-1">de la despensa al plato</div>
      </div>
      <div className="py-7 text-center">
        <div className="text-xl md:text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] tracking-tight">&lt; 20 seg</div>
        <div className="text-[11px] md:text-xs text-[#6B5D48] dark:text-[#9A8D74] mt-1">para generar una receta</div>
      </div>
      <div className="py-7 text-center">
        <div className="text-xl md:text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] tracking-tight">0%</div>
        <div className="text-[11px] md:text-xs text-[#6B5D48] dark:text-[#9A8D74] mt-1">desperdicio como objetivo</div>
      </div>
    </div>
  </section>
);

export default StatsStripSection;
