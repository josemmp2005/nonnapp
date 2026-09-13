import React from 'react';
import { Link } from 'react-router-dom';

const FinalCtaSection: React.FC = () => (
  <section className="relative border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 bg-[#FCF6EC] dark:bg-[#130F0A] py-20 md:py-28 text-center overflow-hidden">
    <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.12)_0%,rgba(249,115,22,0)_72%)] dark:bg-[radial-gradient(circle,rgba(249,115,22,0.1)_0%,rgba(249,115,22,0)_72%)]" />
    <div className="max-w-xl mx-auto px-6 relative z-10">
      <h2 className="mb-8 text-3xl md:text-[40px] font-bold tracking-tight leading-tight text-[#241B10] dark:text-[#F8F2E6]">
        La mesa está servida.<br />Solo faltas tú.
      </h2>
      <Link
        to="/app"
        className="group inline-flex items-center gap-2 px-7 py-3 bg-primary text-[#130F0A] text-sm font-semibold rounded-lg shadow-lg shadow-primary/25 hover:bg-orange-400 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
      >
        Empezar a cocinar
        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </Link>
      <p className="mt-5 text-xs text-[#8C7C63] dark:text-[#6C6C72]">Prueba gratis. Sin tarjeta de crédito.</p>
    </div>
  </section>
);

export default FinalCtaSection;
