import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { signOut } from '../services/auth';
import Sidebar from './Sidebar';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { useTheme } from '../context/ThemeContext';
import type { AuthSession } from '../services/auth';

interface LayoutProps {
  children: React.ReactNode;
  session: AuthSession | null;
  onAuthChange: (session: AuthSession | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, session, onAuthChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAppPage = location.pathname.startsWith('/app');
  const isLanding = location.pathname === '/';
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
      <div className="min-h-screen bg-cream dark:bg-cream-dark flex transition-colors duration-300">
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
             aria-label="Abrir menú"
             variant="ghost"
             iconOnly
           >
             <Menu className="w-6 h-6" />
           </Button>
        </div>

        <main className="flex-grow lg:pl-20 pt-20 lg:pt-8 px-4 md:px-6 lg:px-8 pb-10 w-full max-w-[1600px] mx-auto relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 font-sans bg-cream dark:bg-cream-dark text-body dark:text-body-dark">
      <header className="backdrop-blur-md shadow-sm sticky top-0 z-50 border-b bg-cream/80 dark:bg-cream-dark/80 border-ink/10 dark:border-ink-light/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="group">
             <Logo className="h-8 w-auto" textClassName="text-lg" />
          </Link>

          <div className="flex items-center gap-4">
            <Button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              variant="ghost"
              iconOnly
              className="hover:rotate-45"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            {session && isVerified ? (
              <>
                <Link to="/app" className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition duration-300 shadow-lg shadow-accent-500/20">
                  Ir a la Cocina
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted dark:text-muted-dark hover:text-red-500 hover:scale-110 active:scale-90 transition duration-300"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : session ? (
              <button
                onClick={handleLogout}
                className="p-2 text-muted dark:text-muted-dark hover:text-red-500 hover:scale-110 active:scale-90 transition duration-300"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link to="/auth" className="px-5 py-2.5 bg-ink dark:bg-ink-light text-ink-light dark:text-ink font-bold text-sm rounded-full hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95 transition duration-300 shadow-lg">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-grow ${isLanding ? 'w-full' : 'container mx-auto max-w-4xl px-4 py-8'}`}>
        {children}
      </main>

      <footer className="mt-auto transition-colors duration-300 border-t bg-cream dark:bg-cream-dark border-ink/10 dark:border-ink-light/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4 text-muted dark:text-muted-dark">
          <div className="flex items-center gap-2">
             <Logo className="w-6 h-6 grayscale opacity-50" showText={false} />
             <p>© {new Date().getFullYear()} nonnapp.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Legal y Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;