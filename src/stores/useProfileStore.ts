import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';
import { getErrorMessage } from '../utils/errorHandler';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      set({ profile: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
}));
