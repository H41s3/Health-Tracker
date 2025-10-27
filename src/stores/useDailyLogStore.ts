import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DailyLog, MoodLevel, EnergyLevel } from '../types/database';
import { format } from 'date-fns';

interface DailyLogState {
  dailyLogs: DailyLog[];
  loading: boolean;
  error: string | null;
  
  fetchDailyLogs: (userId: string, startDate?: string, endDate?: string) => Promise<void>;
  logDay: (userId: string, date: string, data: Partial<DailyLog>) => Promise<void>;
  getTodaysLog: () => DailyLog | undefined;
}

export const useDailyLogStore = create<DailyLogState>((set, get) => ({
  dailyLogs: [],
  loading: false,
  error: null,

  fetchDailyLogs: async (userId: string, startDate?: string, endDate?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error) throw error;
      set({ dailyLogs: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  logDay: async (userId: string, date: string, data: Partial<DailyLog>) => {
    try {
      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: userId,
          date,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;
      
      await get().fetchDailyLogs(userId);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  getTodaysLog: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().dailyLogs.find(log => log.date === today);
  },
}));
