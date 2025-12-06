import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { HealthNote } from '../types/database';
import { getErrorMessage } from '../utils/errorHandler';

interface NotesState {
  notes: HealthNote[];
  loading: boolean;
  error: string | null;
  fetchNotes: (userId: string) => Promise<void>;
  addNote: (userId: string, data: Partial<HealthNote>) => Promise<void>;
  updateNote: (id: string, data: Partial<HealthNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  fetchNotes: async (userId: string) => {
    if (!userId) {
      set({ error: 'User ID is required', loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('health_notes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      set({ notes: data || [], loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  addNote: async (userId: string, data: Partial<HealthNote>) => {
    try {
      const { error } = await supabase
        .from('health_notes')
        .insert({ user_id: userId, ...data });

      if (error) throw error;
      await get().fetchNotes(userId);
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error; // Re-throw so calling code can show toast
    }
  },

  updateNote: async (id: string, data: Partial<HealthNote>) => {
    try {
      const { error } = await supabase
        .from('health_notes')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      const notes = get().notes;
      const note = notes.find((n) => n.id === id);
      if (note) {
        await get().fetchNotes(note.user_id);
      }
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ notes: get().notes.filter((n) => n.id !== id) });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },
}));
