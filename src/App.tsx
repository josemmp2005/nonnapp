/**
 * Raíz de la aplicación: restaura la sesión, monta los providers (tema,
 * toasts, suscripción), define las rutas (públicas y protegidas, con carga
 * diferida) y la pantalla de arranque.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './components/Auth';
import type { UserProfile as UserProfileType } from './types';
import { DEFAULT_USER_PROFILE } from './constants';
import { getCurrentSession } from './services/auth';
import type { AuthSession } from './services/auth';
import { getUserPreferences } from './services/data';
import { Logo } from './components/Logo';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import ErrorBoundary from './components/ErrorBoundary';
import EmailVerificationGate from './components/EmailVerificationGate';
import InstallHelpModal from './components/InstallHelpModal';

// Lazy load components for Performance retrasa la carga del código de un componente hasta que el usuario lo necesita y se va a renderizar por primera vez.
// Ayuda a mejorar el rendimiento de la aplicación.
const LandingPage = lazy(() => import('./components/LandingPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const GeneratorPage = lazy(() => import('./components/GeneratorPage'));
const ChefPage = lazy(() => import('./components/ChefPage'));
const PreferencesPage = lazy(() => import('./components/PreferencesPage'));
const ProfileEditPage = lazy(() => import('./components/ProfileEditPage'));
const HistoryPage = lazy(() => import('./components/HistoryPage'));
const PlannerPage = lazy(() => import('./components/PlannerPage'));
const RecipeDetailPage = lazy(() => import('./components/RecipeDetailPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./components/VerifyEmailPage'));
const NotFound = lazy(() => import('./components/NotFound'));

// Layout route que envuelve todo /app/* (ver su uso más abajo): sin sesión
// manda a /auth, con sesión pero email sin verificar muestra el muro de
// verificación, y si no hay ningún impedimento deja pasar a la página
// concreta vía <Outlet />. No comprueba `loading`: mientras la sesión inicial
// todavía se está restaurando, App entero se queda en la pantalla de arranque
// (ver el `if (loading)` de más abajo) y no llega a montar ni esta ruta ni el
// resto de <Routes> — para cuando esto se renderiza, loading ya es siempre false.
const ProtectedRoute = ({ session }: { session: AuthSession | null }) => {
  if (!session) return <Navigate to="/auth" replace />;
  if (session.user?.email_verified === false) return <EmailVerificationGate email={session.user.email} />;
  return <Outlet />;
};

// Global Suspense Loader
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] animate-in fade-in duration-150">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState<UserProfileType>(DEFAULT_USER_PROFILE);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura la sesión (si la cookie httpOnly sigue siendo válida) al cargar la app.
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { session, error } = await getCurrentSession();
      if (error) console.error('❌ Session error:', error);
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    };

    initSession();
    return () => {
      mounted = false;
    };
  }, []);

  // Login/signup/logout llaman a esto directamente (ver Auth.tsx / Layout.tsx)
  // en vez de un listener global tipo onAuthStateChange.
  const handleAuthChange = (newSession: AuthSession | null) => {
    setSession(newSession);
  };

  // El backend ya marcó el email como verificado; refleja el flag localmente
  // sin esperar a un refetch de /me (el usuario puede estar logueado en esta
  // misma pestaña o venir de otra sesión con el link del correo).
  const handleEmailVerified = () => {
    setSession((prev) => (prev ? { user: { ...prev.user, email_verified: true } } : prev));
  };

  // Cargar preferencias reales del usuario cuando cambia la sesión.
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!session?.user) {
        setUserProfile(DEFAULT_USER_PROFILE);
        return;
      }
      const profile = await getUserPreferences();
      if (mounted) setUserProfile(profile);
    };
    loadProfile();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-cream-dark flex flex-col items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
          <div className="relative w-32 h-32 flex items-end justify-center mb-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-10 z-0 pointer-events-none">
              <div className="steam-particle w-4 h-4 left-6 top-6" style={{ animationDelay: '0s' }}></div>
              <div className="steam-particle w-5 h-5 left-10 top-4" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="animate-boil relative z-10">
              <Logo className="w-24 h-24" showText={false} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-extrabold text-ink dark:text-ink-light tracking-tight">nonnapp</h1>
            <p className="text-sm text-muted dark:text-muted-dark font-medium animate-pulse">{t('common.splash.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <SubscriptionProvider session={session}>
          <ErrorBoundary>
            <Router>
              <Layout
                session={session}
                onAuthChange={handleAuthChange}
              >
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={!session ? <Auth onAuthChange={handleAuthChange} /> : <Navigate to="/app" replace />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage onEmailVerified={handleEmailVerified} />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />

                    <Route element={<ProtectedRoute session={session} />}>
                      <Route path="/app" element={<Dashboard userProfile={userProfile} session={session} />} />
                      <Route path="/app/generate" element={<GeneratorPage userProfile={userProfile} session={session} />} />
                      <Route path="/app/chef" element={<ChefPage />} />
                      <Route
                        path="/app/preferences"
                        element={<PreferencesPage profile={userProfile} setProfile={setUserProfile} session={session} />}
                      />
                      <Route path="/app/profile" element={<ProfileEditPage session={session} />} />
                      <Route path="/app/history" element={<HistoryPage session={session} />} />
                      <Route path="/app/planner" element={<PlannerPage />} />
                      <Route path="/app/recipe/:id" element={<RecipeDetailPage />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
              <InstallHelpModal />
            </Router>
          </ErrorBoundary>
        </SubscriptionProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
