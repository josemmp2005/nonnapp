/**
 * Interruptor accesible con etiqueta y descripción opcional.
 */

import React from 'react';

interface Props {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<Props> = ({ label, checked, onChange, description, disabled }) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <h4 className="text-sm font-medium text-ink dark:text-[#F8F2E6]">{label}</h4>
      {description && <p className="text-xs text-muted dark:text-muted-dark mt-1">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed ${checked ? 'bg-primary' : 'bg-ink/15 dark:bg-[#2A2114]'}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

export default ToggleSwitch;
