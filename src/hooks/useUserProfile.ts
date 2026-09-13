import { useState, useEffect } from 'react';

interface UserProfileData {
  username: string;
  avatarUrl: string | null;
  email: string;
}

export const useUserProfile = (session: any): UserProfileData => {
  const [profile, setProfile] = useState<UserProfileData>({
    username: session?.user?.email?.split('@')[0] || 'Chef',
    avatarUrl: null,
    email: session?.user?.email || '',
  });

  useEffect(() => {
    if (!session?.user) {
      setProfile({
        username: 'Chef',
        avatarUrl: null,
        email: '',
      });
      return;
    }

    // Leer solo de metadata - sin llamadas a DB
    setProfile({
      username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Chef',
      avatarUrl: null, // Siempre null, usamos avatar por defecto
      email: session.user.email || '',
    });
  }, [session]);

  return profile;
};
