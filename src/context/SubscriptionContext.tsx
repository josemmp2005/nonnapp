import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchSubscription } from '../services/data';
import type { AuthSession } from '../services/auth';
import type { SubscriptionPlan, SubscriptionData, SubscriptionLimits } from '../types';

interface SubscriptionContextType {
  subscription: SubscriptionData;
  limits: SubscriptionLimits;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  checkRecipeLimit: () => { canGenerate: boolean; remaining: number };
  incrementRecipeCount: () => void;
  markDailyLimitReached: () => void;
  hasFeature: (feature: keyof SubscriptionLimits) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Límites por plan
const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  Nipote: {
    maxRecipesPerDay: 2,
    hasAdvancedPantry: false,
    hasImageGeneration: false,
    hasChefChat: false,
    hasWeeklyPlanner: false,
    hasFullHistory: false,
    hasPrioritySupport: false,
  },
  Mamma: {
    maxRecipesPerDay: Infinity,
    hasAdvancedPantry: true,
    hasImageGeneration: true,
    hasChefChat: true,
    hasWeeklyPlanner: false,
    hasFullHistory: true,
    hasPrioritySupport: false,
  },
  Nonna: {
    maxRecipesPerDay: Infinity,
    hasAdvancedPantry: true,
    hasImageGeneration: true,
    hasChefChat: true,
    hasWeeklyPlanner: true,
    hasFullHistory: true,
    hasPrioritySupport: true,
  },
};

const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  plan_type: 'Nipote',
  is_active: true,
  start_date: null,
  end_date: null,
};

export const SubscriptionProvider: React.FC<{ children: ReactNode; session: AuthSession | null }> = ({
  children,
  session,
}) => {
  const [subscription, setSubscription] = useState<SubscriptionData>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener límites del plan actual
  const limits = PLAN_LIMITS[subscription.plan_type];

  // Cargar suscripción desde la API
  const refreshSubscription = async () => {
    if (!session?.user) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchSubscription();

      if (data.end_date && new Date(data.end_date) < new Date()) {
        setSubscription(DEFAULT_SUBSCRIPTION);
        return;
      }

      setSubscription({
        plan_type: data.plan_type as SubscriptionPlan,
        is_active: data.is_active,
        start_date: data.start_date,
        end_date: data.end_date,
      });
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar cada vez que cambia la sesión (login/logout)
  useEffect(() => {
    refreshSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Sistema de tracking de recetas generadas (localStorage)
  const getRecipeCountToday = (): number => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('recipe_count');
    
    if (!stored) return 0;
    
    try {
      const { date, count } = JSON.parse(stored);
      return date === today ? count : 0;
    } catch {
      return 0;
    }
  };

  const setRecipeCountToday = (count: number) => {
    const today = new Date().toDateString();
    localStorage.setItem('recipe_count', JSON.stringify({ date: today, count }));
  };

  const checkRecipeLimit = (): { canGenerate: boolean; remaining: number } => {
    const currentCount = getRecipeCountToday();
    const maxRecipes = limits.maxRecipesPerDay;
    
    if (maxRecipes === Infinity) {
      return { canGenerate: true, remaining: Infinity };
    }

    const remaining = Math.max(0, maxRecipes - currentCount);
    return {
      canGenerate: currentCount < maxRecipes,
      remaining,
    };
  };

  const incrementRecipeCount = () => {
    const currentCount = getRecipeCountToday();
    setRecipeCountToday(currentCount + 1);
  };

  // El contador local es solo para pintar "te quedan N" sin esperar al
  // servidor — puede desincronizarse (otro dispositivo, localStorage borrado).
  // El backend es quien de verdad bloquea; cuando avisa de límite alcanzado,
  // esto corrige el contador local para que dejar de mostrar un número que ya
  // sabemos que es falso.
  const markDailyLimitReached = () => {
    if (limits.maxRecipesPerDay !== Infinity) {
      setRecipeCountToday(limits.maxRecipesPerDay);
    }
  };

  const hasFeature = (feature: keyof SubscriptionLimits): boolean => {
    return !!limits[feature];
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        limits,
        isLoading,
        refreshSubscription,
        checkRecipeLimit,
        incrementRecipeCount,
        markDailyLimitReached,
        hasFeature,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
