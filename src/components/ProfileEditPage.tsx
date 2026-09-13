import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Save, Loader2 } from 'lucide-react';
import { upsertUserProfile, updateUserPassword } from '../services/supabase';
import { useToast } from '../context/ToastContext';

interface Props {
  session: any;
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

  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || '');
      setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || '');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = session.user.id;

      // Update Profile Info (Username only)
      const { error: profileError } = await upsertUserProfile(userId, {
        username,
        email
      });

      if (profileError) {
        throw new Error(profileError.message || "Error guardando el perfil.");
      }

      // 2. Update Password if provided
      if (newPassword) {
        if (newPassword.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
        if (newPassword !== confirmPassword) throw new Error("Las contraseñas no coinciden.");
        
        const { error: passwordError } = await updateUserPassword(newPassword);
        if (passwordError) throw passwordError;
      }

      showToast('Perfil actualizado correctamente.', 'success');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar perfil.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Actualiza tu información personal y seguridad.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Avatar</h3>
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600 shadow-lg">
                  <span className="text-5xl font-bold text-white">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Avatar generado automáticamente
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column: Form Fields */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Personal Info Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" /> Información Personal
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">Email</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl cursor-not-allowed text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">Nombre de Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                    placeholder="Tu nombre visible"
                  />
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-400" /> Seguridad
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                Deja estos campos vacíos si no deseas cambiar tu contraseña.
              </p>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
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