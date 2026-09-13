
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Lazy Load Components for Performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const GeneratorPage = lazy(() => import('./components/GeneratorPage'));
const ChefPage = lazy(() => import('./components/ChefPage'));
const PreferencesPage = lazy(() => import('./components/PreferencesPage'));
const ProfileEditPage = lazy(() => import('./components/ProfileEditPage'));
const HistoryPage = lazy(() => import('./components/HistoryPage'));
const RecipeDetailPage = lazy(() => import('./components/RecipeDetailPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./components/VerifyEmailPage'));
const NotFound = lazy(() => import('./components/NotFound'));

// Protected Route Component
interface ProtectedRouteProps {
  children?: React.ReactNode;
  session: any;
  loading: boolean;
}

const ProtectedRoute = ({ children, session, loading }: ProtectedRouteProps) => {
  if (loading) return null;
  if (!session) return <Navigate to="/auth" replace />;
  if (session.user?.email_verified === false) return <EmailVerificationGate email={session.user.email} />;
  return <>{children}</>;
};

// Global Suspense Loader
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
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
    if (!session?.user) {
      setUserProfile(DEFAULT_USER_PROFILE);
      return;
    }
    getUserPreferences().then((profile) => {
      if (mounted) setUserProfile(profile);
    });
    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center transition-colors duration-300">
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
             <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">nonnapp</h1>
             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Encendiendo fogones...</p>
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
                  
                  <Route 
                    path="/app" 
                    element={
                      <ProtectedRoute session={session} loading={loading}>
                        <Dashboard 
                          userProfile={userProfile} 
                          session={session}
                        />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/app/generate" 
                    element={
                      <ProtectedRoute session={session} loading={loading}>
                        <GeneratorPage 
                          userProfile={userProfile} 
                          session={session}
                        />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/app/chef" 
                    element={
                      <ProtectedRoute session={session} loading={loading}>
                        <ChefPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/app/preferences" 
                    element={
                      <ProtectedRoute session={session} loading={loading}>
                        <PreferencesPage 
                          profile={userProfile}
                          setProfile={setUserProfile}
                          session={session}
                        />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/app/profile" 
                    element={
                      <ProtectedRoute session={session} loading={loading}>
                        <ProfileEditPage session={session} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/app/history" 
                    element={
                      <ProtectedRoute session={session} loading={loading}>
                        <HistoryPage session={session} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/app/recipe/:id" 
                    element={
                      <ProtectedRoute session={session} loading={loading}>
                        <RecipeDetailPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </ErrorBoundary>
        </SubscriptionProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
