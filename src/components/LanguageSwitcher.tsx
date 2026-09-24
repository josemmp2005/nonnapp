import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { ES, GB, FR, PT } from 'country-flag-icons/react/3x2';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/config';

// SVG en vez de emoji de bandera: Windows sin fuente de emoji a color pinta
// "🇫🇷" como el código de región en texto plano ("FR FR"), no la bandera.
const FLAGS: Record<SupportedLanguage, typeof ES> = {
  es: ES,
  en: GB,
  fr: FR,
  pt: PT,
};

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
};

interface Props {
  className?: string;
}

// Desplegable propio en vez de <select> nativo: un <option> solo puede
// mostrar texto, no un SVG, así que para pintar banderas de verdad hace falta
// este patrón (botón + panel flotante que se cierra con click fuera o Escape).
const LanguageSwitcher: React.FC<Props> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = (SUPPORTED_LANGUAGES as readonly string[]).includes(i18n.language)
    ? (i18n.language as SupportedLanguage)
    : 'es';
  const CurrentFlag = FLAGS[current];

  useEscapeKey(() => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const select = (lng: SupportedLanguage) => {
    void i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.languageSwitcher.ariaLabel')}
        className="flex items-center gap-1 pl-1.5 pr-1.5 py-1.5 rounded-full border border-ink/15 dark:border-ink-light/15 hover:border-primary/40 transition-colors"
      >
        <CurrentFlag className="w-5 h-[14px] rounded-[2px] flex-shrink-0" />
        <ChevronDown className={`w-3 h-3 text-ink/60 dark:text-ink-light/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('common.languageSwitcher.ariaLabel')}
          className="absolute right-0 mt-2 py-1.5 bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 rounded-xl shadow-soft-lg z-50 min-w-[9.5rem] animate-in fade-in zoom-in-95 duration-150"
        >
          {SUPPORTED_LANGUAGES.map((lng) => {
            const Flag = FLAGS[lng];
            const isCurrent = lng === current;
            return (
              <button
                key={lng}
                type="button"
                role="option"
                aria-selected={isCurrent}
                onClick={() => select(lng)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-primary/5 ${
                  isCurrent ? 'text-primary font-semibold' : 'text-body dark:text-body-dark'
                }`}
              >
                <Flag className="w-5 h-[14px] rounded-[2px] flex-shrink-0" />
                {LANGUAGE_NAMES[lng]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
