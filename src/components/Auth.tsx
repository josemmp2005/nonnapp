import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmail, signUpWithEmail, requestPasswordReset } from '../services/auth';
import type { AuthSession } from '../services/auth';
import { API_URL } from '../services/api';
import { Mail, Lock, Loader2, ArrowRight, User, Eye, EyeOff, Check } from 'lucide-react';
import { Logo } from './Logo';
import { useToast } from '../context/ToastContext';

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 15.9 3 8.9 7.6 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9 41.2 15.9 45 24 45z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z" />
  </svg>
);

interface Props {
  onAuthChange: (session: AuthSession | null) => void;
}

const Auth: React.FC<Props> = ({ onAuthChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Validation States
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  useEffect(() => {
    setIsPasswordLengthValid(password.length >= 6);
    setDoPasswordsMatch(password === confirmPassword && password.length > 0);
  }, [password, confirmPassword]);

  // El backend redirige aquí con ?error=... si el login con Google falla
  // (el usuario cancela, la config no está lista, el state no cuadra, etc.).
  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) return;

    if (error === 'google_not_configured') {
      showToast('El login con Google no está disponible todavía.', 'error');
    } else if (error === 'google_failed') {
      showToast('No se pudo iniciar sesión con Google. Intenta de nuevo.', 'error');
    }
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await requestPasswordReset(email);
        if (error) throw new Error(error.message || 'No se pudo enviar el email de recuperación');
        showToast('📧 Revisa tu email para restablecer tu contraseña', 'success');
        setIsForgotPassword(false);
        setEmail('');
      } else if (isLogin) {
        const { user, error } = await signInWithEmail(email, password);
        if (error || !user) throw new Error(error?.message || 'No se pudo iniciar sesión');
        onAuthChange({ user });
        showToast('¡Bienvenido de nuevo!', 'success');
        navigate('/app');
      } else {
        // Strict Frontend Validation
        if (!username.trim()) throw new Error("El nombre de usuario es obligatorio");
        if (password.length < 6) throw new Error("La contraseña es muy corta");
        if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden");

        const { user, error: signUpError } = await signUpWithEmail(email, password, { username });
        if (signUpError || !user) throw new Error(signUpError?.message || 'No se pudo crear la cuenta');

        onAuthChange({ user });
        showToast('¡Registro exitoso! Revisa tu email para verificar tu cuenta.', 'success');
        navigate('/app');
      }
    } catch (err: any) {
      showToast(err.message || 'Ocurrió un error inesperado.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#241B10]/10 dark:border-[#F5E6CD]/10 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-2" textClassName="text-3xl" />
          <h2 className="text-xl font-bold text-[#241B10] dark:text-[#F8F2E6] mt-4">
            {isForgotPassword
              ? 'Recuperar contraseña'
              : isLogin
                ? 'Bienvenido de nuevo'
                : 'Únete a nonnapp'}
          </h2>
          <p className="text-[#8C7C63] dark:text-[#7C715E] mt-2 text-sm text-center">
            {isForgotPassword
              ? 'Te enviaremos un email para restablecer tu contraseña.'
              : isLogin
                ? 'Accede para guardar tus recetas y preferencias.'
                : 'Crea tu perfil culinario y empieza a cocinar.'}
          </p>
        </div>

        {!isForgotPassword && (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl font-semibold text-[#3A2E1D] dark:text-[#D4D4D8] bg-white dark:bg-[#221B12] hover:bg-[#241B10]/5 dark:hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              <GoogleIcon className="w-5 h-5" />
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-grow h-px bg-[#241B10]/10 dark:bg-[#F5E6CD]/10" />
              <span className="text-xs text-[#8C7C63] dark:text-[#7C715E] uppercase tracking-wide">o con email</span>
              <div className="flex-grow h-px bg-[#241B10]/10 dark:bg-[#F5E6CD]/10" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && !isForgotPassword && (
            <div className="animate-in slide-in-from-top-2 fade-in space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">Nombre de Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-[#8C7C63]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ChefMaster2025"
                    required={!isLogin && !isForgotPassword}
                    className="w-full pl-10 pr-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[#241B10] dark:text-[#F8F2E6]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-[#8C7C63]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[#241B10] dark:text-[#F8F2E6]"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">Contraseña</label>
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

                {!isLogin && (
                  <div className="flex items-center gap-2 mt-1 px-1">
                    {isPasswordLengthValid ? <Check className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-[#241B10]/20 dark:border-[#F5E6CD]/15"></div>}
                    <span className={`text-xs ${isPasswordLengthValid ? 'text-green-600' : 'text-[#8C7C63]'}`}>Mínimo 6 caracteres</span>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-1 animate-in fade-in">
                  <label className="text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8]">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[#8C7C63]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[#241B10] dark:text-[#F8F2E6]"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    {doPasswordsMatch ? <Check className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-[#241B10]/20 dark:border-[#F5E6CD]/15"></div>}
                    <span className={`text-xs ${doPasswordsMatch ? 'text-green-600' : 'text-[#8C7C63]'}`}>Las contraseñas coinciden</span>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setPassword('');
                    }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading || (!isForgotPassword && !isLogin && (!isPasswordLengthValid || !doPasswordsMatch))}
            className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isForgotPassword ? 'Enviar email' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setEmail('');
              }}
              className="text-sm text-[#8C7C63] dark:text-[#7C715E] hover:text-primary font-medium"
            >
              ← Volver al inicio de sesión
            </button>
          ) : (
            <p className="text-sm text-[#8C7C63] dark:text-[#7C715E]">
              {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  resetForm();
                }}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;