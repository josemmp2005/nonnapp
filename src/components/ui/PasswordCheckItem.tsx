/**
 * Fila de validación en vivo de la contraseña, compartida por Auth,
 * ResetPasswordPage y ProfileEditPage.
 */

import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  ok: boolean;
  label: string;
}

// Fila de validación en vivo (contraseña/confirmación) — compartida entre
// Auth.tsx, ResetPasswordPage.tsx y ProfileEditPage.tsx para que las tres
// pantallas que piden "confirmar contraseña" den el mismo feedback.
export const PasswordCheckItem: React.FC<Props> = ({ ok, label }) => (
  <div className="flex items-center gap-2 mt-1 px-1">
    <span className="relative w-3 h-3 flex-shrink-0">
      <span
        className={`absolute inset-0 rounded-full border border-[#241B10]/20 dark:border-[#F5E6CD]/15 transition-opacity duration-200 ${ok ? 'opacity-0' : 'opacity-100'}`}
      />
      <Check
        className={`absolute inset-0 w-3 h-3 text-green-500 transition-all duration-200 ${ok ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      />
    </span>
    <span className={`text-xs ${ok ? 'text-green-600' : 'text-[#6B5D48] dark:text-[#9A8D74]'}`}>{label}</span>
  </div>
);
