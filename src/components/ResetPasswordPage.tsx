import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordWithToken } from '../services/auth';
import { Lock, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { Logo } from './Logo';
import { useToast } from '../context/ToastContext';

const ResetPasswordPage: React.FC = () => {
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
      showToast('Por favor, verifica que las contraseñas cumplan los requisitos', 'error');
      return;
    }
    if (!token) return;

    setIsLoading(true);

    try {
      const { error } = await resetPasswordWithToken(token, password);
      if (error) throw new Error(error.message);

      showToast('✅ Contraseña actualizada correctamente', 'success');

      // Esperar 1.5 segundos y redirigir al login
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } catch (err: any) {
      console.error('Error al actualizar contraseña:', err);
      showToast(err.message || 'El enlace no es válido o ha expirado', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sin token en la URL: el enlace no es válido
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Enlace no válido o expirado</p>
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-primary hover:underline font-medium mt-4"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#241B10]/10 dark:border-[#F5E6CD]/10 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-2" textClassName="text-3xl" />
          <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mt-4">
            Restablecer contraseña
          </h2>
          <p className="text-[#8C7C63] dark:text-[#7C715E] mt-2 text-sm text-center">
            Ingresa tu nueva contraseña para tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[#8C7C63]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-12 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[#241B10] dark:text-[#F8F2E6]"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[#8C7C63] hover:text-[#5C4E3A] dark:hover:text-[#D4D4D8] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
              {isPasswordLengthValid ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-[#241B10]/20 dark:border-[#F5E6CD]/15"></div>
              )}
              <span className={`text-xs ${isPasswordLengthValid ? 'text-green-600' : 'text-[#8C7C63]'}`}>
                Mínimo 6 caracteres
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[#8C7C63]" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[#241B10] dark:text-[#F8F2E6]"
              />
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
              {doPasswordsMatch ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-[#241B10]/20 dark:border-[#F5E6CD]/15"></div>
              )}
              <span className={`text-xs ${doPasswordsMatch ? 'text-green-600' : 'text-[#8C7C63]'}`}>
                Las contraseñas coinciden
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPasswordLengthValid || !doPasswordsMatch}
            className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Actualizar contraseña
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-[#8C7C63] dark:text-[#7C715E] hover:text-primary"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
