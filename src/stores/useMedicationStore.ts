import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Medication, MedicationLog } from '../types/database';
import { format } from 'date-fns';

interface MedicationState {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  loading: boolean;
  error: string | null;
  
  fetchMedications: (userId: string) => Promise<void>;
  addMedication: (userId: string, data: Partial<Medication>) => Promise<void>;
  updateMedication: (id: string, data: Partial<Medication>) => Promise<void>;
  deactivateMedication: (id: string) => Promise<void>;
  
  fetchMedicationLogs: (medicationId: string, startDate?: string, endDate?: string) => Promise<void>;
  logMedication: (medicationId: string, userId: string, date: string, taken: boolean, notes?: string) => Promise<void>;
  getTodaysLog: (medicationId: string) => MedicationLog | undefined;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  medicationLogs: [],
  loading: false,
  error: null,

  fetchMedications: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ medications: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addMedication: async (userId: string, data: Partial<Medication>) => {
    try {
      const { error } = await supabase
        .from('medications')
        .insert({ 
          user_id: userId, 
          is_active: true,
          ...data 
        });

      if (error) throw error;
      await get().fetchMedications(userId);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateMedication: async (id: string, data: Partial<Medication>) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      const medications = get().medications;
      const med = medications.find((m) => m.id === id);
      if (med) {
        await get().fetchMedications(med.user_id);
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deactivateMedication: async (id: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ 
          is_active: false,
          end_date: format(new Date(), 'yyyy-MM-dd')
        })
        .eq('id', id);

      if (error) throw error;

      set({ 
        medications: get().medications.filter(m => m.id !== id)
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchMedicationLogs: async (medicationId: string, startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('medication_logs')
        .select('*')
        .eq('medication_id', medicationId)
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error) throw error;
      set({ medicationLogs: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  logMedication: async (medicationId: string, userId: string, date: string, taken: boolean, notes?: string) => {
    try {
      const { error } = await supabase
        .from('medication_logs')
        .upsert({
          medication_id: medicationId,
          user_id: userId,
          date,
          taken,
          skipped: !taken,
          taken_at: taken ? new Date().toISOString() : null,
          notes: notes || null
        }, {
          onConflict: 'medication_id,date'
        });

      if (error) throw error;
      await get().fetchMedicationLogs(medicationId);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  getTodaysLog: (medicationId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().medicationLogs.find(log => 
      log.medication_id === medicationId && log.date === today
    );
  },
}));
