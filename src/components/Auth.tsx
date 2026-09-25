/**
 * Pantalla `/auth`: inicio de sesión, registro y recuperación de contraseña en
 * una sola tarjeta (con acceso por Google), sobre un fondo a sangre que cambia
 * con el tema.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmail, signUpWithEmail, requestPasswordReset } from '../services/auth';
import type { AuthSession } from '../services/auth';
import { API_URL } from '../services/api';
import { Mail, Lock, Loader2, ArrowRight, User, Eye, EyeOff } from 'lucide-react';
import { Logo } from './Logo';
import { useToast } from '../context/ToastContext';
import { PasswordCheckItem } from './ui/PasswordCheckItem';
import { useTheme } from '../context/ThemeContext';
import { useThemedImage } from '../hooks/useThemedImage';
import { authModeFromUrl, type AuthMode } from '../utils/authMode';
import loginBgPc from '../assets/login-background-pc.webp';
import loginBgPcDark from '../assets/login-background-pc-dark.webp';
import loginBgMobile from '../assets/login-background-mobile.webp';
import loginBgMobileDark from '../assets/login-background-mobile-dark.webp';

const LETTER_STAGGER_MS = 18;
const letterDelay = (i: number) => ({ '--d': `${i * LETTER_STAGGER_MS}ms` }) as React.CSSProperties;

// Título letra a letra (.letter-in, src/index.css) — nbsp en vez de espacio
// normal para que no lo colapse el whitespace-collapsing al quedar solo
// dentro de su propio inline-block.
const AnimatedTitle: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split('').map((char, i) => (
      <span key={i} className="letter-in" style={letterDelay(i)}>
        {char === ' ' ? ' ' : char}
      </span>
    ))}
  </>
);

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 15.9 3 8.9 7.6 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9 41.2 15.9 45 24 45z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z" />
  </svg>
);

// "forgot" no se codifica en la URL (solo se llega ahí desde el propio
// formulario de login) — por eso es un estado interno que se suma a
// AuthMode (login/signup, ver utils/authMode.ts), no parte de ese tipo.
type Mode = AuthMode | 'forgot';

interface Props {
  onAuthChange: (session: AuthSession | null) => void;
}

const Auth: React.FC<Props> = ({ onAuthChange }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  // La URL manda: los botones "Iniciar sesión"/"Crear cuenta" de la cabecera
  // enlazan a /auth?modo=login|registro. "forgot" no se codifica en la URL
  // (solo se llega ahí desde el propio formulario de login), así que el
  // estado inicial y la resincronización de más abajo solo distinguen
  // login/signup; volver de "forgot" siempre aterriza en login.
  const [mode, setMode] = useState<Mode>(() => authModeFromUrl(window.location.search));
  // Mientras carga la foto de fondo se ve el crema liso de abajo (ya es del
  // color de marca, no un hueco roto) y la foto entra con un fundido en
  // cuanto está lista, en vez de aparecer de golpe. Mismo hook que usa el
  // fondo de toda la app en Layout.tsx.
  const pcBg = useThemedImage(theme, loginBgPc, loginBgPcDark);
  const mobileBg = useThemedImage(theme, loginBgMobile, loginBgMobileDark);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Estando ya en /auth el componente no se vuelve a montar al pulsar los
  // botones de la cabecera, así que hay que reaccionar a cada navegación:
  // `location.key` cambia incluso si se navega a la misma URL (p. ej. "Crear
  // cuenta" con el formulario ya en registro, o con "¿Olvidaste tu
  // contraseña?" abierto — vuelve al formulario normal).
  useEffect(() => {
    setMode(authModeFromUrl(location.search));
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  }, [location.key, location.search]);

  // Derivadas del propio password/confirmPassword en cada render — no hace
  // falta guardarlas como estado aparte ni un efecto para mantenerlas al día.
  const isPasswordLengthValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  // El backend redirige aquí con ?error=... si el login con Google falla
  // (el usuario cancela, la config no está lista, el state no cuadra, etc.).
  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) return;

    if (error === 'google_not_configured') {
      showToast(t('app.auth.toastGoogleNotConfigured'), 'error');
    } else if (error === 'google_failed') {
      showToast(t('app.auth.toastGoogleFailed'), 'error');
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
      if (mode === 'forgot') {
        const { error } = await requestPasswordReset(email);
        if (error) throw new Error(error.message || t('app.auth.errorForgotGeneric'));
        showToast(t('app.auth.toastForgotSuccess'), 'success');
        setMode('login');
        setEmail('');
      } else if (mode === 'login') {
        const { user, error } = await signInWithEmail(email, password);
        if (error || !user) throw new Error(error?.message || t('app.auth.errorLoginGeneric'));
        onAuthChange({ user });
        showToast(t('app.auth.toastLoginSuccess'), 'success');
        navigate('/app');
      } else {
        // Strict Frontend Validation
        if (!username.trim()) throw new Error(t('app.auth.errorUsernameRequired'));
        if (password.length < 6) throw new Error(t('app.auth.errorPasswordTooShort'));
        if (password !== confirmPassword) throw new Error(t('app.auth.errorPasswordsMismatch'));

        const { user, error: signUpError } = await signUpWithEmail(email, password, { username });
        if (signUpError || !user) throw new Error(signUpError?.message || t('app.auth.errorSignupGeneric'));

        onAuthChange({ user });
        showToast(t('app.auth.toastSignupSuccess'), 'success');
        navigate('/app');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('app.auth.errorUnexpected'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-cream dark:bg-cream-dark min-h-[calc(100vh-4rem)] flex items-center justify-center">
      {/* Fondo a sangre: object-cover se adapta a lo que necesite el
          formulario (login es corto, registro es más alto) en vez de fijar
          el alto por el aspect-ratio de la imagen — con eso, en pantallas
          bajas (portátiles, 1024×768) la tarjeta no se salía del hueco y
          quedaba tapada por el footer. */}
      <img
        src={pcBg.src}
        alt=""
        aria-hidden="true"
        onLoad={pcBg.onLoad}
        className={`hidden md:block absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${pcBg.loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <img
        src={mobileBg.src}
        alt=""
        aria-hidden="true"
        onLoad={mobileBg.onLoad}
        className={`md:hidden absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${mobileBg.loaded ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="relative z-10 w-full px-4 py-10">
      <div className="animate-in fade-in zoom-in-95 duration-300 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto border border-white/40 dark:border-ink-light/10 transition duration-300 hover:bg-white/90 dark:hover:bg-surface-dark/90 hover:shadow-2xl hover:shadow-primary/5">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-2" textClassName="text-3xl" />
          {/* key={mode}: fuerza un remount (y por tanto un nuevo letter-in /
              animate-in) cada vez que cambia de login/registro/recuperar,
              para que el cambio de título se lea como un estado nuevo y no
              un salto. */}
          <div key={mode} className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-ink dark:text-[#F8F2E6] mt-4">
              <AnimatedTitle
                text={
                  mode === 'forgot'
                    ? t('app.auth.titleForgot')
                    : mode === 'login'
                      ? t('app.auth.titleLogin')
                      : t('app.auth.titleSignup')
                }
              />
            </h2>
            <p className="animate-in fade-in duration-300 delay-300 fill-mode-both text-muted dark:text-muted-dark mt-2 text-sm text-center">
              {mode === 'forgot'
                ? t('app.auth.subtitleForgot')
                : mode === 'login'
                  ? t('app.auth.subtitleLogin')
                  : t('app.auth.subtitleSignup')}
            </p>
          </div>
        </div>

        {mode !== 'forgot' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 border border-ink/15 dark:border-ink-light/15 rounded-xl font-semibold text-body dark:text-body-dark bg-white dark:bg-[#221B12] hover:bg-ink/5 dark:hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0 transition duration-300"
            >
              <GoogleIcon className="w-5 h-5" />
              {t('app.auth.continueWithGoogle')}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-grow h-px bg-ink/10 dark:bg-ink-light/10" />
              <span className="text-xs text-muted dark:text-muted-dark uppercase tracking-wide">{t('app.auth.orWithEmail')}</span>
              <div className="flex-grow h-px bg-ink/10 dark:bg-ink-light/10" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === 'signup' && (
            <div className="animate-in slide-in-from-top-2 fade-in space-y-4">
              <div className="space-y-1">
                <label htmlFor="auth-username" className="text-sm font-medium text-body dark:text-body-dark">{t('app.auth.usernameLabel')}</label>
                <div className="relative">
                  <User aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
                  <input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('app.auth.usernamePlaceholder')}
                    required={mode === 'signup'}
                    className="w-full pl-10 pr-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-ink dark:text-[#F8F2E6]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="auth-email" className="text-sm font-medium text-body dark:text-body-dark">{t('app.auth.emailLabel')}</label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('app.auth.emailPlaceholder')}
                required
                className="w-full pl-10 pr-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-ink dark:text-[#F8F2E6]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <>
              <div className="space-y-1">
                <label htmlFor="auth-password" className="text-sm font-medium text-body dark:text-body-dark">{t('app.auth.passwordLabel')}</label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-ink dark:text-[#F8F2E6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('app.auth.hidePassword') : t('app.auth.showPassword')}
                    className="absolute right-3 top-3.5 text-muted hover:text-[#5C4E3A] dark:hover:text-body-dark transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {mode === 'signup' && <PasswordCheckItem ok={isPasswordLengthValid} label={t('app.profile.passwordMinLength')} />}
              </div>

              {mode === 'signup' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                  <label htmlFor="auth-confirm-password" className="text-sm font-medium text-body dark:text-body-dark">{t('app.auth.confirmPasswordLabel')}</label>
                  <div className="relative">
                    <Lock aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required={mode === 'signup'}
                      className="w-full pl-10 pr-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-ink dark:text-[#F8F2E6]"
                    />
                  </div>
                  <PasswordCheckItem ok={doPasswordsMatch} label={t('app.profile.passwordsMatch')} />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setPassword('');
                    }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {t('app.auth.forgotPasswordLink')}
                  </button>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading || (mode === 'signup' && (!isPasswordLengthValid || !doPasswordsMatch))}
            className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 key="loading" className="w-5 h-5 animate-spin animate-in fade-in duration-150" />
            ) : (
              <span key="idle" className="animate-in fade-in duration-150 flex items-center gap-2">
                {mode === 'forgot' ? t('app.auth.submitForgot') : mode === 'login' ? t('app.auth.submitLogin') : t('app.auth.submitSignup')}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === 'forgot' ? (
            <button
              onClick={() => {
                setMode('login');
                setEmail('');
              }}
              className="text-sm text-muted dark:text-muted-dark hover:text-primary font-medium"
            >
              {t('app.auth.backToLogin')}
            </button>
          ) : (
            <p className="text-sm text-muted dark:text-muted-dark">
              {mode === 'login' ? t('app.auth.noAccount') : t('app.auth.hasAccount')}
              <button
                onClick={() => {
                  // cambia la URL; el efecto de arriba actualiza el formulario
                  setSearchParams({ modo: mode === 'login' ? 'registro' : 'login' }, { replace: true });
                }}
                className="text-primary font-bold hover:underline"
              >
                {mode === 'login' ? t('app.auth.signupLink') : t('app.auth.loginLink')}
              </button>
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Auth;