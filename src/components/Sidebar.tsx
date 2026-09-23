import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  PlusCircle,
  Settings,
  History,
  LogOut,
  X,
  Moon,
  Sun,
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  Download,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { useTheme } from '../context/ThemeContext';
import { usePwaInstall } from '../hooks/usePwaInstall';
import type { AuthSession } from '../services/auth';

interface SidebarProps {
  session: AuthSession | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface MenuItemProps {
  icon: LucideIcon;
  label?: string;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
  isUser?: boolean;
  avatarUrl?: string | null;
  displayName?: string;
}

// Fuera del componente Sidebar (no dentro del render) — definirlo ahí dentro
// hacía que React lo tratara como un componente nuevo en cada render de
// Sidebar, perdiendo cualquier estado propio que llegara a tener.
const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  danger = false,
  isUser = false,
  avatarUrl,
  displayName,
}) => (
  <button
    onClick={onClick}
    className={`
      group/item flex items-center w-full p-4 transition duration-200 overflow-hidden whitespace-nowrap relative
      ${danger ? 'text-muted dark:text-muted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
      ${!danger && active ? 'text-primary bg-primary/10 font-semibold' : ''}
      ${!danger && !active ? 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-primary hover:bg-primary/5' : ''}
      ${isUser ? 'lg:mb-6 lg:mt-4' : ''}
    `}
  >
    {active && !danger && !isUser && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
    )}

    <div className={`flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110 ${isUser ? 'w-10 h-10' : 'w-6 h-6'}`}>
      {isUser && avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-ink/10 dark:border-ink-light/10" />
      ) : (
        <Icon className={`${isUser ? 'w-full h-full p-2 bg-primary/10 text-primary rounded-full' : 'w-6 h-6'}`} />
      )}
    </div>

    <span className={`
      ml-4 font-medium transition-[opacity,transform] duration-200 ease-out
      lg:opacity-0 lg:group-hover:opacity-100 lg:-translate-x-3 lg:group-hover:translate-x-0 lg:group-hover:delay-[180ms]
      ${danger ? 'text-red-500' : (active ? 'text-primary' : 'text-body dark:text-body-dark')}
    `}>
      {isUser ? displayName : label}
    </span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({
  session,
  isOpen,
  onClose,
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const pwa = usePwaInstall();
  const username = session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || 'Chef';
  const avatarUrl = session?.user?.avatar_url;

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-surface dark:bg-surface-dark z-50 shadow-xl lg:shadow-none border-r border-ink/10 dark:border-ink-light/10
          transition-[transform,width,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group
          w-64 lg:w-20 lg:hover:w-64 lg:hover:shadow-soft-lg lg:hover:delay-[140ms] flex flex-col py-4 overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="lg:hidden w-full flex justify-between items-center px-4 mb-6 flex-shrink-0">
          <Logo className="w-8 h-8" textClassName="text-lg" />
          <Button onClick={onClose} aria-label="Cerrar menú" variant="ghost" iconOnly>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <MenuItem
          icon={User}
          isUser
          displayName={username}
          avatarUrl={avatarUrl}
          active={isActive('/app/profile')}
          onClick={() => handleNavigation('/app/profile')}
        />

        <div className="w-full px-4 hidden lg:block opacity-0 group-hover:opacity-100 group-hover:delay-[180ms] transition-opacity duration-200 mb-2">
          <div className="h-px bg-ink/10 dark:bg-ink-light/10 w-full"></div>
        </div>

        <MenuItem
          icon={LayoutDashboard}
          label="Inicio"
          active={isActive('/app')}
          onClick={() => handleNavigation('/app')}
        />

        <MenuItem
          icon={UtensilsCrossed}
          label="Mesa de la Nonna"
          active={isActive('/app/chef')}
          onClick={() => handleNavigation('/app/chef')}
        />

        <MenuItem
          icon={PlusCircle}
          label="Nueva Receta"
          active={isActive('/app/generate')}
          onClick={() => handleNavigation('/app/generate')}
        />

        <div className="flex-grow flex flex-col w-full gap-1">
          <MenuItem
            icon={Settings}
            label="Preferencias"
            active={isActive('/app/preferences')}
            onClick={() => handleNavigation('/app/preferences')}
          />

          <MenuItem
            icon={History}
            label="Historial"
            active={isActive('/app/history')}
            onClick={() => handleNavigation('/app/history')}
          />

          <MenuItem
            icon={CalendarDays}
            label="Planificador"
            active={isActive('/app/planner')}
            onClick={() => handleNavigation('/app/planner')}
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="group/item flex items-center w-full p-4 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-primary hover:bg-primary/5 transition duration-200 overflow-hidden whitespace-nowrap mb-1"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 group-hover/item:rotate-45">
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </div>
          <span className="ml-4 font-medium transition-[opacity,transform] duration-200 ease-out lg:opacity-0 lg:group-hover:opacity-100 lg:-translate-x-3 lg:group-hover:translate-x-0 lg:group-hover:delay-[180ms] text-body dark:text-body-dark">
            {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
        </button>

        {pwa.available && (
          <div className="lg:hidden">
            <MenuItem
              icon={Download}
              label="Instalar app"
              onClick={() => {
                void pwa.install();
                onClose();
              }}
            />
          </div>
        )}

        <div className="w-full px-4 hidden lg:block opacity-0 group-hover:opacity-100 group-hover:delay-[180ms] transition-opacity duration-200 my-2">
          <div className="h-px bg-ink/10 dark:bg-ink-light/10 w-full"></div>
        </div>

        <MenuItem
          icon={LogOut}
          label="Cerrar Sesión"
          danger
          onClick={onLogout}
        />

      </aside>
    </>
  );
};

export default Sidebar;
