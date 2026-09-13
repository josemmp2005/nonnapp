import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import ToggleSwitch from '../ui/ToggleSwitch';
import PremiumLockOverlay from '../PremiumLockOverlay';

interface Props {
  useUtensils: boolean;
  availableUtensils: string;
  onUseUtensilsChange: (value: boolean) => void;
  onAvailableUtensilsChange: (value: string) => void;
  locked: boolean;
}

const UtensilsSection: React.FC<Props> = ({
  useUtensils,
  availableUtensils,
  onUseUtensilsChange,
  onAvailableUtensilsChange,
  locked,
}) => (
  <section className="relative bg-white dark:bg-[#18130D] p-6 rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm transition-all">
    {locked && <PremiumLockOverlay />}
    <div className={locked ? 'opacity-40 pointer-events-none' : ''}>
      <div className="flex items-center gap-3 mb-4 border-b border-[#241B10]/5 dark:border-[#F5E6CD]/10 pb-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
          <UtensilsCrossed className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">Utensilios de Cocina</h2>
      </div>

      <ToggleSwitch
        label="Limitar a mis utensilios disponibles"
        description="Solo se generarán recetas que puedas cocinar con tu equipo (Guarda solo en sesión actual)."
        checked={useUtensils}
        onChange={onUseUtensilsChange}
        disabled={locked}
      />

      {useUtensils && (
        <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
          <label className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-2">
            ¿Qué tienes en tu cocina?
          </label>
          <input
            type="text"
            className="w-full p-4 rounded-xl border border-[#241B10]/15 dark:border-[#F5E6CD]/15 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-[#FCF6EC] dark:bg-[#221B12] text-[#241B10] dark:text-[#F8F2E6]"
            placeholder="Ej: Batidora, Horno, Air Fryer, Sartén..."
            value={availableUtensils}
            onChange={(e) => onAvailableUtensilsChange(e.target.value)}
            disabled={locked}
          />
          <p className="text-xs text-[#8C7C63] dark:text-[#6E6350] mt-2">
            Deja esto en blanco si tienes una cocina estándar equipada.
          </p>
        </div>
      )}
    </div>
  </section>
);

export default UtensilsSection;
