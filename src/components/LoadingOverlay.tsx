import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';

interface Props {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<Props> = ({ isVisible }) => {
  const { t } = useTranslation();
  const messages = t('app.loadingOverlay.messages', { returnObjects: true }) as string[];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      // Reset síncrono a propósito: sin él, la próxima vez que isVisible
      // vuelva a true el mensaje seguiría por donde se quedó en vez de
      // empezar desde el principio. No hay ninguna operación async que
      // difiera esto a un callback.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 dark:bg-[#130F0A]/95 backdrop-blur-md animate-in fade-in duration-300 transition-colors"
    >
      <div className="text-center max-w-sm px-6 flex flex-col items-center">

        <div aria-hidden="true" className="relative w-32 h-32 mx-auto mb-8 flex items-end justify-center">
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

        <h3 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2 transition-colors">
          {t('app.loadingOverlay.title')}
        </h3>

        <div className="h-8 overflow-hidden relative w-full">
          <p
            key={messageIndex}
            className="text-[#6B5D48] dark:text-[#9A8D74] font-medium animate-in slide-in-from-bottom-2 fade-in duration-300 absolute w-full left-0 top-0 transition-colors"
          >
            {messages[messageIndex]}
          </p>
        </div>

        <div className="mt-8 w-64 bg-primary/10 rounded-full h-1.5 overflow-hidden transition-colors">
          <div className="bg-primary h-full rounded-full animate-progress-indeterminate w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;