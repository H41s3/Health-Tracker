import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { BirthControl, PillLog } from '../types/database';
import { format } from 'date-fns';

interface BirthControlState {
  birthControls: BirthControl[];
  activeBirthControl: BirthControl | null;
  pillLogs: PillLog[];
  loading: boolean;
  error: string | null;
  
  fetchBirthControls: (userId: string) => Promise<void>;
  addBirthControl: (userId: string, data: Partial<BirthControl>) => Promise<void>;
  updateBirthControl: (id: string, data: Partial<BirthControl>) => Promise<void>;
  deactivateBirthControl: (id: string) => Promise<void>;
  
  fetchPillLogs: (birthControlId: string, startDate?: string, endDate?: string) => Promise<void>;
  logPill: (birthControlId: string, userId: string, date: string, taken: boolean, notes?: string) => Promise<void>;
  getTodaysPillLog: (birthControlId: string) => PillLog | undefined;
  getConsecutiveMissedDays: (birthControlId: string) => number;
}

export const useBirthControlStore = create<BirthControlState>((set, get) => ({
  birthControls: [],
  activeBirthControl: null,
  pillLogs: [],
  loading: false,
  error: null,

  fetchBirthControls: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('birth_control')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const active = data?.find(bc => bc.is_active) || null;
      set({ 
        birthControls: data || [], 
        activeBirthControl: active,
        loading: false 
      });
      
      // If there's an active birth control, fetch its pill logs
      if (active && active.type === 'pill') {
        await get().fetchPillLogs(active.id);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addBirthControl: async (userId: string, data: Partial<BirthControl>) => {
    try {
      // Deactivate all existing birth controls first
      const { error: updateError } = await supabase
        .from('birth_control')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (updateError) throw updateError;

      const { data: newBC, error } = await supabase
        .from('birth_control')
        .insert({ 
          user_id: userId, 
          is_active: true,
          ...data 
        })
        .select()
        .single();

      if (error) throw error;
      
      await get().fetchBirthControls(userId);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateBirthControl: async (id: string, data: Partial<BirthControl>) => {
    try {
      const { error } = await supabase
        .from('birth_control')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      const birthControls = get().birthControls;
      const bc = birthControls.find((b) => b.id === id);
      if (bc) {
        await get().fetchBirthControls(bc.user_id);
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deactivateBirthControl: async (id: string) => {
    try {
      const { error } = await supabase
        .from('birth_control')
        .update({ 
          is_active: false,
          end_date: format(new Date(), 'yyyy-MM-dd')
        })
        .eq('id', id);

      if (error) throw error;

      set({ 
        birthControls: get().birthControls.map(bc => 
          bc.id === id ? { ...bc, is_active: false } : bc
        ),
        activeBirthControl: null,
        pillLogs: []
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchPillLogs: async (birthControlId: string, startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('pill_logs')
        .select('*')
        .eq('birth_control_id', birthControlId)
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error) throw error;
      set({ pillLogs: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  logPill: async (birthControlId: string, userId: string, date: string, taken: boolean, notes?: string) => {
    try {
      const { error } = await supabase
        .from('pill_logs')
        .upsert({
          birth_control_id: birthControlId,
          user_id: userId,
          date,
          taken,
          missed: !taken,
          taken_at: taken ? new Date().toISOString() : null,
          notes: notes || null
        }, {
          onConflict: 'birth_control_id,date'
        });

      if (error) throw error;
      
      await get().fetchPillLogs(birthControlId);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  getTodaysPillLog: (birthControlId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().pillLogs.find(log => 
      log.birth_control_id === birthControlId && log.date === today
    );
  },

  getConsecutiveMissedDays: (birthControlId: string) => {
    const logs = get().pillLogs
      .filter(log => log.birth_control_id === birthControlId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let missedCount = 0;
    for (const log of logs) {
      if (log.missed) {
        missedCount++;
      } else {
        break;
      }
    }
    
    return missedCount;
  },
}));
