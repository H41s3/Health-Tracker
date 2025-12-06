import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Reminder } from '../types/database';
import { getErrorMessage } from '../utils/errorHandler';

interface RemindersState {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  fetchReminders: (userId: string) => Promise<void>;
  addReminder: (userId: string, data: Partial<Reminder>) => Promise<void>;
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string, isActive: boolean) => Promise<void>;
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  loading: false,
  error: null,

  fetchReminders: async (userId: string) => {
    if (!userId) {
      set({ error: 'User ID is required', loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('time', { ascending: true });

      if (error) throw error;
      set({ reminders: data || [], loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  addReminder: async (userId: string, data: Partial<Reminder>) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .insert({ user_id: userId, ...data });

      if (error) throw error;
      await get().fetchReminders(userId);
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  updateReminder: async (id: string, data: Partial<Reminder>) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      const reminders = get().reminders;
      const reminder = reminders.find((r) => r.id === id);
      if (reminder) {
        await get().fetchReminders(reminder.user_id);
      }
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  deleteReminder: async (id: string) => {
    try {
      const { error} = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ reminders: get().reminders.filter((r) => r.id !== id) });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  toggleReminder: async (id: string, isActive: boolean) => {
    await get().updateReminder(id, { is_active: isActive });
  },
}));
