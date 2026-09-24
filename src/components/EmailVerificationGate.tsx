/**
 * Pantalla de bloqueo para cuentas sin verificar: pide confirmar el email y
 * permite reenviar el correo (con cuenta atrás entre reenvíos).
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { resendVerificationEmail } from '../services/auth';
import { useToast } from '../context/ToastContext';

interface Props {
  email: string;
}

// Debe coincidir con RESEND_VERIFICATION_COOLDOWN_MS en server/src/routes/auth.ts
// (60s) — es solo el valor optimista para el primer envío; en un 429 el
// backend manda el `retryAfterSeconds` real y ese manda sobre este.
const DEFAULT_COOLDOWN_SECONDS = 60;

const cooldownKey = (email: string) => `sabora_resend_cooldown_${email}`;

const readStoredCooldown = (email: string): number => {
  try {
    const raw = localStorage.getItem(cooldownKey(email));
    if (!raw) return 0;
    return Math.max(0, Math.ceil((Number(raw) - Date.now()) / 1000));
  } catch {
    return 0;
  }
};

const EmailVerificationGate: React.FC<Props> = ({ email }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(() => readStoredCooldown(email));

  // Countdown de 1 en 1 segundo mientras haya cooldown activo.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const startCooldown = (seconds: number) => {
    try {
      localStorage.setItem(cooldownKey(email), String(Date.now() + seconds * 1000));
    } catch {
      // localStorage bloqueado (privado/incógnito): el cooldown solo vive en memoria.
    }
    setCooldown(seconds);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    const { error, retryAfterSeconds } = await resendVerificationEmail();
    setIsResending(false);

    if (error) {
      if (retryAfterSeconds) {
        startCooldown(retryAfterSeconds);
        showToast(t('app.emailVerification.toastWait', { seconds: retryAfterSeconds }), 'error');
      } else {
        showToast(error.message || t('app.emailVerification.toastError'), 'error');
      }
      return;
    }

    startCooldown(DEFAULT_COOLDOWN_SECONDS);
    showToast(t('app.emailVerification.toastResent'), 'success');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#241B10]/10 dark:border-[#F5E6CD]/10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">
          {t('app.emailVerification.title')}
        </h2>
        <p className="text-[#6B5D48] dark:text-[#9A8D74] text-sm mb-1">
          {t('app.emailVerification.sentTo')}
        </p>
        <p className="text-[#3A2E1D] dark:text-[#D4D4D8] font-semibold mb-6 break-all">{email}</p>
        <p className="text-[#6B5D48] dark:text-[#9A8D74] text-sm mb-6">
          {t('app.emailVerification.instructions')}
        </p>
        <button
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending
            ? t('app.emailVerification.sending')
            : cooldown > 0
              ? t('app.emailVerification.resendIn', { seconds: cooldown })
              : t('app.emailVerification.resend')}
        </button>

        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#6B5D48] dark:text-[#9A8D74] hover:text-primary font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('app.emailVerification.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default EmailVerificationGate;
