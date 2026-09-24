/**
 * Modal con los pasos para instalar la PWA en iPhone/iPad (Safari no permite
 * lanzar la instalación desde código).
 */

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, SquarePlus, Check, X } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { Logo } from './Logo';

// Guía para iPhone/iPad: Safari no permite lanzar la instalación desde código,
// así que el botón "Instalar app" abre estos tres pasos. Se monta una vez en
// App.tsx y se abre desde el almacén de pwaInstall.
const InstallHelpModal: React.FC = () => {
  const { t } = useTranslation();
  const { iosHelpOpen, closeIosHelp } = usePwaInstall();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(() => {
    if (iosHelpOpen) closeIosHelp();
  });

  useEffect(() => {
    if (iosHelpOpen) closeRef.current?.focus();
  }, [iosHelpOpen]);

  if (!iosHelpOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeIosHelp}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-help-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-sm bg-surface dark:bg-surface-dark rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-2xl border border-ink/10 dark:border-ink-light/10 animate-in slide-in-from-bottom-8 fade-in duration-300"
      >
        <button
          ref={closeRef}
          onClick={closeIosHelp}
          aria-label={t('common.installModal.close')}
          className="absolute top-4 right-4 p-2 rounded-full text-muted dark:text-muted-dark hover:bg-ink/5 dark:hover:bg-ink-light/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="w-5 h-5" />
        </button>

        <Logo className="w-10 h-10" showText={false} />
        <h2 id="install-help-title" className="mt-4 font-display font-semibold text-2xl text-ink dark:text-ink-light">
          {t('common.installModal.title')}
        </h2>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">
          {t('common.installModal.subtitle')}
        </p>

        <ol className="mt-6 space-y-4">
          <li className="flex items-center gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Share aria-hidden="true" className="w-5 h-5" />
            </span>
            <span className="text-sm text-body dark:text-body-dark">
              {t('common.installModal.step1.before')} <strong>{t('common.installModal.step1.bold')}</strong> {t('common.installModal.step1.after')}
            </span>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <SquarePlus aria-hidden="true" className="w-5 h-5" />
            </span>
            <span className="text-sm text-body dark:text-body-dark">
              {t('common.installModal.step2.before')} <strong>{t('common.installModal.step2.bold')}</strong>{t('common.installModal.step2.after')}
            </span>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Check aria-hidden="true" className="w-5 h-5" />
            </span>
            <span className="text-sm text-body dark:text-body-dark">
              {t('common.installModal.step3.before')} <strong>{t('common.installModal.step3.bold')}</strong>{t('common.installModal.step3.after')}
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default InstallHelpModal;
