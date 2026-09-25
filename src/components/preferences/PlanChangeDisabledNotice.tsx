/**
 * Aviso que sustituye al modal de pago mientras el cambio de plan está
 * desactivado: indica que hay que escribir por email para mejorar el plan.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Info } from 'lucide-react';
import { Modal } from '../ui/Modal';

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

  return (
    <Modal
      onClose={onClose}
      labelledBy="plan-disabled-title"
      panelClassName="bg-white dark:bg-cream-dark rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
    >
        <div className="flex items-center justify-between p-4 border-b border-ink/10 dark:border-ink-light/10 bg-primary text-white">
          <h3 id="plan-disabled-title" className="text-lg font-bold flex items-center gap-2">
            <Info aria-hidden="true" className="w-5 h-5" />
            {t('app.preferences.planDisabled.title')}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" aria-label={t('app.preferences.planDisabled.closeAria')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <p className="text-body dark:text-body-dark leading-relaxed mb-4">
            {t('app.preferences.planDisabled.messageBefore')} <strong>{t('app.preferences.planDisabled.messageBold')}</strong>{t('app.preferences.planDisabled.messageAfter')}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-colors active:scale-95"
          >
            <Mail aria-hidden="true" className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
          <p className="text-sm text-muted dark:text-muted-dark mt-4">{t('app.preferences.planDisabled.apology')}</p>
        </div>
    </Modal>
  );
};

export default PlanChangeDisabledNotice;
