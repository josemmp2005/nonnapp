import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Crown } from 'lucide-react';

// Overlay reutilizado en las secciones de personalización que exigen
// La Mamma / La Nonna (alergias, ingredientes, utensilios en PreferencesPage).
const PremiumLockOverlay: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-[#18130D]/85 backdrop-blur-[2px] rounded-2xl">
      <div className="text-center px-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-bold text-[#241B10] dark:text-[#F8F2E6] flex items-center gap-1.5 justify-center">
          <Crown className="w-4 h-4 text-amber-500" />
          {t('app.preferences.lockOverlay')}
        </p>
      </div>
    </div>
  );
};

export default PremiumLockOverlay;
