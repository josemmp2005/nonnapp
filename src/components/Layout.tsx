/**
 * Estructura común de la app: en `/app` con sesión, barra lateral sobre un
 * fondo de foto; en el resto, cabecera pública (enlaces de la landing, idioma,
 * tema, acceso) y pie.
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { signOut } from '../services/auth';
import Sidebar from './Sidebar';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';
import type { AuthSession } from '../services/auth';
import dashboardBgPc from '../assets/dashboard-background-pc.webp';
import dashboardBgPcDark from '../assets/dashboard-background-pc-dark.webp';
import dashboardBgMobile from '../assets/dashboard-background-mobile.webp';
import dashboardBgMobileDark from '../assets/dashboard-background-mobile-dark.webp';

interface LayoutProps {
  children: React.ReactNode;
  session: AuthSession | null;
  onAuthChange: (session: AuthSession | null) => void;
}

// Enlaces de la cabecera de la landing: solo secciones que existen de verdad.
// Las labels se traducen en el propio render (common.nav.*), aquí solo el ancla.
const LANDING_LINKS = [
  { href: '#recetas', key: 'recipes' },
  { href: '#que-tienes', key: 'whatYouHave' },
  { href: '#nonna', key: 'nonna' },
  { href: '#planes', key: 'plans' },
] as const;

const Layout: React.FC<LayoutProps> = ({ children, session, onAuthChange }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Mismo criterio que en Auth.tsx: crema liso de base mientras carga la
  // foto, fundido en cuanto está lista. Se resetea al cambiar de tema porque
  // ahí SÍ cambia el src (claro/oscuro) y hay que volver a esperar su carga.
  const [isPcBgLoaded, setIsPcBgLoaded] = useState(false);
  const [isMobileBgLoaded, setIsMobileBgLoaded] = useState(false);
  useEffect(() => {
    setIsPcBgLoaded(false);
    setIsMobileBgLoaded(false);
  }, [theme]);

  const isAppPage = location.pathname.startsWith('/app');
  const isLanding = location.pathname === '/';
  // /auth pinta su propio fondo a sangre (login-background-*), necesita el
  // mismo ancho completo que la landing en vez del contenedor max-w-4xl.
  const isFullWidthPage = isLanding || location.pathname === '/auth';
  // /auth abre en login salvo con ?modo=registro (misma regla que Auth.tsx)
  const onLoginScreen = location.pathname === '/auth' && new URLSearchParams(location.search).get('modo') !== 'registro';
  // Con la cuenta sin verificar no hay nada que navegar dentro de /app: no se
  // muestra el sidebar (evita dar la sensación de que hay más app detrás del
  // muro), y el header/footer normales ya traen una forma de volver a inicio.
  const isVerified = session?.user?.email_verified !== false;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      onAuthChange(null);
      navigate('/');
    }
  };

  if (session && isAppPage && isVerified) {
    return (
      <div className="relative min-h-screen bg-cream dark:bg-cream-dark flex transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Entrada sutil al aterrizar en /app viniendo de fuera (login o
            landing): esta rama solo se monta de nuevo cuando se cruza de la
            landing/Auth (session null o isAppPage false) a la app — navegar
            entre páginas ya dentro de /app no vuelve a montar este div, así
            que la animación no se repite en cada cambio de página interno. */}
        {/* Fondo fijo de toda la app autenticada: no se desplaza con el
            scroll (position: fixed), z-0 explícito para que el resto (todo
            en orden posterior en el DOM, o con z-index mayor como el
            Sidebar) quede siempre por encima. Con su propia variante para
            modo oscuro (elegida en JS a partir de useTheme, no con clases
            dark: — así solo se pide al navegador la imagen que hace falta).
            blur-sm muy sutil para que quede de fondo, no en primer plano —
            scale-105 de propina para que el desenfoque no deje ver el borde
            transparente del filtro en los límites de la pantalla. */}
        <img
          src={theme === 'dark' ? dashboardBgPcDark : dashboardBgPc}
          alt=""
          aria-hidden="true"
          onLoad={() => setIsPcBgLoaded(true)}
          className={`hidden md:block fixed inset-0 w-full h-full object-cover scale-105 blur-sm z-0 transition-opacity duration-700 ${isPcBgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <img
          src={theme === 'dark' ? dashboardBgMobileDark : dashboardBgMobile}
          alt=""
          aria-hidden="true"
          onLoad={() => setIsMobileBgLoaded(true)}
          className={`md:hidden fixed inset-0 w-full h-full object-cover scale-105 blur-sm z-0 transition-opacity duration-700 ${isMobileBgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        <Sidebar
          session={session}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-cream/90 dark:bg-cream-dark/90 backdrop-blur-md z-30 shadow-sm flex items-center px-4 justify-between border-b border-ink/10 dark:border-ink-light/10">
           <Logo className="w-8 h-8" textClassName="text-xl" />
           <Button
             onClick={() => setIsMobileMenuOpen(true)}
             aria-label={t('app.sidebar.abrirMenu')}
             variant="ghost"
             iconOnly
           >
             <Menu className="w-6 h-6" />
           </Button>
        </div>

        <main className="relative z-10 flex-grow lg:pl-20 pt-20 lg:pt-8 px-4 md:px-6 lg:px-8 pb-10 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 font-sans bg-cream dark:bg-cream-dark text-body dark:text-body-dark">
      <header className="backdrop-blur-md shadow-sm sticky top-0 z-50 border-b bg-cream/80 dark:bg-cream-dark/80 border-ink/10 dark:border-ink-light/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="group flex-shrink-0">
             <Logo className="h-8 lg:h-10 w-auto" textClassName="text-lg lg:text-2xl" />
          </Link>

          {isLanding && (
            <nav aria-label="Secciones de la página" className="hidden lg:flex items-center gap-8 text-[15px] font-semibold">
              {LANDING_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-body dark:text-body-dark hover:text-primary dark:hover:text-primary transition-colors duration-200"
                >
                  {t(`common.nav.${link.key}`)}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-4">

            <LanguageSwitcher />

            <Button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? t('common.header.enableDark') : t('common.header.enableLight')}
              variant="ghost"
              iconOnly
              className="hover:rotate-45"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            {session && isVerified ? (
              <>
                <Link to="/app" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition duration-300 shadow-lg shadow-primary/20">
                  {t('common.header.goToKitchen')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted dark:text-muted-dark hover:text-red-500 hover:scale-110 active:scale-90 transition duration-300"
                  title={t('common.header.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : session ? (
              <button
                onClick={handleLogout}
                className="p-2 text-muted dark:text-muted-dark hover:text-red-500 hover:scale-110 active:scale-90 transition duration-300"
                title={t('common.header.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <>
                {!onLoginScreen && (
                  <Link to="/auth?modo=login" className="sm:hidden px-4 py-2 bg-ink dark:bg-ink-light text-ink-light dark:text-ink font-bold text-xs rounded-full hover:opacity-90 active:scale-95 transition duration-300 shadow-lg">
                    {t('common.header.login')}
                  </Link>
                )}
                <Link to="/auth?modo=login" className="hidden sm:inline-flex px-5 py-2.5 bg-surface dark:bg-surface-dark border border-ink/15 dark:border-ink-light/15 text-ink dark:text-ink-light font-bold text-sm rounded-full shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition duration-200">
                  {t('common.header.login')}
                </Link>
                <Link to="/auth?modo=registro" className="hidden sm:inline-flex px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-full shadow-lg shadow-primary/25 hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition duration-200">
                  {t('common.header.signup')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-grow ${isFullWidthPage ? 'w-full' : 'container mx-auto max-w-4xl px-4 py-8'}`}>
        {children}
      </main>

      <footer className="mt-auto transition-colors duration-300 border-t bg-cream dark:bg-cream-dark border-ink/10 dark:border-ink-light/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4 text-muted dark:text-muted-dark">
          <div className="flex items-center gap-2">
             <Logo className="w-6 h-6 grayscale opacity-50" showText={false} />
             <p>{t('common.footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-primary transition-colors">{t('common.footer.home')}</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">{t('common.footer.legal')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;