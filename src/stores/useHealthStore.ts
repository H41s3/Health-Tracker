import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { HealthMetric } from '../types/database';
import { getErrorMessage } from '../utils/errorHandler';

interface HealthState {
  metrics: HealthMetric[];
  loading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchMetrics: (userId: string, startDate?: string, endDate?: string) => Promise<void>;
  addOrUpdateMetric: (userId: string, date: string, data: Partial<HealthMetric>) => Promise<void>;
  getMetricForDate: (date: string) => HealthMetric | undefined;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  metrics: [],
  loading: false,
  isSaving: false,
  error: null,

  fetchMetrics: async (userId: string, startDate?: string, endDate?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ metrics: data || [], loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  addOrUpdateMetric: async (userId: string, date: string, data: Partial<HealthMetric>) => {
    const prevMetrics = get().metrics;
    // optimistic merge/update for this date
    const existing = prevMetrics.find((m) => m.date === date);
    const nextMetrics = existing
      ? prevMetrics.map((m) =>
          m.date === date ? { ...m, ...data } as HealthMetric : m
        )
      : [{ user_id: userId, date, ...data } as HealthMetric, ...prevMetrics];
    set({ metrics: nextMetrics, isSaving: true, error: null });

    try {
      const { error } = await supabase
        .from('health_metrics')
        .upsert(
          { user_id: userId, date, ...data },
          { onConflict: 'user_id,date' }
        );

      if (error) throw error;
      set({ isSaving: false });
    } catch (error) {
      // revert on failure
      set({ metrics: prevMetrics, isSaving: false, error: getErrorMessage(error) });
    }
  },

  getMetricForDate: (date: string) => {
    return get().metrics.find((m) => m.date === date);
  },
}));
