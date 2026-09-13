import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { signOut } from '../services/supabase';
import Sidebar from './Sidebar';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  session: any;
}

const Layout: React.FC<LayoutProps> = ({ children, session }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAppPage = location.pathname.startsWith('/app');
  const isLanding = location.pathname === '/';

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      navigate('/');
    }
  };

  if (session && isAppPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
        <Sidebar 
          session={session}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 z-30 shadow-sm flex items-center px-4 justify-between border-b border-gray-100 dark:border-gray-700">
           <Logo className="w-8 h-8" textClassName="text-xl" />
           <button 
             onClick={() => setIsMobileMenuOpen(true)}
             className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
           >
             <Menu className="w-6 h-6" />
           </button>
        </div>

        <main className="flex-grow md:pl-20 pt-20 md:pt-8 px-4 md:px-8 pb-10 transition-all duration-300 w-full max-w-[1600px] mx-auto relative">
          <div className="hidden md:flex fixed top-6 right-8 items-center gap-2 opacity-50 select-none pointer-events-none grayscale hover:grayscale-0 transition-all">
             <Logo className="h-9 w-auto" textClassName="text-lg text-gray-400 dark:text-gray-600" />
          </div>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 font-sans">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="group">
             <Logo className="h-8 w-auto" textClassName="text-lg" />
          </Link>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {session ? (
              <>
                <Link to="/app" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                  Ir a la Cocina
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm rounded-full hover:opacity-90 transition-colors shadow-lg">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-grow ${isLanding ? 'w-full' : 'container mx-auto max-w-4xl px-4 py-8'}`}>
        {children}
      </main>

      <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
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