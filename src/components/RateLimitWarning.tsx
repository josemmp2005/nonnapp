import { Clock } from 'lucide-react';

interface RateLimitWarningProps {
  show: boolean;
  message?: string;
}

export const RateLimitWarning = ({ show, message }: RateLimitWarningProps) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md shadow-lg z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
            Límite de frecuencia
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {message || 'Estás usando el plan gratuito (30 solicitudes/minuto con gemini-2.0-flash-lite). Las solicitudes se procesarán automáticamente con un pequeño retraso.'}
          </p>
          <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
            💡 Tip: Activa billing para límites aún mayores
          </div>
        </div>
      </div>
    </div>
  );
};
