import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CycleTracking } from '../types/database';
import { predictNextPeriod as predictUtil, PredictionResult } from '../utils/cyclePrediction';

interface CycleState {
  cycles: CycleTracking[];
  loading: boolean;
  error: string | null;
  fetchCycles: (userId: string) => Promise<void>;
  addCycle: (userId: string, data: Partial<CycleTracking>) => Promise<void>;
  updateCycle: (id: string, data: Partial<CycleTracking>) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  predictNextPeriod: () => (PredictionResult | null);
  setLutealLength: (days: number | null) => void;
  lutealLength: number | null;
}

export const useCycleStore = create<CycleState>((set, get) => ({
  cycles: [],
  loading: false,
  error: null,
  lutealLength: null,

  setLutealLength: (days: number | null) => set({ lutealLength: days }),

  fetchCycles: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('cycle_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('period_start_date', { ascending: false });

      if (error) throw error;
      set({ cycles: data || [], loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch cycles';
      set({ error: message, loading: false });
    }
  },

  addCycle: async (userId: string, data: Partial<CycleTracking>) => {
    try {
      const { error } = await supabase
        .from('cycle_tracking')
        .insert({ user_id: userId, ...data });

      if (error) throw error;
      await get().fetchCycles(userId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add cycle';
      set({ error: message });
    }
  },

  updateCycle: async (id: string, data: Partial<CycleTracking>) => {
    try {
      const { error } = await supabase
        .from('cycle_tracking')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      const cycles = get().cycles;
      const cycle = cycles.find((c) => c.id === id);
      if (cycle) {
        await get().fetchCycles(cycle.user_id);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update cycle';
      set({ error: message });
    }
  },

  deleteCycle: async (id: string) => {
    try {
      const { error } = await supabase
        .from('cycle_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({ cycles: get().cycles.filter((c) => c.id !== id) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete cycle';
      set({ error: message });
    }
  },

  predictNextPeriod: () => {
    const cycles = get().cycles;
    if (cycles.length < 1) return null;
    return predictUtil(
      cycles.map(c => ({ period_start_date: c.period_start_date, cycle_length_days: c.cycle_length_days })),
      { lutealDays: get().lutealLength, useWeighted: true }
    );
  },
}));
