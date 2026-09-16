import React from 'react';
import { Crown, ArrowRightLeft } from 'lucide-react';
import type { SubscriptionData } from '../../types';

interface Props {
  subscription: SubscriptionData;
  isCurrentlyPro: boolean;
  onOpenPlanModal: () => void;
}

const PLAN_DESCRIPTIONS: Record<SubscriptionData['plan_type'], string> = {
  Nonna: 'Tienes recetas ilimitadas, modo despensa, chat con el chef, La Mesa de la Nonna y soporte prioritario.',
  Mamma:
    'Tienes recetas ilimitadas, modo despensa y personalización de alergias/ingredientes. El chat del chef y La Mesa de la Nonna son de La Nonna.',
  Nipote: 'Actualiza a La Mamma para desbloquear el modo despensa, o a La Nonna para tenerlo todo: chat del chef y La Mesa de la Nonna.',
};

const SubscriptionCard: React.FC<Props> = ({ subscription, isCurrentlyPro, onOpenPlanModal }) => (
  <section className="bg-gradient-to-r from-[#241B10] to-[#18130D] dark:from-[#18130D] dark:to-[#0D0A06] p-6 rounded-2xl border border-white/10 shadow-lg text-white transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-yellow-500/20 p-2 rounded-lg">
        <Crown className="w-5 h-5 text-yellow-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">Tu Plan Actual</h2>
        <p className="text-xs text-[#C3B89F]">Gestiona tu suscripción de Sabora.</p>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row items-center justify-between py-2 gap-4">
      <div className="pr-4 w-full">
        <div className="flex items-baseline gap-2">
          <h4 className="text-xl font-bold text-white">
            {isCurrentlyPro ? `La ${subscription.plan_type}` : 'Il Nipote (gratis)'}
          </h4>
          {isCurrentlyPro && (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">ACTIVO</span>
          )}
        </div>
        <p className="text-sm text-[#C3B89F] mt-2">{PLAN_DESCRIPTIONS[subscription.plan_type]}</p>
      </div>

      <button
        onClick={onOpenPlanModal}
        className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 whitespace-nowrap min-w-[140px] justify-center
            ${
              isCurrentlyPro
                ? 'bg-white/10 hover:bg-white/20 text-[#D4D4D8] border border-white/10'
                : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white shadow-orange-900/20'
            }`}
      >
        <ArrowRightLeft className="w-4 h-4" />
        Cambiar de plan
      </button>
    </div>
  </section>
);

export default SubscriptionCard;
