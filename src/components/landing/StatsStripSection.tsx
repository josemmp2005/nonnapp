import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from './shared';

interface Stat {
  value: string;
  label: string;
}

const StatsStripSection: React.FC = () => {
  const { t } = useTranslation();
  const stats = t('landing.stats.items', { returnObjects: true }) as Stat[];

  return (
    <section className="bg-paper dark:bg-paper-dark py-12 md:py-14">
      <Reveal className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-xl md:text-2xl font-display font-semibold text-accent tracking-tight">{stat.value}</div>
            <div className="text-[11px] md:text-xs text-muted dark:text-muted-dark mt-1.5">{stat.label}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
};

export default StatsStripSection;
