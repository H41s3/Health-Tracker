import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CycleTracking } from '../types/database';

interface CycleState {
  cycles: CycleTracking[];
  loading: boolean;
  error: string | null;
  fetchCycles: (userId: string) => Promise<void>;
  addCycle: (userId: string, data: Partial<CycleTracking>) => Promise<void>;
  updateCycle: (id: string, data: Partial<CycleTracking>) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  predictNextPeriod: () => { date: Date; cycleLengthAvg: number } | null;
}

export const useCycleStore = create<CycleState>((set, get) => ({
  cycles: [],
  loading: false,
  error: null,

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
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addCycle: async (userId: string, data: Partial<CycleTracking>) => {
    try {
      const { error } = await supabase
        .from('cycle_tracking')
        .insert({ user_id: userId, ...data });

      if (error) throw error;
      await get().fetchCycles(userId);
    } catch (error: any) {
      set({ error: error.message });
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
    } catch (error: any) {
      set({ error: error.message });
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
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  predictNextPeriod: () => {
    const cycles = get().cycles;
    if (cycles.length < 2) return null;

    const cycleLengths = cycles
      .filter((c) => c.cycle_length_days)
      .map((c) => c.cycle_length_days!);

    if (cycleLengths.length === 0) return null;

    const avgLength = Math.round(
      cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
    );

    const lastCycle = cycles[0];
    const lastDate = new Date(lastCycle.period_start_date);
    const predictedDate = new Date(lastDate);
    predictedDate.setDate(predictedDate.getDate() + avgLength);

    return {
      date: predictedDate,
      cycleLengthAvg: avgLength,
    };
  },
}));
