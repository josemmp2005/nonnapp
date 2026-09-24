import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { verifyEmailWithToken } from '../services/auth';
import { Logo } from './Logo';
import { useToast } from '../context/ToastContext';

interface Props {
  onEmailVerified?: () => void;
}

const VerifyEmailPage: React.FC<Props> = ({ onEmailVerified }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const verify = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage(t('app.verifyEmail.errorNoToken'));
        return;
      }

      const { error } = await verifyEmailWithToken(token);
      if (error) {
        setStatus('error');
        setErrorMessage(error.message || t('app.verifyEmail.errorGeneric'));
        return;
      }
      setStatus('success');
      onEmailVerified?.();
      showToast(t('app.verifyEmail.toastSuccess'), 'success');
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, onEmailVerified, showToast]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#241B10]/10 dark:border-[#F5E6CD]/10 text-center">
        <div className="flex flex-col items-center mb-6">
          <Logo className="w-16 h-16 mb-2" textClassName="text-3xl" />
        </div>

        <div aria-live="polite">
          {status === 'loading' && (
            <>
              <Loader2 aria-hidden="true" className="w-10 h-10 mx-auto text-primary animate-spin mb-4" />
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">{t('app.verifyEmail.verifying')}</p>
            </>
          )}

          {status === 'success' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 aria-hidden="true" className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">
                {t('app.verifyEmail.successTitle')}
              </h2>
              <p className="text-[#6B5D48] dark:text-[#9A8D74] mb-6 text-sm">
                {t('app.verifyEmail.successText')}
              </p>
              <button
                onClick={() => navigate('/app')}
                className="px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition active:scale-95"
              >
                {t('app.verifyEmail.goToApp')}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <XCircle aria-hidden="true" className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">
                {t('app.verifyEmail.errorTitle')}
              </h2>
              <p className="text-[#6B5D48] dark:text-[#9A8D74] mb-6 text-sm">{errorMessage}</p>
              <button
                onClick={() => navigate('/app')}
                className="text-sm text-primary hover:underline font-medium"
              >
                {t('app.verifyEmail.backToApp')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
