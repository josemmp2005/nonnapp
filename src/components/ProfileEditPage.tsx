import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Save, Loader2, Check } from 'lucide-react';
import { updateUsername, updateUserPassword } from '../services/auth';
import { useToast } from '../context/ToastContext';
import type { AuthSession } from '../services/auth';
import { PasswordCheckItem } from './ui/PasswordCheckItem';

interface Props {
  session: AuthSession | null;
}

const ProfileEditPage: React.FC<Props> = ({ session }) => {
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || '');
      setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || '');
    }
  }, [session]);

  const isPasswordLengthValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update Profile Info (Username only)
      const { error: profileError } = await updateUsername(username);

      if (profileError) {
        throw new Error(profileError.message || "Error guardando el perfil.");
      }

      // 2. Update Password if provided
      if (newPassword) {
        if (!isPasswordLengthValid) throw new Error("La contraseña debe tener al menos 6 caracteres.");
        if (!doPasswordsMatch) throw new Error("Las contraseñas no coinciden.");

        const { error: passwordError } = await updateUserPassword(newPassword);
        if (passwordError) throw passwordError;
      }

      showToast('Perfil actualizado correctamente.', 'success');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar perfil.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#241B10] dark:text-[#F8F2E6]">Editar Perfil</h1>
        <p className="text-[#6B5D48] dark:text-[#9A8D74] mt-2">Actualiza tu información personal y seguridad.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-[#18130D] p-6 rounded-2xl shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10">
              <h3 className="text-sm font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">Avatar</h3>
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-4 border-[#241B10]/15 dark:border-[#F5E6CD]/15 shadow-lg">
                  <span className="text-5xl font-bold text-white">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <p className="text-sm text-[#6B5D48] dark:text-[#9A8D74] text-center">
                  Avatar generado automáticamente
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column: Form Fields */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Personal Info Card */}
            <div className="bg-white dark:bg-[#18130D] p-6 rounded-2xl shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10 space-y-4">
              <h3 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2 flex items-center gap-2">
                <User aria-hidden="true" className="w-5 h-5 text-[#6B5D48]" /> Información Personal
              </h3>

              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-[#241B10] dark:text-[#D4D4D8] mb-1">Email</label>
                <div className="relative opacity-60">
                  <Mail aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-[#6B5D48]" />
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl cursor-not-allowed text-[#3A2E1D] dark:text-[#D4D4D8]"
                  />
                </div>
                <p className="text-xs text-[#6B5D48] dark:text-[#9A8D74] mt-1">El email no se puede cambiar por ahora.</p>
              </div>

              <div>
                <label htmlFor="profile-username" className="block text-sm font-medium text-[#241B10] dark:text-[#D4D4D8] mb-1">Nombre de Usuario</label>
                <div className="relative">
                  <User aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-[#6B5D48]" />
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-[#241B10] dark:text-[#F8F2E6]"
                    placeholder="Tu nombre visible"
                  />
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white dark:bg-[#18130D] p-6 rounded-2xl shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10 space-y-4">
              <h3 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2 flex items-center gap-2">
                <Lock aria-hidden="true" className="w-5 h-5 text-[#6B5D48]" /> Seguridad
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-new-password" className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-1">Nueva Contraseña</label>
                  <input
                    id="profile-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary outline-none text-[#241B10] dark:text-[#F8F2E6]"
                    placeholder="••••••••"
                  />
                  {newPassword.length > 0 && <PasswordCheckItem ok={isPasswordLengthValid} label="Mínimo 6 caracteres" />}
                </div>
                <div>
                  <label htmlFor="profile-confirm-password" className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-1">Confirmar Contraseña</label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/15 dark:border-[#F5E6CD]/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary outline-none text-[#241B10] dark:text-[#F8F2E6]"
                    placeholder="••••••••"
                  />
                  {newPassword.length > 0 && <PasswordCheckItem ok={doPasswordsMatch} label="Las contraseñas coinciden" />}
                </div>
              </div>
              <p className="text-xs text-[#6B5D48] dark:text-[#9A8D74] italic">
                Deja estos campos vacíos si no deseas cambiar tu contraseña.
              </p>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading || (newPassword.length > 0 && (!isPasswordLengthValid || !doPasswordsMatch))}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition active:scale-95 shadow-lg ${saved ? 'bg-green-500' : 'bg-primary hover:bg-orange-600 shadow-orange-200 dark:shadow-none'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditPage;