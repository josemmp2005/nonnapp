import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

// Botón "Instalar app": no se pinta si no hay nada que ofrecer (ya instalada,
// o navegador que no soporta instalación). Sin variantes `dark:` porque hoy
// solo se usa sobre el hero, que es siempre crema.
const InstallAppButton: React.FC<Props> = ({ className = '', style }) => {
  const { t } = useTranslation();
  const { available, install } = usePwaInstall();
  if (!available) return null;

  return (
    <button
      type="button"
      onClick={() => void install()}
      style={style}
      className={`inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-full bg-white/90 border border-ink/10 shadow-sm text-sm font-semibold text-ink hover:bg-white hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 ${className}`}
    >
      <Download aria-hidden="true" className="w-4 h-4 text-primary" />
      {t('common.install.cta')}
    </button>
  );
};

export default InstallAppButton;
