/**
 * Página `/app/profile`: editar el nombre de usuario, cambiar la contraseña y
 * elegir el idioma.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, Mail, Save, Loader2, Check, Globe } from 'lucide-react';
import { ES, GB, FR, PT } from 'country-flag-icons/react/3x2';
import { updateUsername, updateUserPassword } from '../services/auth';
import { useToast } from '../context/ToastContext';
import type { AuthSession } from '../services/auth';
import { PasswordCheckItem } from './ui/PasswordCheckItem';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/config';

const FLAGS: Record<SupportedLanguage, typeof ES> = { es: ES, en: GB, fr: FR, pt: PT };
const LANGUAGE_NAMES: Record<SupportedLanguage, string> = { es: 'Español', en: 'English', fr: 'Français', pt: 'Português' };

interface Props {
  session: AuthSession | null;
}

const ProfileEditPage: React.FC<Props> = ({ session }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(i18n.language)
    ? (i18n.language as SupportedLanguage)
    : 'es';
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
        throw new Error(profileError.message || t('app.profile.errorSavingProfile'));
      }

      // 2. Update Password if provided
      if (newPassword) {
        if (!isPasswordLengthValid) throw new Error(t('app.profile.errorPasswordLength'));
        if (!doPasswordsMatch) throw new Error(t('app.profile.errorPasswordMismatch'));

        const { error: passwordError } = await updateUserPassword(newPassword);
        if (passwordError) throw passwordError;
      }

      showToast(t('app.profile.toastSuccess'), 'success');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('app.profile.toastGenericError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink dark:text-[#F8F2E6]">{t('app.profile.title')}</h1>
        <p className="text-muted dark:text-muted-dark mt-2">{t('app.profile.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-ink/10 dark:border-ink-light/10">
              <h3 className="text-sm font-bold text-ink dark:text-[#F8F2E6] mb-4">{t('app.profile.avatarCardTitle')}</h3>
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-4 border-ink/15 dark:border-ink-light/15 shadow-lg">
                  <span className="text-5xl font-bold text-white">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <p className="text-sm text-muted dark:text-muted-dark text-center">
                  {t('app.profile.avatarGenerated')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column: Form Fields */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Personal Info Card */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-ink/10 dark:border-ink-light/10 space-y-4">
              <h3 className="text-lg font-bold text-ink dark:text-[#F8F2E6] mb-2 flex items-center gap-2">
                <User aria-hidden="true" className="w-5 h-5 text-muted" /> {t('app.profile.personalInfoTitle')}
              </h3>

              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-ink dark:text-body-dark mb-1">{t('app.profile.emailLabel')}</label>
                <div className="relative opacity-60">
                  <Mail aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl cursor-not-allowed text-body dark:text-body-dark"
                  />
                </div>
                <p className="text-xs text-muted dark:text-muted-dark mt-1">{t('app.profile.emailHint')}</p>
              </div>

              <div>
                <label htmlFor="profile-username" className="block text-sm font-medium text-ink dark:text-body-dark mb-1">{t('app.profile.usernameLabel')}</label>
                <div className="relative">
                  <User aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-ink dark:text-[#F8F2E6]"
                    placeholder={t('app.profile.usernamePlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Language Card */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-ink/10 dark:border-ink-light/10 space-y-4">
              <h3 className="text-lg font-bold text-ink dark:text-[#F8F2E6] mb-2 flex items-center gap-2">
                <Globe aria-hidden="true" className="w-5 h-5 text-muted" /> {t('app.profile.languageTitle')}
              </h3>
              <p className="text-sm text-muted dark:text-muted-dark -mt-2">{t('app.profile.languageSubtitle')}</p>
              <div className="flex flex-wrap gap-3">
                {SUPPORTED_LANGUAGES.map((lng) => {
                  const Flag = FLAGS[lng];
                  const isCurrent = lng === currentLanguage;
                  return (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => void i18n.changeLanguage(lng)}
                      aria-pressed={isCurrent}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                        isCurrent
                          ? 'border-primary bg-primary/10'
                          : 'border-ink/10 dark:border-ink-light/10 hover:border-primary/40'
                      }`}
                    >
                      <Flag className="w-6 h-[17px] rounded-[2px] flex-shrink-0" />
                      <span className="text-sm font-medium text-ink dark:text-[#F8F2E6]">{LANGUAGE_NAMES[lng]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-ink/10 dark:border-ink-light/10 space-y-4">
              <h3 className="text-lg font-bold text-ink dark:text-[#F8F2E6] mb-2 flex items-center gap-2">
                <Lock aria-hidden="true" className="w-5 h-5 text-muted" /> {t('app.profile.securityTitle')}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-new-password" className="block text-sm font-medium text-body dark:text-body-dark mb-1">{t('app.profile.newPasswordLabel')}</label>
                  <input
                    id="profile-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary outline-none text-ink dark:text-[#F8F2E6]"
                    placeholder="••••••••"
                  />
                  {newPassword.length > 0 && <PasswordCheckItem ok={isPasswordLengthValid} label={t('app.profile.passwordMinLength')} />}
                </div>
                <div>
                  <label htmlFor="profile-confirm-password" className="block text-sm font-medium text-body dark:text-body-dark mb-1">{t('app.profile.confirmPasswordLabel')}</label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary outline-none text-ink dark:text-[#F8F2E6]"
                    placeholder="••••••••"
                  />
                  {newPassword.length > 0 && <PasswordCheckItem ok={doPasswordsMatch} label={t('app.profile.passwordsMatch')} />}
                </div>
              </div>
              <p className="text-xs text-muted dark:text-muted-dark italic">
                {t('app.profile.passwordHint')}
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
                    {t('app.profile.saving')}
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    {t('app.profile.saved')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('app.profile.saveChanges')}
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