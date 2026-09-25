/**
 * Sección de Preferencias: utensilios disponibles. Se bloquea si el plan no lo
 * incluye.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
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
}) => {
  const { t } = useTranslation();
  return (
    <section className="relative bg-white dark:bg-surface-dark p-6 rounded-2xl border border-ink/10 dark:border-ink-light/10 shadow-sm transition">
      {locked && <PremiumLockOverlay />}
      <div className={locked ? 'opacity-40 pointer-events-none' : ''}>
        <div className="flex items-center gap-3 mb-4 border-b border-ink/5 dark:border-ink-light/10 pb-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
            <UtensilsCrossed aria-hidden="true" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-ink dark:text-[#F8F2E6]">{t('app.preferences.utensils.title')}</h2>
        </div>

        <ToggleSwitch
          label={t('app.preferences.utensils.toggleLabel')}
          description={t('app.preferences.utensils.toggleDesc')}
          checked={useUtensils}
          onChange={onUseUtensilsChange}
          disabled={locked}
        />

        {useUtensils && (
          <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
            <label htmlFor="available-utensils" className="block text-sm font-medium text-body dark:text-body-dark mb-2">
              {t('app.preferences.utensils.label')}
            </label>
            <input
              id="available-utensils"
              type="text"
              className="w-full p-4 rounded-xl border border-ink/15 dark:border-ink-light/15 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-cream dark:bg-[#221B12] text-ink dark:text-[#F8F2E6]"
              placeholder={t('app.preferences.utensils.placeholder')}
              value={availableUtensils}
              onChange={(e) => onAvailableUtensilsChange(e.target.value)}
              disabled={locked}
            />
            <p className="text-xs text-muted dark:text-muted-dark mt-2">
              {t('app.preferences.utensils.hint')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default UtensilsSection;
