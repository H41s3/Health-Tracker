import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { HealthGoals, DEFAULT_GOALS } from '../types/database';
import { getErrorMessage } from '../utils/errorHandler';

interface GoalsState {
  goals: HealthGoals;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchGoals: (userId: string) => Promise<void>;
  updateGoals: (userId: string, goals: Partial<HealthGoals>) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: DEFAULT_GOALS,
  loading: false,
  saving: false,
  error: null,

  fetchGoals: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      // Extract goals from preferences, use defaults for missing values
      const storedGoals = data?.preferences?.health_goals || {};
      const goals: HealthGoals = {
        steps: storedGoals.steps ?? DEFAULT_GOALS.steps,
        water_ml: storedGoals.water_ml ?? DEFAULT_GOALS.water_ml,
        sleep_hours: storedGoals.sleep_hours ?? DEFAULT_GOALS.sleep_hours,
        calories: storedGoals.calories ?? DEFAULT_GOALS.calories,
      };

      set({ goals, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  updateGoals: async (userId: string, newGoals: Partial<HealthGoals>) => {
    const prevGoals = get().goals;
    const updatedGoals = { ...prevGoals, ...newGoals };
    
    // Optimistic update
    set({ goals: updatedGoals, saving: true, error: null });

    try {
      // First get current preferences to merge with
      const { data: profileData } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .maybeSingle();

      const currentPreferences = profileData?.preferences || {};
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          preferences: {
            ...currentPreferences,
            health_goals: updatedGoals,
          },
        });

      if (error) throw error;
      set({ saving: false });
    } catch (error) {
      // Revert on failure
      set({ goals: prevGoals, saving: false, error: getErrorMessage(error) });
    }
  },
}));
