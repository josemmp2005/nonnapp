/**
 * Aviso que sustituye al modal de pago mientras el cambio de plan está
 * desactivado: indica que hay que escribir por email para mejorar el plan.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Info } from 'lucide-react';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface Props {
  onClose: () => void;
}

const CONTACT_EMAIL = 'info.nonnap@gmail.com';

// Pasarela de pago real aún no implementada — este aviso sustituye a
// PlanCheckoutModal mientras PLAN_CHANGES_ENABLED esté en false
// (PreferencesPage.tsx). Mismo hueco visual, mensaje claro en vez de dejar
// que el usuario complete la simulación de pago para nada.
const PlanChangeDisabledNotice: React.FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  useEscapeKey(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-disabled-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130F0A] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#241B10]/10 dark:border-[#F5E6CD]/10 bg-primary text-white">
          <h3 id="plan-disabled-title" className="text-lg font-bold flex items-center gap-2">
            <Info aria-hidden="true" className="w-5 h-5" />
            {t('app.preferences.planDisabled.title')}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" aria-label={t('app.preferences.planDisabled.closeAria')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <p className="text-[#3A2E1D] dark:text-[#D4D4D8] leading-relaxed mb-4">
            {t('app.preferences.planDisabled.messageBefore')} <strong>{t('app.preferences.planDisabled.messageBold')}</strong>{t('app.preferences.planDisabled.messageAfter')}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-colors active:scale-95"
          >
            <Mail aria-hidden="true" className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
          <p className="text-sm text-[#6B5D48] dark:text-[#9A8D74] mt-4">{t('app.preferences.planDisabled.apology')}</p>
        </div>
      </div>
    </div>
  );
};

export default PlanChangeDisabledNotice;
