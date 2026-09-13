
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
    UtensilsCrossed
  } from 'lucide-react';
  import { Logo } from './Logo';
  import { useTheme } from '../context/ThemeContext';

  interface SidebarProps {
    session: any;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
  }

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

    const isActive = (path: string) => {
      return location.pathname === path;
    };

    const MenuItem = ({ 
      icon: Icon, 
      label, 
      path,
      onClick, 
      danger = false,
      isUser = false 
    }: { 
      icon: any, 
      label: string, 
      path?: string,
      onClick?: () => void, 
      danger?: boolean,
      isUser?: boolean
    }) => {
      const active = path ? isActive(path) : false;
      
      return (
        <button
          onClick={() => {
            if (onClick) onClick();
            else if (path) handleNavigation(path);

            if (window.innerWidth < 768) onClose();
          }}
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
            {isUser ? username : label}
          </span>
        </button>
      );
    };

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
            label="Perfil"
            isUser={true}
            path="/app/profile"
          />

          <div className="w-full px-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2">
            <div className="h-px bg-[#241B10]/10 dark:bg-[#F5E6CD]/10 w-full"></div>
          </div>

          <MenuItem 
            icon={LayoutDashboard} 
            label="Inicio" 
            path="/app"
          />

          <MenuItem 
            icon={UtensilsCrossed} 
            label="Mesa de la Nonna" 
            path="/app/chef"
          />

          <MenuItem 
            icon={PlusCircle} 
            label="Nueva Receta" 
            path="/app/generate"
          />

          <div className="flex-grow flex flex-col w-full gap-1">
            <MenuItem 
              icon={Settings} 
              label="Preferencias" 
              path="/app/preferences"
            />

            <MenuItem 
              icon={History} 
              label="Historial" 
              path="/app/history"
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
            danger={true} 
            onClick={onLogout} 
          />

        </aside>
      </>
    );
  };

  export default Sidebar;
  