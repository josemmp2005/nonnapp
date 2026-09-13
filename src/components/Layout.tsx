import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { signOut } from '../services/auth';
import Sidebar from './Sidebar';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  session: any;
  onAuthChange: (session: any) => void;
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
      <div className="min-h-screen bg-[#FCF6EC] dark:bg-[#130F0A] flex transition-colors duration-300">
        <Sidebar
          session={session}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#FCF6EC]/90 dark:bg-[#130F0A]/90 backdrop-blur-md z-30 shadow-sm flex items-center px-4 justify-between border-b border-[#241B10]/10 dark:border-[#F5E6CD]/10">
           <Logo className="w-8 h-8" textClassName="text-xl" />
           <button
             onClick={() => setIsMobileMenuOpen(true)}
             className="p-2 text-[#5C4E3A] dark:text-[#C3B89F] hover:bg-[#241B10]/5 dark:hover:bg-white/5 rounded-lg transition-all duration-300 active:scale-90"
           >
             <Menu className="w-6 h-6" />
           </button>
        </div>

        <main className="flex-grow md:pl-20 pt-20 md:pt-8 px-4 md:px-8 pb-10 transition-all duration-300 w-full max-w-[1600px] mx-auto relative">
          <div className="hidden md:flex fixed top-6 right-8 items-center gap-2 opacity-50 select-none pointer-events-none grayscale hover:grayscale-0 transition-all">
             <Logo className="h-9 w-auto" textClassName="text-lg text-[#8C7C63] dark:text-[#6E6350]" />
          </div>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 font-sans bg-[#FCF6EC] dark:bg-[#130F0A] text-[#3A2E1D] dark:text-[#D4D4D8]">
      <header className="backdrop-blur-md shadow-sm sticky top-0 z-50 border-b bg-[#FCF6EC]/80 dark:bg-[#130F0A]/80 border-[#241B10]/10 dark:border-[#F5E6CD]/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="group">
             <Logo className="h-8 w-auto" textClassName="text-lg" />
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-[#8C7C63] hover:bg-[#241B10]/5 dark:text-[#7C715E] dark:hover:bg-white/5 rounded-full transition-all duration-300 hover:rotate-45 active:scale-90"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {session && isVerified ? (
              <>
                <Link to="/app" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 shadow-lg shadow-orange-500/20">
                  Ir a la Cocina
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#8C7C63] dark:text-[#7C715E] hover:text-red-500 hover:scale-110 active:scale-90 transition-all duration-300"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : session ? (
              <button
                onClick={handleLogout}
                className="p-2 text-[#8C7C63] dark:text-[#7C715E] hover:text-red-500 hover:scale-110 active:scale-90 transition-all duration-300"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link to="/auth" className="px-5 py-2.5 bg-[#241B10] dark:bg-[#F8F2E6] text-[#F8F2E6] dark:text-[#241B10] font-bold text-sm rounded-full hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95 transition-all duration-300 shadow-lg">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-grow ${isLanding ? 'w-full' : 'container mx-auto max-w-4xl px-4 py-8'}`}>
        {children}
      </main>

      <footer className="mt-auto transition-colors duration-300 border-t bg-[#FCF6EC] dark:bg-[#130F0A] border-[#241B10]/10 dark:border-[#F5E6CD]/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4 text-[#8C7C63] dark:text-[#7C715E]">
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