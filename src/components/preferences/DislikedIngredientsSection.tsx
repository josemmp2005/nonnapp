import React from 'react';
import { Ban } from 'lucide-react';
import PremiumLockOverlay from '../PremiumLockOverlay';

interface Props {
  value: string;
  onChange: (value: string) => void;
  locked: boolean;
}

const DislikedIngredientsSection: React.FC<Props> = ({ value, onChange, locked }) => (
  <section className="relative bg-white dark:bg-[#18130D] p-6 rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm transition-all">
    {locked && <PremiumLockOverlay />}
    <div className={locked ? 'opacity-40 pointer-events-none' : ''}>
      <div className="flex items-center gap-3 mb-4 border-b border-[#241B10]/5 dark:border-[#F5E6CD]/10 pb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Ban className="w-5 h-5 text-[#5C4E3A] dark:text-[#A89C86]" />
        </div>
        <h2 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">Preferencias de Ingredientes</h2>
      </div>

      <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
        <label className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-2">
          Ingredientes que NO te gustan (Opcional)
        </label>
        <input
          type="text"
          className="w-full p-4 rounded-xl border border-[#241B10]/15 dark:border-[#F5E6CD]/15 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-[#FCF6EC] dark:bg-[#221B12] text-[#241B10] dark:text-[#F8F2E6]"
          placeholder="Ej: Cilantro, Cebolla, Pimiento..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
        />
        <p className="text-xs text-[#8C7C63] dark:text-[#7C715E] mt-2">
          La IA evitará activamente incluir estos ingredientes en tus recetas.
        </p>
      </div>
    </div>
  </section>
);

export default DislikedIngredientsSection;
