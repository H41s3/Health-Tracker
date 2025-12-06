import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CustomMetric, CustomMetricLog } from '../types/database';
import { getErrorMessage } from '../utils/errorHandler';

interface CustomMetricsState {
  metrics: CustomMetric[];
  logs: CustomMetricLog[];
  loading: boolean;
  error: string | null;
  fetchMetrics: (userId: string) => Promise<void>;
  fetchLogs: (userId: string, metricId?: string) => Promise<void>;
  addMetric: (userId: string, data: Partial<CustomMetric>) => Promise<void>;
  updateMetric: (id: string, data: Partial<CustomMetric>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
  addLog: (userId: string, metricId: string, data: Partial<CustomMetricLog>) => Promise<void>;
  updateLog: (id: string, data: Partial<CustomMetricLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

export const useCustomMetricsStore = create<CustomMetricsState>((set, get) => ({
  metrics: [],
  logs: [],
  loading: false,
  error: null,

  fetchMetrics: async (userId: string) => {
    if (!userId) {
      set({ error: 'User ID is required', loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('custom_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ metrics: data || [], loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  fetchLogs: async (userId: string, metricId?: string) => {
    if (!userId) {
      set({ error: 'User ID is required', loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('custom_metric_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (metricId) {
        query = query.eq('metric_id', metricId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ logs: data || [], loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  addMetric: async (userId: string, data: Partial<CustomMetric>) => {
    try {
      const { error } = await supabase
        .from('custom_metrics')
        .insert({ user_id: userId, ...data });

      if (error) throw error;
      await get().fetchMetrics(userId);
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  updateMetric: async (id: string, data: Partial<CustomMetric>) => {
    try {
      const { error } = await supabase
        .from('custom_metrics')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      const metrics = get().metrics;
      const metric = metrics.find((m) => m.id === id);
      if (metric) {
        await get().fetchMetrics(metric.user_id);
      }
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  deleteMetric: async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_metrics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ metrics: get().metrics.filter((m) => m.id !== id) });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  addLog: async (userId: string, metricId: string, data: Partial<CustomMetricLog>) => {
    try {
      const { error } = await supabase
        .from('custom_metric_logs')
        .insert({ user_id: userId, metric_id: metricId, ...data });

      if (error) throw error;
      await get().fetchLogs(userId, metricId);
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  updateLog: async (id: string, data: Partial<CustomMetricLog>) => {
    try {
      const { error } = await supabase
        .from('custom_metric_logs')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      const logs = get().logs;
      const log = logs.find((l) => l.id === id);
      if (log) {
        await get().fetchLogs(log.user_id);
      }
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  deleteLog: async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_metric_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ logs: get().logs.filter((l) => l.id !== id) });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },
}));
