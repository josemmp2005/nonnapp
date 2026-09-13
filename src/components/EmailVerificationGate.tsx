import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        showToast(`Espera ${retryAfterSeconds}s antes de volver a pedirlo.`, 'error');
      } else {
        showToast(error.message || 'No se pudo reenviar el email', 'error');
      }
      return;
    }

    startCooldown(DEFAULT_COOLDOWN_SECONDS);
    showToast('📧 Email de verificación reenviado. Revisa tu bandeja de entrada.', 'success');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#241B10]/10 dark:border-[#F5E6CD]/10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">
          Verifica tu email para continuar
        </h2>
        <p className="text-[#8C7C63] dark:text-[#7C715E] text-sm mb-1">
          Te hemos enviado un enlace de confirmación a
        </p>
        <p className="text-[#3A2E1D] dark:text-[#D4D4D8] font-semibold mb-6 break-all">{email}</p>
        <p className="text-[#8C7C63] dark:text-[#7C715E] text-sm mb-6">
          Haz clic en el enlace del email para desbloquear la app. Si no lo encuentras, revisa spam o pide que te lo reenviemos.
        </p>
        <button
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending
            ? 'Enviando...'
            : cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : 'Reenviar email de verificación'}
        </button>

        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#8C7C63] dark:text-[#7C715E] hover:text-primary font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a inicio
        </Link>
      </div>
    </div>
  );
};

export default EmailVerificationGate;
