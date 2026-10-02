/**
 * Editor de etiquetas de una receta: chips con opción de quitar, y un campo
 * para escribir una nueva (con sugerencias de las que el usuario ya tiene).
 * Sin persistencia propia — cada cambio local se notifica vía `onChange`, y
 * quien lo usa decide cuándo guardarlo.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  className?: string;
}

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 40;

export const TagEditor: React.FC<Props> = ({ tags, onChange, suggestions = [], className = '' }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const name = raw.trim().slice(0, MAX_TAG_LENGTH);
    if (!name || tags.length >= MAX_TAGS || tags.includes(name)) return;
    onChange([...tags, name]);
    setDraft('');
  };
  const removeTag = (name: string) => onChange(tags.filter((t) => t !== name));

  const unusedSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={t('app.tagEditor.removeAria', { tag })}
              className="p-0.5 rounded-full hover:bg-primary/20"
            >
              <X aria-hidden="true" className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {tags.length < MAX_TAGS && (
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(draft);
              }
            }}
            placeholder={t('app.tagEditor.placeholder')}
            maxLength={MAX_TAG_LENGTH}
            aria-label={t('app.tagEditor.inputAria')}
            className="flex-grow min-w-0 py-2 px-3 text-sm bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-ink dark:text-ink-light"
          />
          <button
            type="button"
            onClick={() => addTag(draft)}
            disabled={!draft.trim()}
            aria-label={t('app.tagEditor.addAria')}
            className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>
      )}

      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {unusedSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="px-2.5 py-1 text-xs text-muted dark:text-muted-dark border border-dashed border-ink/15 dark:border-ink-light/15 rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
