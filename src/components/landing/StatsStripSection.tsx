import React from 'react';
import { Reveal } from './shared';

const STATS = [
  { value: '3 pasos', label: 'de la despensa al plato' },
  { value: '< 20 seg', label: 'para generar una receta' },
  { value: '0%', label: 'desperdicio como objetivo' },
];

const StatsStripSection: React.FC = () => (
  <section className="bg-paper dark:bg-paper-dark py-12 md:py-14">
    <Reveal className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
      {STATS.map((stat) => (
        <div key={stat.label}>
          <div className="text-xl md:text-2xl font-display font-semibold text-accent tracking-tight">{stat.value}</div>
          <div className="text-[11px] md:text-xs text-muted dark:text-muted-dark mt-1.5">{stat.label}</div>
        </div>
      ))}
    </Reveal>
  </section>
);

export default StatsStripSection;
