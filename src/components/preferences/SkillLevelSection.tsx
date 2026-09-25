/**
 * Sección de Preferencias: nivel de habilidad en la cocina (principiante,
 * intermedio, avanzado).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import type { UserProfile } from '../../types';

interface Props {
  value: UserProfile['cooking_skill'];
  onChange: (level: UserProfile['cooking_skill']) => void;
}

const SkillLevelSection: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const levels: { key: NonNullable<UserProfile['cooking_skill']>; label: string; description: string }[] = [
    { key: 'beginner', label: t('app.preferences.skillLevel.beginnerLabel'), description: t('app.preferences.skillLevel.beginnerDesc') },
    { key: 'intermediate', label: t('app.preferences.skillLevel.intermediateLabel'), description: t('app.preferences.skillLevel.intermediateDesc') },
    { key: 'advanced', label: t('app.preferences.skillLevel.advancedLabel'), description: t('app.preferences.skillLevel.advancedDesc') },
  ];

  return (
    <section className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-ink/10 dark:border-ink-light/10 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-ink dark:text-[#F8F2E6]">{t('app.preferences.skillLevel.title')}</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {levels.map((level) => (
          <button
            key={level.key}
            onClick={() => onChange(level.key)}
            className={`p-4 rounded-xl border-2 text-left transition ${
              value === level.key
                ? 'border-primary bg-orange-50 dark:bg-orange-900/20 ring-1 ring-primary'
                : 'border-ink/10 dark:border-ink-light/10 hover:border-ink/15 dark:hover:border-ink-light/20'
            }`}
          >
            <div className="font-semibold text-ink dark:text-[#F8F2E6] capitalize">{level.label}</div>
            <p className="text-xs text-muted dark:text-muted-dark mt-1">{level.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default SkillLevelSection;
