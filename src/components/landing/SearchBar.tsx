import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Plus } from 'lucide-react';

// `extraClass`: los chips sobrantes se ocultan en anchos donde no caben en una
// sola fila sin pisar la ilustración del hero. El orden importa: debe
// coincidir con landing.searchBar.suggestions en cada idioma.
const SUGGESTION_CLASSES = ['', '', '', '', 'hidden lg:inline-flex', 'hidden xl:inline-flex', 'hidden min-[1400px]:inline-flex'];

// Buscador de la landing: es un gancho visual hacia la generación real de
// recetas, no un buscador con índice propio (Nonnapp genera con IA, no busca
// en una base de recetas) — por eso al enviar simplemente entra a la app;
// `ProtectedRoute` ya manda a /auth si hace falta iniciar sesión, igual que
// el resto de CTAs de la landing. Los chips de abajo rellenan el campo con
// ingredientes de ejemplo. Solo tiene look claro (sin variantes `dark:`)
// porque vive sobre la imagen del hero, que es siempre crema.
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

// `animateIn`: entrada escalonada (barra, luego chips uno a uno) para el hero;
// `baseDelay` es el retraso en ms de la barra, los chips van detrás.
const SearchBar: React.FC<{
  className?: string;
  showSuggestions?: boolean;
  animateIn?: boolean;
  baseDelay?: number;
}> = ({ className = '', showSuggestions = true, animateIn = false, baseDelay = 0 }) => {
  const { t } = useTranslation();
  const suggestions = (t('landing.searchBar.suggestions', { returnObjects: true }) as string[]).map((word, i) => ({
    word,
    extraClass: SUGGESTION_CLASSES[i] || '',
  }));
  const [query, setQuery] = useState('');
  // Placeholder corto en móvil: el largo se corta a mitad de palabra.
  const [isWide, setIsWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  const addSuggestion = (word: string) => {
    setQuery((prev) => (prev.trim() ? `${prev.trim()}, ${word.toLowerCase()}` : word));
    inputRef.current?.focus();
  };

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        style={animateIn ? delay(baseDelay) : undefined}
        className={`${animateIn ? 'hero-in ' : ''}flex items-center gap-2 bg-white rounded-full p-1.5 pl-5 shadow-soft-md border border-ink/5 transition-shadow duration-200 focus-within:shadow-soft-lg focus-within:ring-2 focus-within:ring-primary/25`}
      >
        <Search aria-hidden="true" className="w-5 h-5 text-ink/70 flex-shrink-0" />
        <input
          ref={inputRef}
          id="landing-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isWide ? t('landing.searchBar.placeholderWide') : t('landing.searchBar.placeholderNarrow')}
          aria-label={t('landing.searchBar.ariaLabel')}
          className="min-w-0 flex-grow bg-transparent outline-none text-ink placeholder:text-ink/50 text-sm md:text-[15px] py-2"
        />
        <button
          type="submit"
          className="flex-shrink-0 px-5 md:px-7 py-2.5 md:py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-600 active:scale-[0.97] transition-all duration-200"
        >
          {t('landing.searchBar.submit')}
        </button>
      </form>

      {showSuggestions && (
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {suggestions.map(({ word, extraClass }, i) => (
            <button
              key={word}
              type="button"
              onClick={() => addSuggestion(word)}
              style={animateIn ? delay(baseDelay + 140 + i * 55) : undefined}
              className={`${animateIn ? 'hero-pop ' : ''}${extraClass} px-3.5 py-1.5 bg-white/90 border border-ink/5 rounded-full text-[13px] font-medium text-ink shadow-sm hover:bg-white hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.97] transition-all duration-200`}
            >
              {word}
            </button>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            aria-label={t('landing.searchBar.addIngredientAria')}
            style={animateIn ? delay(baseDelay + 140 + suggestions.length * 55) : undefined}
            className={`${animateIn ? 'hero-pop ' : ''}w-8 h-8 flex items-center justify-center bg-white/90 border border-ink/5 rounded-full text-ink shadow-sm hover:bg-white hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.97] transition-all duration-200`}
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
