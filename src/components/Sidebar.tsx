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
  type LucideIcon,
} from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';
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
      group/item flex items-center w-full p-4 transition-all duration-200 overflow-hidden whitespace-nowrap relative
      ${danger ? 'text-[#8C7C63] dark:text-[#7C715E] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
      ${!danger && active ? 'text-primary bg-primary/10 font-semibold' : ''}
      ${!danger && !active ? 'text-[#8C7C63] dark:text-[#7C715E] hover:text-primary dark:hover:text-primary hover:bg-primary/5' : ''}
      ${isUser ? 'md:mb-6 md:mt-4' : ''}
    `}
  >
    {active && !danger && !isUser && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
    )}

    <div className={`flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110 ${isUser ? 'w-10 h-10' : 'w-6 h-6'}`}>
      {isUser && avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-[#241B10]/10 dark:border-[#F5E6CD]/10" />
      ) : (
        <Icon className={`${isUser ? 'w-full h-full p-2 bg-primary/10 text-primary rounded-full' : 'w-6 h-6'}`} />
      )}
    </div>

    <span className={`
      ml-4 font-medium transition-all duration-300
      md:opacity-0 md:group-hover:opacity-100 md:-translate-x-4 md:group-hover:translate-x-0
      ${danger ? 'text-red-500' : (active ? 'text-primary' : 'text-[#3A2E1D] dark:text-[#D4D4D8]')}
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
  const username = session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || 'Chef';
  const avatarUrl = session?.user?.avatar_url;

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-[#18130D] z-50 shadow-xl md:shadow-none border-r border-[#241B10]/10 dark:border-[#F5E6CD]/10
          transition-all duration-300 ease-in-out group
          w-64 md:w-20 md:hover:w-64 flex flex-col py-4 overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="md:hidden w-full flex justify-between items-center px-4 mb-6 flex-shrink-0">
          <Logo className="w-8 h-8" textClassName="text-lg" />
          <button onClick={onClose} className="p-2 text-[#8C7C63] hover:bg-[#241B10]/5 dark:text-[#7C715E] dark:hover:bg-white/5 rounded-full transition-all duration-300 active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <MenuItem
          icon={User}
          isUser
          displayName={username}
          avatarUrl={avatarUrl}
          active={isActive('/app/profile')}
          onClick={() => handleNavigation('/app/profile')}
        />

        <div className="w-full px-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2">
          <div className="h-px bg-[#241B10]/10 dark:bg-[#F5E6CD]/10 w-full"></div>
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
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="group/item flex items-center w-full p-4 text-[#8C7C63] dark:text-[#7C715E] hover:text-primary dark:hover:text-primary hover:bg-primary/5 transition-all duration-200 overflow-hidden whitespace-nowrap mb-1"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 group-hover/item:rotate-45">
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </div>
          <span className="ml-4 font-medium transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 md:-translate-x-4 md:group-hover:translate-x-0 text-[#3A2E1D] dark:text-[#D4D4D8]">
            {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
        </button>

        <div className="w-full px-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 my-2">
          <div className="h-px bg-[#241B10]/10 dark:bg-[#F5E6CD]/10 w-full"></div>
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
