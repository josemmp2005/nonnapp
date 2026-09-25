/**
 * Tarjeta de Preferencias con el plan activo y el botón para cambiarlo.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, ArrowRightLeft } from 'lucide-react';
import type { SubscriptionData } from '../../types';

interface Props {
  subscription: SubscriptionData;
  isCurrentlyPro: boolean;
  onOpenPlanModal: () => void;
}

const SubscriptionCard: React.FC<Props> = ({ subscription, isCurrentlyPro, onOpenPlanModal }) => {
  const { t } = useTranslation();
  const planDescriptions: Record<SubscriptionData['plan_type'], string> = {
    Nonna: t('app.preferences.subscriptionCard.planDescNonna'),
    Mamma: t('app.preferences.subscriptionCard.planDescMamma'),
    Nipote: t('app.preferences.subscriptionCard.planDescNipote'),
  };

  return (
    <section className="bg-gradient-to-r from-ink to-surface-dark dark:from-surface-dark dark:to-paper-dark p-6 rounded-2xl border border-white/10 shadow-lg text-white transition duration-300 hover:shadow-2xl hover:shadow-primary/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-yellow-500/20 p-2 rounded-lg">
          <Crown className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{t('app.preferences.subscriptionCard.title')}</h2>
          <p className="text-xs text-[#C3B89F]">{t('app.preferences.subscriptionCard.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between py-2 gap-4">
        <div className="pr-4 w-full">
          <div className="flex items-baseline gap-2">
            <h4 className="text-xl font-bold text-white">
              {isCurrentlyPro ? `La ${subscription.plan_type}` : t('app.preferences.subscriptionCard.freePlanName')}
            </h4>
            {isCurrentlyPro && (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">{t('app.preferences.subscriptionCard.activeBadge')}</span>
            )}
          </div>
          <p className="text-sm text-[#C3B89F] mt-2">{planDescriptions[subscription.plan_type]}</p>
        </div>

        <button
          onClick={onOpenPlanModal}
          className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition duration-300 shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 whitespace-nowrap min-w-[140px] justify-center
              ${
                isCurrentlyPro
                  ? 'bg-white/10 hover:bg-white/20 text-body-dark border border-white/10'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white shadow-orange-900/20'
              }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          {t('app.preferences.subscriptionCard.changePlanButton')}
        </button>
      </div>
    </section>
  );
};

export default SubscriptionCard;
