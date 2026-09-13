
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <span className="text-9xl font-extrabold text-[#241B10]/10 dark:text-[#3A2E1D] select-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-bounce">🥘</span>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-3">
        Plato no encontrado
      </h1>
      
      <p className="text-[#8C7C63] dark:text-[#7C715E] max-w-md mb-8 text-lg">
        Parece que la receta que buscas se ha perdido o nunca existió en nuestro recetario.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/app" 
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Crear nueva receta
        </Link>
        <Link 
          to="/" 
          className="px-8 py-3 bg-white dark:bg-[#18130D] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 text-[#3A2E1D] dark:text-[#D4D4D8] font-bold rounded-xl hover:bg-[#FCF6EC] dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
