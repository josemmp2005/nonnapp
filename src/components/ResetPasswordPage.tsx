/**
 * Página `/reset-password?token=...`: fija una contraseña nueva con el token
 * del email de recuperación.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPasswordWithToken } from '../services/auth';
import { Lock, Loader2, Eye, EyeOff, XCircle } from 'lucide-react';
import { Logo } from './Logo';
import { useToast } from '../context/ToastContext';
import { PasswordCheckItem } from './ui/PasswordCheckItem';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Validation States
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  useEffect(() => {
    setIsPasswordLengthValid(password.length >= 6);
    setDoPasswordsMatch(password === confirmPassword && password.length > 0);
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordLengthValid || !doPasswordsMatch) {
      showToast(t('app.resetPassword.toastValidationError'), 'error');
      return;
    }
    if (!token) return;

    setIsLoading(true);

    try {
      const { error } = await resetPasswordWithToken(token, password);
      if (error) throw new Error(error.message);

      showToast(t('app.resetPassword.toastSuccess'), 'success');

      // Esperar 1.5 segundos y redirigir al login
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } catch (err) {
      console.error('Error al actualizar contraseña:', err);
      showToast(err instanceof Error ? err.message : t('app.resetPassword.toastGenericError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sin token en la URL: el enlace no es válido
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#241B10]/10 dark:border-[#F5E6CD]/10 text-center animate-in fade-in zoom-in-95 duration-300">
          <XCircle aria-hidden="true" className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">{t('app.resetPassword.invalidLinkTitle')}</h2>
          <p className="text-[#6B5D48] dark:text-[#9A8D74] mb-6 text-sm">{t('app.resetPassword.invalidLinkText')}</p>
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-primary hover:underline font-medium"
          >
            {t('app.auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#241B10]/10 dark:border-[#F5E6CD]/10 transition duration-300 hover:shadow-2xl hover:shadow-primary/5">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-2" textClassName="text-3xl" />
          <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mt-4">
            {t('app.resetPassword.title')}
          </h2>
          <p className="text-[#6B5D48] dark:text-[#9A8D74] mt-2 text-sm text-center">
            {t('app.resetPassword.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="reset-password" className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">
              {t('app.profile.newPasswordLabel')}
            </label>
            <div className="relative">
              <Lock aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-[#6B5D48]" />
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-12 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-[#241B10] dark:text-[#F8F2E6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('app.auth.hidePassword') : t('app.auth.showPassword')}
                className="absolute right-3 top-3.5 text-[#6B5D48] hover:text-[#5C4E3A] dark:hover:text-[#D4D4D8] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <PasswordCheckItem ok={isPasswordLengthValid} label={t('app.profile.passwordMinLength')} />
          </div>

          <div className="space-y-1">
            <label htmlFor="reset-confirm-password" className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">
              {t('app.auth.confirmPasswordLabel')}
            </label>
            <div className="relative">
              <Lock aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-[#6B5D48]" />
              <input
                id="reset-confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-[#241B10] dark:text-[#F8F2E6]"
              />
            </div>
            <PasswordCheckItem ok={doPasswordsMatch} label={t('app.profile.passwordsMatch')} />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPasswordLengthValid || !doPasswordsMatch}
            className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5" />
                {t('app.resetPassword.submit')}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-[#6B5D48] dark:text-[#9A8D74] hover:text-primary"
          >
            {t('app.auth.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
