import React from 'react';
import { Settings } from 'lucide-react';
import type { UserProfile } from '../../types';

const LEVELS: { key: NonNullable<UserProfile['cooking_skill']>; label: string; description: string }[] = [
  { key: 'beginner', label: 'Principiante', description: 'Instrucciones detalladas y simples.' },
  { key: 'intermediate', label: 'Intermedio', description: 'Equilibrio entre detalle y libertad.' },
  { key: 'advanced', label: 'Avanzado', description: 'Técnicas complejas y menos guía.' },
];

interface Props {
  value: UserProfile['cooking_skill'];
  onChange: (level: UserProfile['cooking_skill']) => void;
}

const SkillLevelSection: React.FC<Props> = ({ value, onChange }) => (
  <section className="bg-white dark:bg-[#18130D] p-6 rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
        <Settings className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">Habilidad Culinaria</h2>
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      {LEVELS.map((level) => (
        <button
          key={level.key}
          onClick={() => onChange(level.key)}
          className={`p-4 rounded-xl border-2 text-left transition ${
            value === level.key
              ? 'border-primary bg-orange-50 dark:bg-orange-900/20 ring-1 ring-primary'
              : 'border-[#241B10]/10 dark:border-[#F5E6CD]/10 hover:border-[#241B10]/15 dark:hover:border-[#F5E6CD]/20'
          }`}
        >
          <div className="font-semibold text-[#241B10] dark:text-[#F8F2E6] capitalize">{level.label}</div>
          <p className="text-xs text-[#6B5D48] dark:text-[#9A8D74] mt-1">{level.description}</p>
        </button>
      ))}
    </div>
  </section>
);

export default SkillLevelSection;
