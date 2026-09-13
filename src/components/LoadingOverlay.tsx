import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

const MESSAGES = [
  "Analizando tus ingredientes...",
  "Consultando con chefs expertos...",
  "Calculando tiempos de cocción...",
  "Diseñando el emplatado perfecto...",
  "Ajustando condimentos...",
  "Generando imagen fotorrealista...",
  "¡Casi listo para servir!"
];

interface Props {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<Props> = ({ isVisible }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-300 transition-colors">
      <div className="text-center max-w-sm px-6 flex flex-col items-center">
        
        <div className="relative w-32 h-32 mx-auto mb-8 flex items-end justify-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-10 z-0 pointer-events-none">
             <div className="steam-particle w-4 h-4 left-6 top-6" style={{ animationDelay: '0s' }}></div>
             <div className="steam-particle w-5 h-5 left-10 top-4" style={{ animationDelay: '0.5s' }}></div>
             <div className="steam-particle w-3 h-3 left-4 top-5" style={{ animationDelay: '1.2s' }}></div>
          </div>

          <div className="animate-boil relative z-10">
            <Logo className="w-24 h-24" showText={false} />
          </div>
          
          <div className="absolute -bottom-2 w-16 h-2 bg-black/10 dark:bg-black/30 rounded-full blur-sm animate-pulse"></div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
          Preparando tu Receta
        </h3>
        
        <div className="h-8 overflow-hidden relative w-full">
          <p 
            key={messageIndex}
            className="text-gray-500 dark:text-gray-400 font-medium animate-in slide-in-from-bottom-2 fade-in duration-300 absolute w-full left-0 top-0 transition-colors"
          >
            {MESSAGES[messageIndex]}
          </p>
        </div>

        <div className="mt-8 w-64 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden transition-colors">
          <div className="bg-primary h-full rounded-full animate-progress-indeterminate w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;