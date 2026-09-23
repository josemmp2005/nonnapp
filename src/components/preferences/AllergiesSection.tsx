import React from 'react';
import { AlertCircle } from 'lucide-react';
import ToggleSwitch from '../ui/ToggleSwitch';
import PremiumLockOverlay from '../PremiumLockOverlay';

interface Props {
  useAllergies: boolean;
  allergies: string;
  onUseAllergiesChange: (value: boolean) => void;
  onAllergiesChange: (value: string) => void;
  locked: boolean;
}

const AllergiesSection: React.FC<Props> = ({ useAllergies, allergies, onUseAllergiesChange, onAllergiesChange, locked }) => (
  <section className="relative bg-white dark:bg-[#18130D] p-6 rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm transition">
    {locked && <PremiumLockOverlay />}
    <div className={locked ? 'opacity-40 pointer-events-none' : ''}>
      <div className="flex items-center gap-3 mb-4 border-b border-[#241B10]/5 dark:border-[#F5E6CD]/10 pb-4">
        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
          <AlertCircle aria-hidden="true" className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">Restricciones Alimentarias</h2>
      </div>

      <ToggleSwitch
        label="Activar Filtro de Alergias/Intolerancias"
        description="La IA será estricta excluyendo ingredientes."
        checked={useAllergies}
        onChange={onUseAllergiesChange}
        disabled={locked}
      />

      {useAllergies && (
        <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
          <label htmlFor="allergies-list" className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-2">
            Lista de alergias o dietas (separadas por comas)
          </label>
          <textarea
            id="allergies-list"
            className="w-full p-4 rounded-xl border border-[#241B10]/15 dark:border-[#F5E6CD]/15 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32 resize-none bg-[#FCF6EC] dark:bg-[#221B12] text-[#241B10] dark:text-[#F8F2E6]"
            placeholder="Ej: Gluten, Lactosa, Cacahuetes, Dieta Keto..."
            value={allergies}
            onChange={(e) => onAllergiesChange(e.target.value)}
            disabled={locked}
          />
        </div>
      )}
    </div>
  </section>
);

export default AllergiesSection;
