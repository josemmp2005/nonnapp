import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabaseClient } from '../services/supabase';
import type { SubscriptionPlan, SubscriptionData, SubscriptionLimits } from '../types';

interface SubscriptionContextType {
  subscription: SubscriptionData;
  limits: SubscriptionLimits;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  checkRecipeLimit: () => { canGenerate: boolean; remaining: number };
  incrementRecipeCount: () => void;
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

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionData>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener límites del plan actual
  const limits = PLAN_LIMITS[subscription.plan_type];

  // Cargar suscripción desde DB
  const refreshSubscription = async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session?.user) {
        setSubscription(DEFAULT_SUBSCRIPTION);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabaseClient
        .from('subscriptions')
        .select('plan_type, is_active, start_date, end_date')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching subscription:', error);
        setSubscription(DEFAULT_SUBSCRIPTION);
      } else if (data) {
        // Verificar si la suscripción ha expirado
        if (data.end_date) {
          const endDate = new Date(data.end_date);
          if (endDate < new Date()) {
            setSubscription(DEFAULT_SUBSCRIPTION);
            return;
          }
        }

        setSubscription({
          plan_type: data.plan_type as SubscriptionPlan,
          is_active: data.is_active,
          start_date: data.start_date,
          end_date: data.end_date,
        });
      } else {
        setSubscription(DEFAULT_SUBSCRIPTION);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar al montar y cuando cambie la sesión
  useEffect(() => {
    refreshSubscription();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(() => {
      refreshSubscription();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
