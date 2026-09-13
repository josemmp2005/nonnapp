import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { verifyEmailWithToken } from '../services/auth';
import { Logo } from './Logo';
import { useToast } from '../context/ToastContext';

interface Props {
  onEmailVerified?: () => void;
}

const VerifyEmailPage: React.FC<Props> = ({ onEmailVerified }) => {
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

    if (!token) {
      setStatus('error');
      setErrorMessage('Enlace no válido: falta el token de verificación.');
      return;
    }

    verifyEmailWithToken(token).then(({ error }) => {
      if (error) {
        setStatus('error');
        setErrorMessage(error.message || 'El enlace no es válido o ha expirado.');
        return;
      }
      setStatus('success');
      onEmailVerified?.();
      showToast('✅ Email verificado correctamente', 'success');
    });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#241B10]/10 dark:border-[#F5E6CD]/10 text-center">
        <div className="flex flex-col items-center mb-6">
          <Logo className="w-16 h-16 mb-2" textClassName="text-3xl" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-4" />
            <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">Verificando tu email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">
              Email verificado
            </h2>
            <p className="text-[#8C7C63] dark:text-[#7C715E] mb-6 text-sm">
              Ya puedes generar recetas y usar todas las funciones de Sabora.
            </p>
            <button
              onClick={() => navigate('/app')}
              className="px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              Ir a la app
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">
              No se pudo verificar
            </h2>
            <p className="text-[#8C7C63] dark:text-[#7C715E] mb-6 text-sm">{errorMessage}</p>
            <button
              onClick={() => navigate('/app')}
              className="text-sm text-primary hover:underline font-medium"
            >
              ← Volver a la app
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
